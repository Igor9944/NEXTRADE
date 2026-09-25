export type ImportExportOperationType = 'IMPORT' | 'EXPORT';

export type ImportExportOperationStatus =
  | 'PREPARATION'
  | 'EXPEDIEE'
  | 'EN_TRANSIT'
  | 'ARRIVEE'
  | 'DOUANE'
  | 'LIVREE'
  | 'ANNULEE';

export type TransportMode = 'MARITIME' | 'AERIEN' | 'ROUTIER' | 'FERROVIAIRE' | 'AUTRE';

export type CustomsFormalityStatus = 'A_FAIRE' | 'EN_COURS' | 'TERMINE' | 'BLOQUE';

export interface ImportExportOperationRecord {
  id_operation: string;
  type_operation: ImportExportOperationType;
  id_order?: string;
  id_purchase?: string;
  reference_operation: string;
  pays_origine: string;
  pays_destination: string;
  statut: ImportExportOperationStatus;
  date_depart?: string;
  date_arrivee_prevue?: string;
  date_arrivee_reelle?: string;
  mode_transport?: TransportMode;
  created_at?: string;
  updated_at?: string;
}

export interface ImportExportItemRecord {
  id_item: string;
  id_operation: string;
  id_product: string;
  quantite: number;
  unite?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CustomsFormalityRecord {
  id_formality: string;
  id_operation: string;
  type_formality: string;
  statut: CustomsFormalityStatus;
  created_at?: string;
  updated_at?: string;
}

export interface ImportExportOperationWithDetails extends ImportExportOperationRecord {
  items: ImportExportItemRecord[];
  formalities: CustomsFormalityRecord[];
}
