import { 
  ImportExportOperationRecord, 
  ImportExportItemRecord, 
  CustomsFormalityRecord,
  ImportExportOperationWithDetails
} from '../types/importExport';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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
    const response = await fetch(`${API_BASE_URL}/api/v1/import-export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create operation');
    }

    return response.json();
  }

  async getOperationById(id_operation: string): Promise<ImportExportOperationWithDetails> {
    const response = await fetch(`${API_BASE_URL}/api/v1/import-export/${id_operation}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch operation');
    }

    return response.json();
  }

  async listOperations(filters: {
    type_operation?: ImportExportOperationType;
    statut?: ImportExportOperationStatus;
    pays_origine?: string;
    pays_destination?: string;
    reference_operation?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    operations: ImportExportOperationRecord[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // Build query string
    const params = new URLSearchParams();
    
    if (filters.type_operation) params.append('type_operation', filters.type_operation);
    if (filters.statut) params.append('statut', filters.statut);
    if (filters.pays_origine) params.append('pays_origine', filters.pays_origine);
    if (filters.pays_destination) params.append('pays_destination', filters.pays_destination);
    if (filters.reference_operation) params.append('reference_operation', filters.reference_operation);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const url = `${API_BASE_URL}/api/v1/import-export${queryString ? '?' + queryString : ''}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch operations');
    }

    return response.json();
  }

  async updateOperationStatus(
    id_operation: string,
    statut: ImportExportOperationStatus
  ): Promise<ImportExportOperationRecord> {
    const response = await fetch(`${API_BASE_URL}/api/v1/import-export/${id_operation}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ statut }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update operation status');
    }

    return response.json();
  }

  async deleteOperation(id_operation: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/import-export/${id_operation}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete operation');
    }
  }
}
