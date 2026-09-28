export interface PaymentTransaction {
  id_transaction: string;
  id_order: string;
  montant_paye: string | number;
  methode_paiement: string | null;
  statut_transaction: 'INITIEE' | 'EN_ATTENTE' | 'VALIDEE' | 'ECHOUEE' | 'REMBOURSEE';
  reference_externe: string | null;
  provider: string | null;
  devise: string | null;
  created_at: string;
  updated_at?: string;
}

export interface InitiatePaymentResponse {
  status: string;
  data: {
    transaction: PaymentTransaction;
    checkout_url: string | null;
    reused: boolean;
  };
}
