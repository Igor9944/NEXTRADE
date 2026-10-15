import React, { useEffect, useState } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchOrders } from '../../services/commerceService';
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
import { formatPrice, formatStatus } from '../../lib/format';

/**
 * Page Commandes fournisseur.
 * Note : l'API /api/v1/orders renvoie toutes les commandes accessibles
 * selon le rôle. Le filtrage spécifique par fournisseur n'est pas encore
 * implémenté côté backend.
 */
const SupplierOrdersPage: React.FC = () => {
  const { t } = useI18n();
  const [orders, setOrders] = useState<
    Array<{ id_order: string; montant_total: string; statut: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders()
      .then((result) => setOrders(result.data ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('supplierNavOrders')}
        description={t('supplierWorkspace')}
      />

      <div className="flex items-start gap-3 rounded-xl border border-info-100 bg-info-50 px-4 py-3">
        <span className="text-info-500 text-sm">ℹ</span>
        <p className="text-sm text-info-700">
          {t('supplierOrdersDescription')}
        </p>
      </div>

      <DataTable
        loading={loading}
        error={error}
        empty={orders.length === 0}
        emptyTitle="Aucune commande"
        emptyDescription="Aucune commande disponible pour le moment."
        cols={3}
      >
        <Table>
          <TableHeader>
            <TableHead>Référence</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Statut</TableHead>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id_order}>
                <TableCell>
                  <span className="font-mono text-xs">{o.id_order.slice(0, 8)}…</span>
                </TableCell>
                <TableCell>
                  <span className="font-semibold">{formatPrice(o.montant_total)}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={statusToBadge(o.statut)}>{formatStatus(o.statut)}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTable>
    </div>
  );
};

export default SupplierOrdersPage;
