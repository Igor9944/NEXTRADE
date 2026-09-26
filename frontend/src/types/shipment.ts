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

export interface Shipment {
  id_shipment: string;
  reference_shipment: string;
  id_order: string;
  statut: ShipmentStatus;
  transporteur_id: string | null;
  carrier_name: string | null;
  numero_suivi: string | null;
  tracking_number?: string | null;
  mode_transport: string | null;
  origin: string | null;
  destination: string | null;
  shipping_address: string | null;
  date_preparation: string | null;
  date_expedition: string | null;
  date_livraison_estimee: string | null;
  date_arrivee_prevue?: string | null;
  date_livraison: string | null;
  date_livraison_reelle?: string | null;
  recipient_name: string | null;
  delivery_notes?: string | null;
  created_at: string;
  updated_at: string;
  id_client?: string;
  order_statut?: string;
  client_nom?: string | null;
  client_prenom?: string | null;
  client_entreprise?: string | null;
  client_email?: string | null;
}

export interface ShipmentHistoryItem {
  id_history: string;
  old_status?: ShipmentStatus | null;
  new_status: ShipmentStatus;
  changed_by?: string | null;
  comment?: string | null;
  created_at: string;
}

export const SHIPMENT_TIMELINE: { status: ShipmentStatus; label: string }[] = [
  { status: 'PREPARATION', label: 'Préparation' },
  { status: 'PRISE_EN_CHARGE', label: 'Prise en charge' },
  { status: 'EXPEDIEE', label: 'Expédiée' },
  { status: 'EN_TRANSIT', label: 'En transit' },
  { status: 'ARRIVEE_AGENCE', label: 'Arrivée' },
  { status: 'EN_LIVRAISON', label: 'En livraison' },
  { status: 'LIVREE', label: 'Livrée' }
];
