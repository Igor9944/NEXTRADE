import { Pool } from 'pg';
import { AppError } from '../utils/appError';

export interface NotificationProvider {
  sendEmail(input: { to: string; subject: string; text: string }): Promise<void>;
  sendSMS(_input: { to: string; text: string }): Promise<void>;
  sendPush(_input: { to: string; title: string; body: string }): Promise<void>;
  sendWhatsApp(_input: { to: string; text: string }): Promise<void>;
}

export class SmtpNotificationProvider implements NotificationProvider {
  constructor(
    private host: string,
    private port: number,
    private from: string,
    private user?: string,
    private password?: string
  ) {}

  async sendEmail(input: { to: string; subject: string; text: string }): Promise<void> {
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.createTransport({
      host: this.host,
      port: this.port,
      secure: false,
      auth: this.user && this.password ? { user: this.user, pass: this.password } : undefined
    });
    await transporter.sendMail({
      from: this.from,
      to: input.to,
      subject: input.subject,
      text: input.text
    });
  }

  async sendSMS(): Promise<void> {
    throw new AppError('SMS notifications are not implemented', 501);
  }
  async sendPush(): Promise<void> {
    throw new AppError('Push notifications are not implemented', 501);
  }
  async sendWhatsApp(): Promise<void> {
    throw new AppError('WhatsApp notifications are not implemented', 501);
  }
}

export class InMemoryNotificationProvider implements NotificationProvider {
  public emails: Array<{ to: string; subject: string; text: string; sent_at: string }> = [];

  async sendEmail(input: { to: string; subject: string; text: string }): Promise<void> {
    this.emails.push({ ...input, sent_at: new Date().toISOString() });
  }
  async sendSMS(): Promise<void> {
    throw new AppError('SMS notifications are not implemented', 501);
  }
  async sendPush(): Promise<void> {
    throw new AppError('Push notifications are not implemented', 501);
  }
  async sendWhatsApp(): Promise<void> {
    throw new AppError('WhatsApp notifications are not implemented', 501);
  }
}

export class NotificationService {
  constructor(
    private pool: Pool,
    private provider: NotificationProvider
  ) {}

  async handleOrderPaid(payload: {
    order_id: string;
    transaction_id: string;
    amount: string | number;
    currency: string;
    recipient: string;
    external_reference?: string | null;
  }): Promise<'SENT' | 'SKIPPED'> {
    const inserted = await this.pool.query(
      `INSERT INTO notification_events (event_type, aggregate_id, channel, recipient, status)
       VALUES ('ORDER_PAID', $1, 'email', $2, 'PENDING')
       ON CONFLICT (event_type, aggregate_id, channel) DO NOTHING
       RETURNING id_notification, status`,
      [payload.order_id, payload.recipient]
    );
    if (inserted.rowCount === 0) {
      const existing = await this.pool.query(
        `SELECT status FROM notification_events
         WHERE event_type = 'ORDER_PAID' AND aggregate_id = $1 AND channel = 'email'`,
        [payload.order_id]
      );
      if (existing.rows[0]?.status === 'SENT') {
        return 'SKIPPED';
      }
    }
    const text = [
      'Votre paiement a été enregistré.',
      `Commande : ${payload.order_id}`,
      `Montant : ${payload.amount} ${payload.currency}`,
      `Référence transaction : ${payload.transaction_id}`,
      payload.external_reference ? `Référence passerelle : ${payload.external_reference}` : '',
      'Statut : PAYEE'
    ]
      .filter(Boolean)
      .join('\n');
    await this.provider.sendEmail({
      to: payload.recipient,
      subject: `Confirmation de paiement — Commande ${payload.order_id}`,
      text
    });
    await this.pool.query(
      `UPDATE notification_events
       SET status = 'SENT'
       WHERE event_type = 'ORDER_PAID' AND aggregate_id = $1 AND channel = 'email'`,
      [payload.order_id]
    );
    return 'SENT';
  }

  async listForRecipient(recipient: string, role: string) {
    if (role === 'ADMIN') {
      const result = await this.pool.query(
        `SELECT id_notification, event_type, aggregate_id, channel, recipient, status, created_at
         FROM notification_events
         ORDER BY created_at DESC
         LIMIT 50`
      );
      return result.rows;
    }
    const result = await this.pool.query(
      `SELECT id_notification, event_type, aggregate_id, channel, recipient, status, created_at
       FROM notification_events
       WHERE recipient = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [recipient]
    );
    return result.rows;
  }
}

export function createNotificationProvider(): NotificationProvider {
  return new SmtpNotificationProvider(
    process.env.MAIL_HOST || '127.0.0.1',
    Number(process.env.MAIL_PORT || '1025'),
    process.env.MAIL_FROM || 'nextrade@localhost',
    process.env.MAIL_USER || undefined,
    process.env.MAIL_PASSWORD || undefined
  );
}
