export type DocumentType =
  | 'FACTURE_COMMERCIALE'
  | 'PACKING_LIST'
  | 'CERTIFICAT_ORIGINE'
  | 'DOCUMENT_DOUANE'
  | 'DOCUMENT_TRANSPORT'
  | 'AUTRE';

export type DocumentStatus = 'ACTIF' | 'ARCHIVE' | 'SUPPRIME';

export type InvoiceStatus = 'BROUILLON' | 'ENVOYEE' | 'PAYEE' | 'ANNULEE';

export type FormalityStatus = 'A_FAIRE' | 'EN_COURS' | 'TERMINE' | 'BLOQUE';

export interface Actor {
  id: string;
  email: string;
  role: string;
}

export interface DocumentRecord {
  id_document: string;
  reference_document: string;
  type_document: DocumentType;
  original_file_name: string | null;
  nom_fichier: string | null;
  mime_type: string | null;
  file_size: number | null;
  storage_key: string | null;
  chemin_fichier: string | null;
  uploaded_by: string | null;
  id_order: string | null;
  id_operation: string | null;
  id_shipment: string | null;
  statut: DocumentStatus;
  created_at: string;
  updated_at: string;
}

export interface InvoiceRecord {
  id_invoice: string;
  numero_facture: string;
  id_order: string;
  id_client: string | null;
  devise: string;
  montant_ht: string | number;
  montant_tva: string | number;
  montant_ttc: string | number;
  statut: InvoiceStatus;
  date_emission: string | null;
  date_echeance: string | null;
  id_document: string | null;
  created_at: string;
  updated_at?: string;
}
