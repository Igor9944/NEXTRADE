export type TransactionStatus = 'INITIEE' | 'EN_ATTENTE' | 'VALIDEE' | 'ECHOUEE' | 'REMBOURSEE';

export interface Actor {
  id: string;
  email: string;
  role: string;
}

export interface TransactionRecord {
  id_transaction: string;
  id_order: string;
  montant_paye: string | number;
  methode_paiement: string | null;
  statut_transaction: TransactionStatus;
  reference_externe: string | null;
  provider: string | null;
  devise: string | null;
  provider_event_id: string | null;
  created_at: string;
  updated_at?: string;
}

export interface CreatePaymentResult {
  provider_reference: string;
  checkout_url?: string | null;
}

export interface VerifiedPaymentEvent {
  provider_reference: string;
  event_id: string;
  outcome: 'SUCCESS' | 'FAILED';
  amount?: number;
  raw_type?: string;
}

export interface PaymentProvider {
  readonly name: string;
  createPayment(input: {
    order_id: string;
    transaction_id: string;
    amount: number;
    currency: string;
    customer_email?: string;
  }): Promise<CreatePaymentResult>;
  getPaymentStatus(provider_reference: string): Promise<'EN_ATTENTE' | 'VALIDEE' | 'ECHOUEE'>;
  verifyWebhook(headers: Record<string, string | string[] | undefined>, rawBody: Buffer): VerifiedPaymentEvent;
  refund(_provider_reference: string): Promise<void>;
}
