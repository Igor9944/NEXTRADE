import React from 'react';
import { apiRequest } from '../../services/http';
import { useI18n } from '../../i18n/I18nProvider';
import {
  PageHeader,
  Badge,
  DataTable,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  statusToBadge,
} from '../../components/ui';
import { formatStatus } from '../../lib/format';

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
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    apiRequest<{ status: string; data: SupplierRow[] }>('/api/v1/suppliers?limit=50')
      .then((result) => setRows(result.data ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title={t('suppliersTitle')} />

      <DataTable
        loading={loading}
        error={error}
        empty={rows.length === 0}
        emptyTitle="Aucun fournisseur"
        emptyDescription="Aucun fournisseur enregistré pour le moment."
        cols={3}
      >
        <Table>
          <TableHeader>
            <TableHead>Fournisseur</TableHead>
            <TableHead>Vérification</TableHead>
            <TableHead>{t('email')}</TableHead>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id_supplier_profile}>
                <TableCell>
                  <span className="font-medium">
                    {row.identifiant_professionnel ?? row.id_supplier_profile.slice(0, 8) + '…'}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={statusToBadge(row.statut_verification ?? 'NON_VERIFIE')}>
                    {formatStatus(row.statut_verification ?? 'NON_VERIFIE')}
                  </Badge>
                </TableCell>
                <TableCell muted>{row.email_professionnel ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTable>
    </div>
  );
};

export default SuppliersPage;
