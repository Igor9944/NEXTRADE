export type DocumentType =
  | 'FACTURE_COMMERCIALE'
  | 'PACKING_LIST'
  | 'CERTIFICAT_ORIGINE'
  | 'DOCUMENT_DOUANE'
  | 'DOCUMENT_TRANSPORT'
  | 'AUTRE';

export interface TradeDocument {
  id_document: string;
  reference_document: string;
  type_document: DocumentType;
  original_file_name: string | null;
  nom_fichier: string | null;
  mime_type: string | null;
  file_size: number | null;
  id_order: string | null;
  id_operation: string | null;
  id_shipment: string | null;
  statut: string;
  created_at: string;
}

export interface Invoice {
  id_invoice: string;
  numero_facture: string;
  id_order: string;
  id_client: string | null;
  devise: string;
  montant_ht: string | number;
  montant_tva: string | number;
  montant_ttc: string | number;
  statut: string;
  date_emission: string | null;
  id_document: string | null;
}

export interface HistoryItem {
  id_history: string;
  action: string;
  old_status?: string | null;
  new_status?: string | null;
  created_at: string;
  comment?: string | null;
}

export interface CustomsFormality {
  id_formality: string;
  id_operation: string;
  type_formality: string;
  statut: string;
  created_at: string;
}
