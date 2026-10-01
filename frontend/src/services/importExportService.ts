import { apiRequest } from './http';
import {
  ImportExportOperationRecord,
  ImportExportItemRecord,
  CustomsFormalityRecord,
  ImportExportOperationWithDetails,
  ImportExportOperationType,
  ImportExportOperationStatus
} from '../types/importExport';

type ListResult = {
  operations: ImportExportOperationRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export class ImportExportService {
  async createOperation(data: {
    type_operation: ImportExportOperationType;
    id_order?: string;
    id_purchase?: string;
    reference_operation: string;
    pays_origine: string;
    pays_destination: string;
    statut?: ImportExportOperationStatus;
    date_depart?: string | null;
    date_arrivee_prevue?: string | null;
    mode_transport?: string | null;
    items: Array<{
      id_product: string;
      quantite: number;
      unite?: string;
    }>;
  }): Promise<ImportExportOperationWithDetails> {
    const payload = await apiRequest<{ success: boolean; data: ImportExportOperationWithDetails }>('/api/v1/import-export', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return payload.data;
  }

  async getOperationById(id_operation: string): Promise<ImportExportOperationWithDetails> {
    const payload = await apiRequest<{ success: boolean; data: ImportExportOperationWithDetails }>(
      `/api/v1/import-export/${id_operation}`
    );
    return payload.data;
  }

  async listOperations(filters: {
    type_operation?: ImportExportOperationType;
    statut?: ImportExportOperationStatus;
    pays_origine?: string;
    pays_destination?: string;
    reference_operation?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<ListResult> {
    const params = new URLSearchParams();
    if (filters.type_operation) params.append('type_operation', filters.type_operation);
    if (filters.statut) params.append('statut', filters.statut);
    if (filters.pays_origine) params.append('pays_origine', filters.pays_origine);
    if (filters.pays_destination) params.append('pays_destination', filters.pays_destination);
    if (filters.reference_operation) params.append('reference_operation', filters.reference_operation);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    const query = params.toString();
    const payload = await apiRequest<{ success: boolean; data: ListResult }>(
      `/api/v1/import-export${query ? `?${query}` : ''}`
    );
    return payload.data;
  }

  async updateOperationStatus(id_operation: string, statut: ImportExportOperationStatus): Promise<ImportExportOperationRecord> {
    const payload = await apiRequest<{ success: boolean; data: ImportExportOperationRecord }>(
      `/api/v1/import-export/${id_operation}/status`,
      { method: 'PATCH', body: JSON.stringify({ statut }) }
    );
    return payload.data;
  }

  async deleteOperation(id_operation: string): Promise<void> {
    await apiRequest(`/api/v1/import-export/${id_operation}`, { method: 'DELETE' });
  }
}

export type { ImportExportItemRecord, CustomsFormalityRecord };
