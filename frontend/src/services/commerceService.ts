import { apiRequest } from './http';

export type CatalogProduct = {
  id_product: string;
  nom: string;
  description?: string | null;
  categorie?: string | null;
  effective_price?: string | number;
  prix_detail?: string | number;
  stock_quantity?: number;
  stock_status?: 'OK' | 'LOW' | 'OUT' | 'UNKNOWN';
};

export async function fetchCatalog() {
  return apiRequest<{ status: string; data: CatalogProduct[] }>('/api/v1/products/catalog?limit=50');
}

export async function fetchProduct(id: string) {
  return apiRequest<{ status: string; data: CatalogProduct }>(`/api/v1/products/${id}`);
}

export async function fetchCart() {
  return apiRequest<{ status: string; data: { items: Array<Record<string, unknown>>; total: string } }>('/api/v1/cart');
}

export async function addCartItem(productId: string, quantity = 1) {
  return apiRequest('/api/v1/cart/items', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity })
  });
}

export async function createOrder(adresse_livraison: string) {
  return apiRequest<{ status: string; data: { id_order: string; montant_total: string; statut: string } }>('/api/v1/orders', {
    method: 'POST',
    body: JSON.stringify({ adresse_livraison })
  });
}

export async function fetchOrders() {
  return apiRequest<{ status: string; data: Array<{ id_order: string; montant_total: string; statut: string }> }>('/api/v1/orders');
}
