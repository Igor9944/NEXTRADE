import { apiRequest } from './http';

export type SupplierDashboard = {
  profile: {
    id_supplier_profile: string;
    description: string | null;
    identifiant_professionnel: string | null;
    statut_verification: 'NON_VERIFIE' | 'EN_ATTENTE' | 'VERIFIE' | 'REJETE';
    email_professionnel: string | null;
  } | null;
  documents: Array<{
    id_document: string;
    reference_document: string;
    type_document: string;
    statut: string;
    created_at: string;
  }>;
  counts: {
    documents: number;
    notifications: number;
  };
};

export type SupplierProfile = NonNullable<SupplierDashboard['profile']>;

export async function getSupplierProfile(): Promise<SupplierProfile> {
  const response = await apiRequest<{ status: string; data: SupplierProfile }>('/api/v1/suppliers/profile/me');
  return response.data;
}

export async function getSupplierDashboard(): Promise<SupplierDashboard> {
  const [profileResponse, documentsResponse, notificationsResponse] = await Promise.all([
    apiRequest<{ status: string; data: SupplierProfile | null }>('/api/v1/suppliers/profile/me'),
    apiRequest<{ status: string; data: { documents: SupplierDashboard['documents']; total: number } }>('/api/v1/documents?limit=10'),
    apiRequest<{ status: string; data: { notifications: Array<{ id_notification: string }> } }>('/api/v1/notifications')
  ]);

  return {
    profile: profileResponse.data,
    documents: documentsResponse.data.documents,
    counts: {
      documents: documentsResponse.data.total,
      notifications: notificationsResponse.data.notifications.length
    }
  };
}

export async function getSupplierDocuments(): Promise<SupplierDashboard['documents']> {
  const response = await apiRequest<{ status: string; data: { documents: SupplierDashboard['documents'] } }>('/api/v1/documents?limit=50');
  return response.data.documents;
}
