export type ShipmentStatus =
  | 'PREPARATION'
  | 'PRISE_EN_CHARGE'
  | 'EXPEDIEE'
  | 'EN_TRANSIT'
  | 'ARRIVEE'
  | 'ARRIVEE_AGENCE'
  | 'DOUANE'
  | 'EN_LIVRAISON'
  | 'LIVREE'
  | 'ECHEC_LIVRAISON'
  | 'ANNULEE';

export interface ShipmentRecord {
  id_shipment: string;
  reference_shipment: string;
  id_order: string;
  transporteur_id: string | null;
  numero_suivi: string | null;
  mode_transport: string | null;
  statut: ShipmentStatus;
  origin: string | null;
  destination: string | null;
  shipping_address: string | null;
  date_preparation: string | null;
  date_expedition: string | null;
  date_livraison_estimee: string | null;
  date_livraison_reelle: string | null;
  recipient_name: string | null;
  delivery_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShipmentStatusHistoryRecord {
  id_history: string;
  id_shipment: string;
  old_status: ShipmentStatus | null;
  new_status: ShipmentStatus;
  changed_by: string | null;
  comment: string | null;
  created_at: string;
}

export interface ShipmentListFilters {
  statut?: ShipmentStatus;
  transporteur_id?: string;
  reference_shipment?: string;
  id_order?: string;
  page?: number;
  limit?: number;
}

export interface CreateShipmentInput {
  id_order: string;
  transporteur_id?: string | null;
  numero_suivi?: string | null;
  mode_transport?: string | null;
  origin?: string | null;
  destination?: string | null;
  shipping_address?: string | null;
  date_livraison_estimee?: string | null;
}

export interface Actor {
  id: string;
  email: string;
  role: string;
}
