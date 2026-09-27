import { apiDownload, apiRequest } from './http';
import { CustomsFormality, HistoryItem, Invoice, TradeDocument } from '../types/document';

export const documentService = {
  list(params: Record<string, string | undefined> = {}) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) search.set(key, value);
    });
    const query = search.toString();
    return apiRequest<{
      status: string;
      data: { documents: TradeDocument[]; total: number; page: number; totalPages: number };
    }>(`/api/v1/documents${query ? `?${query}` : ''}`);
  },

  getById(id: string) {
    return apiRequest<{
      status: string;
      data: { document: TradeDocument; history: HistoryItem[] };
    }>(`/api/v1/documents/${id}`);
  },

  upload(form: FormData) {
    return apiRequest<{ status: string; data: TradeDocument }>('/api/v1/documents', {
      method: 'POST',
      body: form
    });
  },

  download(id: string) {
    return apiDownload(`/api/v1/documents/${id}/download`);
  },

  generateInvoice(orderId: string) {
    return apiRequest<{ status: string; data: { invoice: Invoice; document: TradeDocument } }>(
      `/api/v1/orders/${orderId}/invoice`,
      { method: 'POST' }
    );
  },

  generatePackingList(orderId: string) {
    return apiRequest<{ status: string; data: TradeDocument }>(`/api/v1/orders/${orderId}/packing-list`, {
      method: 'POST'
    });
  },

  getInvoice(id: string) {
    return apiRequest<{ status: string; data: { invoice: Invoice; history: HistoryItem[] } }>(
      `/api/v1/invoices/${id}`
    );
  },

  downloadInvoice(id: string) {
    return apiDownload(`/api/v1/invoices/${id}/download`);
  },

  listOperationDocuments(operationId: string) {
    return apiRequest<{
      status: string;
      data: { documents: TradeDocument[] };
    }>(`/api/v1/import-export/${operationId}/documents`);
  },

  getOrderDossier(orderId: string) {
    return apiRequest<{
      status: string;
      data: {
        invoice: Invoice | null;
        factures: TradeDocument[];
        packing_lists: TradeDocument[];
        autres: TradeDocument[];
        formalities: CustomsFormality[];
      };
    }>(`/api/v1/orders/${orderId}/documents`);
  },

  listFormalities(operationId: string) {
    return apiRequest<{ status: string; data: { formalities: CustomsFormality[] } }>(
      `/api/v1/import-export/${operationId}/formalities`
    );
  },

  updateFormality(id: string, statut: string) {
    return apiRequest<{ status: string; data: CustomsFormality }>(`/api/v1/formalities/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ statut })
    });
  },

  formalityHistory(id: string) {
    return apiRequest<{ status: string; data: { history: HistoryItem[] } }>(`/api/v1/formalities/${id}/history`);
  }
};
