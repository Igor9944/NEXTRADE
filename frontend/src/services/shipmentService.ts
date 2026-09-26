import { apiRequest } from './http';
import { Shipment, ShipmentHistoryItem, ShipmentStatus } from '../types/shipment';

type ListResponse = {
  status: string;
  data: {
    shipments: Shipment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export const shipmentService = {
  create(payload: Record<string, unknown>) {
    return apiRequest<{ status: string; data: Shipment }>('/api/v1/shipments', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  list(params: Record<string, string | number | undefined> = {}) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        search.set(key, String(value));
      }
    });
    const query = search.toString();
    return apiRequest<ListResponse>(`/api/v1/shipments${query ? `?${query}` : ''}`);
  },

  listMine() {
    return apiRequest<ListResponse>('/api/v1/shipments/my');
  },

  listAssigned() {
    return apiRequest<ListResponse>('/api/v1/shipments/my-assigned');
  },

  getById(id: string) {
    return apiRequest<{
      status: string;
      data: { shipment: Shipment; history: ShipmentHistoryItem[]; allowed_next_statuses: ShipmentStatus[] };
    }>(`/api/v1/shipments/${id}`);
  },

  assign(id: string, transporteur_id: string) {
    return apiRequest<{ status: string; data: Shipment }>(`/api/v1/shipments/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ transporteur_id })
    });
  },

  updateStatus(id: string, statut: ShipmentStatus, comment?: string) {
    return apiRequest<{ status: string; data: Shipment }>(`/api/v1/shipments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ statut, comment })
    });
  },

  confirmDelivery(id: string, payload: { recipient_name: string; delivery_notes?: string }) {
    return apiRequest<{ status: string; data: Shipment }>(`/api/v1/shipments/${id}/delivery`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'LIVREE', ...payload })
    });
  }
};
