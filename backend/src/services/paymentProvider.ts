import crypto from 'crypto';
import { AppError } from '../utils/appError';
import { CreatePaymentResult, PaymentProvider, VerifiedPaymentEvent } from '../types/payment';

export function createHmacSignature(secret: string, timestamp: string, rawBody: Buffer): string {
  return crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody.toString('utf8')}`).digest('hex');
}

function headerValue(headers: Record<string, string | string[] | undefined>, name: string): string {
  const direct = headers[name] ?? headers[name.toLowerCase()];
  if (Array.isArray(direct)) {
    return direct[0] || '';
  }
  return direct || '';
}

export class SignedSandboxPaymentProvider implements PaymentProvider {
  readonly name = 'sandbox';

  constructor(private webhookSecret: string) {
    if (!webhookSecret) {
      throw new AppError('PAYMENT_WEBHOOK_SECRET is required for the sandbox provider', 500);
    }
  }

  async createPayment(input: { transaction_id: string; amount: number; currency: string }): Promise<CreatePaymentResult> {
    return {
      provider_reference: `sbx_${input.transaction_id}`,
      checkout_url: null
    };
  }

  async getPaymentStatus(): Promise<'EN_ATTENTE' | 'VALIDEE' | 'ECHOUEE'> {
    return 'EN_ATTENTE';
  }

  verifyWebhook(headers: Record<string, string | string[] | undefined>, rawBody: Buffer): VerifiedPaymentEvent {
    const signatureHeader = headerValue(headers, 'x-nextrade-signature');
    const match = signatureHeader.match(/t=(\d+),v1=([a-f0-9]+)/i);
    if (!match) {
      throw new AppError('Invalid webhook signature', 401);
    }
    const timestamp = match[1];
    const expected = createHmacSignature(this.webhookSecret, timestamp, rawBody);
    const provided = Buffer.from(match[2], 'utf8');
    const computed = Buffer.from(expected, 'utf8');
    if (provided.length !== computed.length || !crypto.timingSafeEqual(provided, computed)) {
      throw new AppError('Invalid webhook signature', 401);
    }
    const age = Math.abs(Date.now() / 1000 - Number(timestamp));
    if (age > 300) {
      throw new AppError('Webhook timestamp too old', 401);
    }
    let payload: { provider_reference?: string; event_id?: string; outcome?: string };
    try {
      payload = JSON.parse(rawBody.toString('utf8'));
    } catch {
      throw new AppError('Invalid webhook payload', 400);
    }
    if (!payload.provider_reference || !payload.event_id) {
      throw new AppError('Webhook payload missing references', 400);
    }
    if (payload.outcome !== 'SUCCESS' && payload.outcome !== 'FAILED') {
      throw new AppError('Invalid payment outcome', 400);
    }
    return {
      provider_reference: payload.provider_reference,
      event_id: payload.event_id,
      outcome: payload.outcome
    };
  }

  async refund(): Promise<void> {
    throw new AppError('Refund is not implemented', 501);
  }
}

export class StripePaymentProvider implements PaymentProvider {
  readonly name = 'stripe';

  constructor(
    private secretKey: string,
    private webhookSecret: string,
    private apiBase = 'https://api.stripe.com'
  ) {
    if (!secretKey || !webhookSecret) {
      throw new AppError('Stripe keys are not configured', 503);
    }
  }

  async createPayment(input: {
    order_id: string;
    transaction_id: string;
    amount: number;
    currency: string;
  }): Promise<CreatePaymentResult> {
    const zeroDecimal = ['xof', 'xaf', 'jpy', 'krw'].includes(input.currency.toLowerCase());
    const unitAmount = zeroDecimal ? Math.round(input.amount) : Math.round(input.amount * 100);
    const body = new URLSearchParams({
      amount: String(unitAmount),
      currency: input.currency.toLowerCase(),
      'metadata[order_id]': input.order_id,
      'metadata[transaction_id]': input.transaction_id
    });
    const response = await fetch(`${this.apiBase}/v1/payment_intents`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    });
    const data = (await response.json()) as { id?: string; error?: { message?: string } };
    if (!response.ok || !data.id) {
      throw new AppError(data.error?.message || 'Stripe payment creation failed', 502);
    }
    return { provider_reference: data.id, checkout_url: null };
  }

  async getPaymentStatus(provider_reference: string): Promise<'EN_ATTENTE' | 'VALIDEE' | 'ECHOUEE'> {
    const response = await fetch(`${this.apiBase}/v1/payment_intents/${provider_reference}`, {
      headers: { Authorization: `Bearer ${this.secretKey}` }
    });
    const data = (await response.json()) as { status?: string };
    if (data.status === 'succeeded') return 'VALIDEE';
    if (data.status === 'canceled' || data.status === 'requires_payment_method') return 'ECHOUEE';
    return 'EN_ATTENTE';
  }

  verifyWebhook(headers: Record<string, string | string[] | undefined>, rawBody: Buffer): VerifiedPaymentEvent {
    const signatureHeader = headerValue(headers, 'stripe-signature');
    const parts = Object.fromEntries(
      signatureHeader.split(',').map((item) => {
        const [key, ...rest] = item.split('=');
        return [key, rest.join('=')];
      })
    );
    if (!parts.t || !parts.v1) {
      throw new AppError('Invalid Stripe signature', 401);
    }
    const expected = crypto.createHmac('sha256', this.webhookSecret).update(`${parts.t}.${rawBody.toString('utf8')}`).digest('hex');
    const provided = Buffer.from(parts.v1, 'utf8');
    const computed = Buffer.from(expected, 'utf8');
    if (provided.length !== computed.length || !crypto.timingSafeEqual(provided, computed)) {
      throw new AppError('Invalid Stripe signature', 401);
    }
    const event = JSON.parse(rawBody.toString('utf8')) as {
      id: string;
      type: string;
      data?: { object?: { id?: string } };
    };
    const reference = event.data?.object?.id;
    if (!reference) {
      throw new AppError('Stripe event missing payment id', 400);
    }
    if (event.type === 'payment_intent.succeeded') {
      return { provider_reference: reference, event_id: event.id, outcome: 'SUCCESS', raw_type: event.type };
    }
    if (event.type === 'payment_intent.payment_failed') {
      return { provider_reference: reference, event_id: event.id, outcome: 'FAILED', raw_type: event.type };
    }
    throw new AppError('Unhandled Stripe event', 400);
  }

  async refund(): Promise<void> {
    throw new AppError('Refund is not implemented', 501);
  }
}

export function createPaymentProvider(): PaymentProvider {
  const name = (process.env.PAYMENT_PROVIDER || 'sandbox').toLowerCase();
  const webhookSecret =
    process.env.PAYMENT_WEBHOOK_SECRET ||
    (process.env.NODE_ENV === 'test' ? 'test-webhook-secret' : '');
  if (name === 'stripe') {
    return new StripePaymentProvider(
      process.env.PAYMENT_SECRET_KEY || process.env.STRIPE_SECRET_KEY || '',
      process.env.PAYMENT_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || '',
      process.env.PAYMENT_BASE_URL || 'https://api.stripe.com'
    );
  }
  return new SignedSandboxPaymentProvider(webhookSecret);
}
