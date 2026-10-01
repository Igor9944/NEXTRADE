import React from 'react';
import { apiRequest } from '../../services/http';
import { useI18n } from '../../i18n/I18nProvider';

type SupplierRow = {
  id_supplier_profile: string;
  user_id: string;
  identifiant_professionnel?: string | null;
  statut_verification?: string | null;
  email_professionnel?: string | null;
  description?: string | null;
};

const SuppliersPage: React.FC = () => {
  const { t } = useI18n();
  const [rows, setRows] = React.useState<SupplierRow[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    apiRequest<{ status: string; data: SupplierRow[] }>('/api/v1/suppliers?limit=50')
      .then((result) => setRows(result.data || []))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <h1 className="text-xl font-bold mb-4">{t('suppliersTitle')}</h1>
      {error && <p className="text-red-600">{error}</p>}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b text-start">
              <th className="py-2 pe-3">{t('ieReference')}</th>
              <th className="py-2 pe-3">{t('verification')}</th>
              <th className="py-2">{t('email')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id_supplier_profile} className="border-b">
                <td className="py-2 pe-3">{row.identifiant_professionnel || row.id_supplier_profile.slice(0, 8)}</td>
                <td className="py-2 pe-3">{row.statut_verification || '—'}</td>
                <td className="py-2">{row.email_professionnel || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuppliersPage;
