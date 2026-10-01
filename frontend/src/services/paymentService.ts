import { apiRequest } from './http';
import { InitiatePaymentResponse, PaymentTransaction } from '../types/payment';

export const paymentService = {
  initiate(order_id: string) {
    return apiRequest<InitiatePaymentResponse>('/api/v1/payments', {
      method: 'POST',
      body: JSON.stringify({ order_id })
    });
  },
  confirmSandbox(id: string) {
    return apiRequest<{
      status: string;
      data: { duplicate: boolean; notification: string; transaction: PaymentTransaction };
    }>(`/api/v1/payments/${id}/sandbox-confirm`, { method: 'POST', body: JSON.stringify({}) });
  },
  getById(id: string) {
    return apiRequest<{ status: string; data: PaymentTransaction }>(`/api/v1/payments/${id}`);
  },
  listByOrder(orderId: string) {
    return apiRequest<{ status: string; data: { transactions: PaymentTransaction[] } }>(
      `/api/v1/orders/${orderId}/transactions`
    );
  },
  listOrders() {
    return apiRequest<{ status: string; data: Array<{ id_order: string; montant_total: string; statut: string }> }>(
      '/api/v1/orders'
    );
  }
};
