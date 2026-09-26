import { Pool, PoolClient } from 'pg';
import {
  CreateShipmentInput,
  ShipmentListFilters,
  ShipmentRecord,
  ShipmentStatus,
  ShipmentStatusHistoryRecord
} from '../types/shipment';

type Queryable = Pool | PoolClient;

const SHIPMENT_COLUMNS = `
  id_shipment, reference_shipment, id_order, transporteur_id, numero_suivi, mode_transport,
  statut, origin, destination, shipping_address, date_preparation, date_expedition,
  date_livraison_estimee, date_livraison_reelle, recipient_name, delivery_notes,
  created_at, updated_at
`;

export interface ShipmentWithRelations extends ShipmentRecord {
  order_statut?: string;
  id_client?: string;
  client_nom?: string | null;
  client_prenom?: string | null;
  client_entreprise?: string | null;
  client_email?: string | null;
  transporteur_nom?: string | null;
  transporteur_prenom?: string | null;
  transporteur_entreprise?: string | null;
}

export class ShipmentRepository {
  constructor(private pool: Pool) {}

  private db(client?: Queryable): Queryable {
    return client ?? this.pool;
  }

  async nextReference(client: Queryable): Promise<string> {
    const year = new Date().getUTCFullYear();
    const result = await client.query(
      `INSERT INTO shipment_reference_counters (year, last_value)
       VALUES ($1, 1)
       ON CONFLICT (year) DO UPDATE
         SET last_value = shipment_reference_counters.last_value + 1
       RETURNING last_value`,
      [year]
    );
    const sequence = Number(result.rows[0].last_value);
    return `SHP-${year}-${String(sequence).padStart(6, '0')}`;
  }

  async create(
    data: CreateShipmentInput & { reference_shipment: string; statut: ShipmentStatus },
    client?: Queryable
  ): Promise<ShipmentRecord> {
    const result = await this.db(client).query(
      `INSERT INTO shipments (
         reference_shipment, id_order, transporteur_id, numero_suivi, mode_transport,
         statut, origin, destination, shipping_address, date_preparation,
         date_livraison_estimee
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10)
       RETURNING ${SHIPMENT_COLUMNS}`,
      [
        data.reference_shipment,
        data.id_order,
        data.transporteur_id ?? null,
        data.numero_suivi ?? null,
        data.mode_transport ?? null,
        data.statut,
        data.origin ?? null,
        data.destination ?? null,
        data.shipping_address ?? null,
        data.date_livraison_estimee ?? null
      ]
    );
    return result.rows[0];
  }

  async findById(id_shipment: string, client?: Queryable): Promise<ShipmentWithRelations | null> {
    const result = await this.db(client).query(
      `SELECT s.id_shipment, s.reference_shipment, s.id_order, s.transporteur_id, s.numero_suivi,
              s.mode_transport, s.statut, s.origin, s.destination, s.shipping_address,
              s.date_preparation, s.date_expedition, s.date_livraison_estimee,
              s.date_livraison_reelle, s.recipient_name, s.delivery_notes,
              s.created_at, s.updated_at,
              o.statut AS order_statut, o.id_client,
              c.nom AS client_nom, c.prenom AS client_prenom,
              c.nom_entreprise AS client_entreprise, c.email AS client_email,
              t.nom AS transporteur_nom, t.prenom AS transporteur_prenom,
              t.nom_entreprise AS transporteur_entreprise
       FROM shipments s
       JOIN orders o ON o.id_order = s.id_order
       LEFT JOIN users c ON c.id_user = o.id_client
       LEFT JOIN users t ON t.id_user = s.transporteur_id
       WHERE s.id_shipment = $1`,
      [id_shipment]
    );
    return result.rows[0] || null;
  }

  async list(
    filters: ShipmentListFilters & { id_client?: string; assigned_transporteur_id?: string }
  ): Promise<{ shipments: ShipmentWithRelations[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(50, Math.max(1, filters.limit ?? 10));
    const where: string[] = [];
    const values: unknown[] = [];
    let index = 1;

    if (filters.statut) {
      where.push(`s.statut = $${index++}`);
      values.push(filters.statut);
    }
    if (filters.transporteur_id) {
      where.push(`s.transporteur_id = $${index++}`);
      values.push(filters.transporteur_id);
    }
    if (filters.assigned_transporteur_id) {
      where.push(`s.transporteur_id = $${index++}`);
      values.push(filters.assigned_transporteur_id);
    }
    if (filters.reference_shipment) {
      where.push(`s.reference_shipment ILIKE $${index++}`);
      values.push(`%${filters.reference_shipment}%`);
    }
    if (filters.id_order) {
      where.push(`s.id_order = $${index++}`);
      values.push(filters.id_order);
    }
    if (filters.id_client) {
      where.push(`o.id_client = $${index++}`);
      values.push(filters.id_client);
    }

    const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const countResult = await this.pool.query(
      `SELECT COUNT(*)::int AS total
       FROM shipments s
       JOIN orders o ON o.id_order = s.id_order
       ${whereSql}`,
      values
    );
    const total = countResult.rows[0].total as number;
    const totalPages = Math.max(1, Math.ceil(total / limit) || 1);
    const safePage = Math.min(page, totalPages);
    const offset = (safePage - 1) * limit;

    const result = await this.pool.query(
      `SELECT s.id_shipment, s.reference_shipment, s.id_order, s.transporteur_id, s.numero_suivi,
              s.mode_transport, s.statut, s.origin, s.destination, s.shipping_address,
              s.date_preparation, s.date_expedition, s.date_livraison_estimee,
              s.date_livraison_reelle, s.recipient_name, s.delivery_notes,
              s.created_at, s.updated_at,
              o.statut AS order_statut, o.id_client,
              c.nom AS client_nom, c.prenom AS client_prenom,
              c.nom_entreprise AS client_entreprise, c.email AS client_email,
              t.nom AS transporteur_nom, t.prenom AS transporteur_prenom,
              t.nom_entreprise AS transporteur_entreprise
       FROM shipments s
       JOIN orders o ON o.id_order = s.id_order
       LEFT JOIN users c ON c.id_user = o.id_client
       LEFT JOIN users t ON t.id_user = s.transporteur_id
       ${whereSql}
       ORDER BY s.created_at DESC
       LIMIT $${index} OFFSET $${index + 1}`,
      [...values, limit, offset]
    );

    return {
      shipments: result.rows,
      total,
      page: safePage,
      limit,
      totalPages
    };
  }

  async update(
    id_shipment: string,
    fields: Partial<{
      transporteur_id: string | null;
      numero_suivi: string | null;
      mode_transport: string | null;
      statut: ShipmentStatus;
      origin: string | null;
      destination: string | null;
      shipping_address: string | null;
      date_expedition: string | Date | null;
      date_livraison_estimee: string | null;
      date_livraison_reelle: string | Date | null;
      recipient_name: string | null;
      delivery_notes: string | null;
    }>,
    client?: Queryable
  ): Promise<ShipmentRecord | null> {
    const entries = Object.entries(fields).filter(([, value]) => value !== undefined);
    if (entries.length === 0) {
      const current = await this.findById(id_shipment, client);
      return current;
    }

    const sets: string[] = [];
    const values: unknown[] = [];
    let index = 1;
    for (const [key, value] of entries) {
      sets.push(`${key} = $${index++}`);
      values.push(value);
    }
    values.push(id_shipment);

    const result = await this.db(client).query(
      `UPDATE shipments SET ${sets.join(', ')}
       WHERE id_shipment = $${index}
       RETURNING ${SHIPMENT_COLUMNS}`,
      values
    );
    return result.rows[0] || null;
  }

  async addHistory(
    data: {
      id_shipment: string;
      old_status: ShipmentStatus | null;
      new_status: ShipmentStatus;
      changed_by: string;
      comment?: string | null;
    },
    client?: Queryable
  ): Promise<ShipmentStatusHistoryRecord> {
    const result = await this.db(client).query(
      `INSERT INTO shipment_status_history (id_shipment, old_status, new_status, changed_by, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id_history, id_shipment, old_status, new_status, changed_by, comment, created_at`,
      [data.id_shipment, data.old_status, data.new_status, data.changed_by, data.comment ?? null]
    );
    return result.rows[0];
  }

  async getHistory(id_shipment: string): Promise<ShipmentStatusHistoryRecord[]> {
    const result = await this.pool.query(
      `SELECT id_history, id_shipment, old_status, new_status, changed_by, comment, created_at
       FROM shipment_status_history
       WHERE id_shipment = $1
       ORDER BY created_at ASC`,
      [id_shipment]
    );
    return result.rows;
  }

  async countByOrder(id_order: string, client?: Queryable): Promise<{ total: number; delivered: number }> {
    const result = await this.db(client).query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE statut = 'LIVREE')::int AS delivered
       FROM shipments
       WHERE id_order = $1 AND statut <> 'ANNULEE'`,
      [id_order]
    );
    return result.rows[0];
  }
}
