export type OrderStatus =
  | 'EN_ATTENTE'
  | 'PAYEE'
  | 'EN_PREPARATION'
  | 'EXPEDIEE'
  | 'LIVREE'
  | 'ANNULEE';

export interface CartItemRow {
  id_cart_item: string;
  id_cart: string;
  id_product: string;
  quantite: number;
  created_at?: string;
  updated_at?: string;
}

export interface CartItemDetail {
  id_cart_item: string;
  id_product: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  availableStock: number;
}

export interface CartSummary {
  id_cart: string;
  id_client: string;
  items: CartItemDetail[];
  total: number;
  updated_at?: string;
}

export interface CreateOrderInput {
  adresse_livraison?: string | null;
}

export interface OrderItemRecord {
  id_item: string;
  id_order: string;
  id_product: string;
  quantite: number;
  prix_unitaire_fige: number;
}

export interface OrderRecord {
  id_order: string;
  id_client: string;
  montant_total: number;
  statut: OrderStatus;
  adresse_livraison?: string | null;
  created_at?: string;
  updated_at?: string;
}
