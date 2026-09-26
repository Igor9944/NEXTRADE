import { Pool, PoolClient } from 'pg';
import { OrderRepository } from '../repositories/orderRepository';
import { ShipmentRepository, ShipmentWithRelations } from '../repositories/shipmentRepository';
import { UserRepository } from '../repositories/userRepository';
import { OrderStatus } from '../types/order';
import {
  Actor,
  CreateShipmentInput,
  ShipmentListFilters,
  ShipmentStatus,
  ShipmentStatusHistoryRecord
} from '../types/shipment';
import { AppError } from '../utils/appError';
import {
  allowedNextStatuses,
  canTransitionShipmentStatus,
  isShipmentStatus
} from './shipmentStateMachine';

const SHIPPABLE_ORDER_STATUSES: OrderStatus[] = ['PAYEE', 'EN_PREPARATION', 'EXPEDIEE'];

export class ShipmentService {
  constructor(
    private pool: Pool,
    private shipmentRepository: ShipmentRepository,
    private orderRepository: OrderRepository,
    private userRepository: UserRepository
  ) {}

  async createShipment(actor: Actor, payload: CreateShipmentInput) {
    this.assertAdmin(actor);
    if (!payload.id_order) {
      throw new AppError('id_order is required', 400);
    }

    return this.withTransaction(async (client) => {
      const order = await this.orderRepository.getById(payload.id_order, client);
      if (!order) {
        throw new AppError('Order not found', 400);
      }
      if (!SHIPPABLE_ORDER_STATUSES.includes(order.statut)) {
        throw new AppError(`Order status ${order.statut} cannot be shipped`, 400);
      }

      let transporteurId = payload.transporteur_id ?? null;
      if (transporteurId) {
        await this.assertTransporter(transporteurId);
      }

      const reference = await this.shipmentRepository.nextReference(client);
      const shipment = await this.shipmentRepository.create(
        {
          ...payload,
          transporteur_id: transporteurId,
          shipping_address: payload.shipping_address ?? order.adresse_livraison ?? null,
          reference_shipment: reference,
          statut: 'PREPARATION'
        },
        client
      );

      await this.shipmentRepository.addHistory(
        {
          id_shipment: shipment.id_shipment,
          old_status: null,
          new_status: 'PREPARATION',
          changed_by: actor.id,
          comment: 'Shipment created'
        },
        client
      );

      if (order.statut === 'PAYEE') {
        await this.orderRepository.updateStatus(order.id_order, 'EN_PREPARATION', client);
        await this.orderRepository.addStatusHistory(order.id_order, 'EN_PREPARATION', client);
      }

      const created = await this.shipmentRepository.findById(shipment.id_shipment, client);
      return this.present(created ?? (shipment as ShipmentWithRelations), actor);
    });
  }

  async listShipments(actor: Actor, filters: ShipmentListFilters) {
    if (actor.role === 'ADMIN') {
      const result = await this.shipmentRepository.list(filters);
      return {
        ...result,
        shipments: result.shipments.map((shipment) => this.present(shipment, actor))
      };
    }
    throw new AppError('Insufficient permissions', 403);
  }

  async listMyShipments(actor: Actor, filters: ShipmentListFilters) {
    if (actor.role !== 'CLIENT' && actor.role !== 'COMMERCANT') {
      throw new AppError('Insufficient permissions', 403);
    }
    const result = await this.shipmentRepository.list({ ...filters, id_client: actor.id });
    return {
      ...result,
      shipments: result.shipments.map((shipment) => this.present(shipment, actor))
    };
  }

  async listAssignedShipments(actor: Actor, filters: ShipmentListFilters) {
    if (actor.role !== 'TRANSPORTEUR') {
      throw new AppError('Insufficient permissions', 403);
    }
    const result = await this.shipmentRepository.list({
      ...filters,
      assigned_transporteur_id: actor.id
    });
    return {
      ...result,
      shipments: result.shipments.map((shipment) => this.present(shipment, actor))
    };
  }

  async getShipmentById(actor: Actor, id: string) {
    const shipment = await this.requireShipment(id);
    this.assertCanView(actor, shipment);
    const history = await this.shipmentRepository.getHistory(id);
    return {
      shipment: this.present(shipment, actor),
      history: this.presentHistory(history, actor),
      allowed_next_statuses: allowedNextStatuses(shipment.statut, {
        allowCancel: actor.role === 'ADMIN'
      }).filter((status) => this.canActorSetStatus(actor, shipment, status))
    };
  }

  async assignTransporter(actor: Actor, id: string, transporteurId: string) {
    this.assertAdmin(actor);
    if (!transporteurId) {
      throw new AppError('transporteur_id is required', 400);
    }
    await this.assertTransporter(transporteurId);

    const shipment = await this.requireShipment(id);
    if (shipment.statut === 'LIVREE' || shipment.statut === 'ANNULEE') {
      throw new AppError('Cannot assign a transporter to a closed shipment', 400);
    }

    const updated = await this.shipmentRepository.update(id, { transporteur_id: transporteurId });
    const fresh = await this.shipmentRepository.findById(id);
    return this.present(fresh ?? (updated as ShipmentWithRelations) ?? shipment, actor);
  }

  async updateStatus(actor: Actor, id: string, statut: string, comment?: string) {
    if (!isShipmentStatus(statut)) {
      throw new AppError('Invalid shipment status', 400);
    }

    return this.withTransaction(async (client) => {
      const shipment = await this.requireShipment(id, client);
      this.assertCanMutateTransit(actor, shipment);

      if (
        !canTransitionShipmentStatus(shipment.statut, statut, {
          allowCancel: actor.role === 'ADMIN'
        })
      ) {
        throw new AppError(`Invalid status transition from ${shipment.statut} to ${statut}`, 400);
      }

      if (!this.canActorSetStatus(actor, shipment, statut)) {
        throw new AppError('Insufficient permissions', 403);
      }

      if (statut === 'LIVREE') {
        throw new AppError('Use the delivery endpoint to mark a shipment as delivered', 400);
      }

      const extra: Record<string, unknown> = { statut };
      if (statut === 'EXPEDIEE' && !shipment.date_expedition) {
        extra.date_expedition = new Date();
      }

      const updated = await this.shipmentRepository.update(id, extra, client);
      await this.shipmentRepository.addHistory(
        {
          id_shipment: id,
          old_status: shipment.statut,
          new_status: statut,
          changed_by: actor.id,
          comment: comment ?? null
        },
        client
      );
      await this.syncOrderStatus(shipment.id_order, statut, client);

      const fresh = await this.shipmentRepository.findById(id, client);
      return this.present(fresh ?? (updated as ShipmentWithRelations), actor);
    });
  }

  async confirmDelivery(
    actor: Actor,
    id: string,
    payload: { recipient_name?: string; delivery_notes?: string; status?: string }
  ) {
    return this.withTransaction(async (client) => {
      const shipment = await this.requireShipment(id, client);
      this.assertCanMutateTransit(actor, shipment);

      if (payload.status && payload.status !== 'LIVREE') {
        throw new AppError('Delivery can only set status LIVREE', 400);
      }

      if (
        !canTransitionShipmentStatus(shipment.statut, 'LIVREE', {
          allowCancel: false
        })
      ) {
        throw new AppError(`Invalid status transition from ${shipment.statut} to LIVREE`, 400);
      }

      if (!payload.recipient_name || !payload.recipient_name.trim()) {
        throw new AppError('recipient_name is required', 400);
      }

      const updated = await this.shipmentRepository.update(
        id,
        {
          statut: 'LIVREE',
          recipient_name: payload.recipient_name.trim(),
          delivery_notes: payload.delivery_notes ?? null,
          date_livraison_reelle: new Date()
        },
        client
      );

      await this.shipmentRepository.addHistory(
        {
          id_shipment: id,
          old_status: shipment.statut,
          new_status: 'LIVREE',
          changed_by: actor.id,
          comment: payload.delivery_notes ?? 'Delivery confirmed'
        },
        client
      );

      await this.syncOrderStatus(shipment.id_order, 'LIVREE', client);
      const fresh = await this.shipmentRepository.findById(id, client);
      return this.present(fresh ?? (updated as ShipmentWithRelations), actor);
    });
  }

  private canActorSetStatus(actor: Actor, shipment: ShipmentWithRelations, statut: ShipmentStatus): boolean {
    if (actor.role === 'ADMIN') {
      return true;
    }
    if (actor.role !== 'TRANSPORTEUR' || shipment.transporteur_id !== actor.id) {
      return false;
    }
    return statut !== 'ANNULEE' && statut !== 'PREPARATION';
  }

  private assertAdmin(actor: Actor) {
    if (actor.role !== 'ADMIN') {
      throw new AppError('Insufficient permissions', 403);
    }
  }

  private assertCanView(actor: Actor, shipment: ShipmentWithRelations) {
    if (actor.role === 'ADMIN') {
      return;
    }
    if (actor.role === 'TRANSPORTEUR' && shipment.transporteur_id === actor.id) {
      return;
    }
    if ((actor.role === 'CLIENT' || actor.role === 'COMMERCANT') && shipment.id_client === actor.id) {
      return;
    }
    throw new AppError('Forbidden', 403);
  }

  private assertCanMutateTransit(actor: Actor, shipment: ShipmentWithRelations) {
    if (actor.role === 'ADMIN') {
      return;
    }
    if (actor.role === 'TRANSPORTEUR' && shipment.transporteur_id === actor.id) {
      return;
    }
    throw new AppError('Forbidden', 403);
  }

  private async assertTransporter(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('Transporter not found', 400);
    }
    if (user.role !== 'TRANSPORTEUR') {
      throw new AppError('Assigned user is not a transporter', 400);
    }
  }

  private async requireShipment(id: string, client?: PoolClient): Promise<ShipmentWithRelations> {
    const shipment = await this.shipmentRepository.findById(id, client);
    if (!shipment) {
      throw new AppError('Shipment not found', 404);
    }
    return shipment;
  }

  private async syncOrderStatus(orderId: string, shipmentStatus: ShipmentStatus, client: PoolClient) {
    const order = await this.orderRepository.getById(orderId, client);
    if (!order || order.statut === 'ANNULEE' || order.statut === 'LIVREE') {
      return;
    }

    let next: OrderStatus | null = null;
    if (shipmentStatus === 'LIVREE') {
      const counts = await this.shipmentRepository.countByOrder(orderId, client);
      if (counts.total > 0 && counts.delivered === counts.total) {
        next = 'LIVREE';
      } else if (order.statut === 'PAYEE' || order.statut === 'EN_PREPARATION') {
        next = 'EXPEDIEE';
      }
    } else if (
      ['EXPEDIEE', 'EN_TRANSIT', 'ARRIVEE', 'ARRIVEE_AGENCE', 'DOUANE', 'EN_LIVRAISON', 'ECHEC_LIVRAISON'].includes(
        shipmentStatus
      )
    ) {
      if (order.statut === 'PAYEE' || order.statut === 'EN_PREPARATION') {
        next = 'EXPEDIEE';
      }
    } else if (shipmentStatus === 'PRISE_EN_CHARGE' || shipmentStatus === 'PREPARATION') {
      if (order.statut === 'PAYEE') {
        next = 'EN_PREPARATION';
      }
    }

    if (next && next !== order.statut) {
      await this.orderRepository.updateStatus(orderId, next, client);
      await this.orderRepository.addStatusHistory(orderId, next, client);
    }
  }

  private present(shipment: ShipmentWithRelations, actor: Actor) {
    const carrierName =
      shipment.transporteur_entreprise ||
      [shipment.transporteur_prenom, shipment.transporteur_nom].filter(Boolean).join(' ') ||
      null;

    const base = {
      id_shipment: shipment.id_shipment,
      reference_shipment: shipment.reference_shipment,
      id_order: shipment.id_order,
      statut: shipment.statut,
      transporteur_id: shipment.transporteur_id,
      carrier_name: carrierName,
      numero_suivi: shipment.numero_suivi,
      tracking_number: shipment.numero_suivi,
      mode_transport: shipment.mode_transport,
      origin: shipment.origin,
      destination: shipment.destination,
      shipping_address: shipment.shipping_address,
      date_preparation: shipment.date_preparation,
      date_expedition: shipment.date_expedition,
      date_livraison_estimee: shipment.date_livraison_estimee,
      date_arrivee_prevue: shipment.date_livraison_estimee,
      date_livraison: shipment.date_livraison_reelle,
      date_livraison_reelle: shipment.date_livraison_reelle,
      recipient_name: shipment.recipient_name,
      delivery_notes: actor.role === 'CLIENT' ? undefined : shipment.delivery_notes,
      created_at: shipment.created_at,
      updated_at: shipment.updated_at
    };

    if (actor.role === 'ADMIN') {
      return {
        ...base,
        delivery_notes: shipment.delivery_notes,
        id_client: shipment.id_client,
        order_statut: shipment.order_statut,
        client_nom: shipment.client_nom,
        client_prenom: shipment.client_prenom,
        client_entreprise: shipment.client_entreprise,
        client_email: shipment.client_email
      };
    }

    return base;
  }

  private presentHistory(history: ShipmentStatusHistoryRecord[], actor: Actor) {
    if (actor.role === 'CLIENT') {
      return history.map((item) => ({
        id_history: item.id_history,
        old_status: item.old_status,
        new_status: item.new_status,
        created_at: item.created_at
      }));
    }
    return history;
  }

  private async withTransaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await work(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
