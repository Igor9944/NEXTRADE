import { Pool, PoolClient } from 'pg';
import { AppError } from '../utils/appError';
import { Actor, PaymentProvider, TransactionRecord } from '../types/payment';
import { PaymentRepository } from '../repositories/paymentRepository';
import { OrderRepository } from '../repositories/orderRepository';
import { UserRepository } from '../repositories/userRepository';
import { NotificationService } from './notificationService';

export class PaymentService {
  constructor(
    private pool: Pool,
    private payments: PaymentRepository,
    private orders: OrderRepository,
    private users: UserRepository,
    private provider: PaymentProvider,
    private notifications: NotificationService
  ) {}

  async initiatePayment(actor: Actor, orderId: string) {
    this.assertClientOrAdmin(actor);
    const order = await this.orders.getById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    if (actor.role === 'CLIENT' && order.id_client !== actor.id) {
      throw new AppError('Forbidden', 403);
    }
    if (order.statut === 'ANNULEE') {
      throw new AppError('Cannot pay a cancelled order', 400);
    }
    const existingPaid = await this.payments.findValidatedByOrder(orderId);
    if (existingPaid) {
      return { transaction: existingPaid, checkout_url: null, reused: true };
    }

    const amount = Number(order.montant_total);
    const currency = process.env.PAYMENT_CURRENCY || process.env.INVOICE_CURRENCY || 'XOF';
    const customer = await this.users.findById(order.id_client);

    return this.withTransaction(async (client) => {
      const created = await this.payments.create(
        {
          id_order: orderId,
          montant_paye: amount,
          methode_paiement: this.provider.name.toUpperCase(),
          statut_transaction: 'INITIEE',
          provider: this.provider.name,
          devise: currency
        },
        client
      );
      const gateway = await this.provider.createPayment({
        order_id: orderId,
        transaction_id: created.id_transaction,
        amount,
        currency,
        customer_email: customer?.email
      });
      const pending = await this.payments.updateGatewayReference(
        created.id_transaction,
        gateway.provider_reference,
        'EN_ATTENTE',
        client
      );
      console.log('payment_initiated', {
        transaction_id: created.id_transaction,
        order_id: orderId,
        event: 'INITIATE',
        status: 'EN_ATTENTE',
        external_reference: gateway.provider_reference
      });
      return { transaction: pending, checkout_url: gateway.checkout_url || null, reused: false };
    });
  }

  async getTransaction(actor: Actor, id: string) {
    const transaction = await this.payments.findById(id);
    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }
    await this.assertCanRead(actor, transaction);
    return transaction;
  }

  async listOrderTransactions(actor: Actor, orderId: string) {
    const order = await this.orders.getById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    if (actor.role === 'CLIENT' && order.id_client !== actor.id) {
      throw new AppError('Forbidden', 403);
    }
    if (actor.role !== 'ADMIN' && actor.role !== 'CLIENT') {
      throw new AppError('Forbidden', 403);
    }
    return this.payments.listByOrder(orderId);
  }

  async handleWebhook(headers: Record<string, string | string[] | undefined>, rawBody: Buffer) {
    const event = this.provider.verifyWebhook(headers, rawBody);
    const already = await this.payments.findByProviderEvent(event.event_id);
    if (already) {
      return { transaction: already, duplicate: true, notification: 'SKIPPED' as const };
    }
    const transaction = await this.payments.findByExternalReference(event.provider_reference);
    if (!transaction) {
      throw new AppError('Unknown payment reference', 404);
    }
    if (event.outcome === 'SUCCESS') {
      return this.applySuccess(transaction, event.event_id);
    }
    if (transaction.statut_transaction === 'VALIDEE') {
      return { transaction, duplicate: true, notification: 'SKIPPED' as const };
    }
    let failed;
    try {
      failed = await this.payments.applyProviderResult(transaction.id_transaction, 'ECHOUEE', event.event_id);
    } catch (error: unknown) {
      if (this.isUniqueViolation(error)) {
        const current = await this.payments.findById(transaction.id_transaction);
        return { transaction: current || transaction, duplicate: true, notification: 'SKIPPED' as const };
      }
      throw error;
    }
    console.log('payment_failed', {
      transaction_id: transaction.id_transaction,
      order_id: transaction.id_order,
      event: 'PAYMENT_FAILED',
      status: 'ECHOUEE',
      external_reference: transaction.reference_externe
    });
    return { transaction: failed, duplicate: false, notification: 'SKIPPED' as const };
  }

  private async applySuccess(transaction: TransactionRecord, eventId: string) {
    if (transaction.statut_transaction === 'VALIDEE') {
      return { transaction, duplicate: true, notification: 'SKIPPED' as const };
    }
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      let updated;
      try {
        updated = await this.payments.applyProviderResult(transaction.id_transaction, 'VALIDEE', eventId, client);
      } catch (error: unknown) {
        if (this.isUniqueViolation(error)) {
          await client.query('ROLLBACK');
          const current = await this.payments.findById(transaction.id_transaction);
          return { transaction: current || transaction, duplicate: true, notification: 'SKIPPED' as const };
        }
        throw error;
      }
      const order = await this.orders.getById(transaction.id_order, client);
      if (order && order.statut !== 'PAYEE' && order.statut !== 'ANNULEE') {
        await this.orders.updateStatus(transaction.id_order, 'PAYEE', client);
        await this.orders.addStatusHistory(transaction.id_order, 'PAYEE', client);
      }
      await client.query('COMMIT');
      const customer = order ? await this.users.findById(order.id_client) : null;
      let notification: 'SENT' | 'SKIPPED' = 'SKIPPED';
      if (customer?.email) {
        notification = await this.notifications.handleOrderPaid({
          order_id: transaction.id_order,
          transaction_id: transaction.id_transaction,
          amount: transaction.montant_paye,
          currency: transaction.devise || process.env.PAYMENT_CURRENCY || 'XOF',
          recipient: customer.email,
          external_reference: transaction.reference_externe
        });
      }
      console.log('payment_success', {
        transaction_id: transaction.id_transaction,
        order_id: transaction.id_order,
        event: 'ORDER_PAID',
        status: 'VALIDEE',
        external_reference: transaction.reference_externe
      });
      return { transaction: updated, duplicate: false, notification };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private isUniqueViolation(error: unknown): boolean {
    return Boolean(error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === '23505');
  }

  private assertClientOrAdmin(actor: Actor) {
    if (actor.role !== 'CLIENT' && actor.role !== 'ADMIN') {
      throw new AppError('Forbidden', 403);
    }
  }

  private async assertCanRead(actor: Actor, transaction: TransactionRecord) {
    if (actor.role === 'ADMIN') {
      return;
    }
    if (actor.role !== 'CLIENT') {
      throw new AppError('Forbidden', 403);
    }
    const order = await this.orders.getById(transaction.id_order);
    if (!order || order.id_client !== actor.id) {
      throw new AppError('Forbidden', 403);
    }
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
