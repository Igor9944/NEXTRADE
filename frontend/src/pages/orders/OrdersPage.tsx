import React, { useEffect, useState } from 'react';
import { createOrder, fetchCart, fetchOrders } from '../../services/commerceService';
import { useI18n } from '../../i18n/I18nProvider';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  DataTable,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  EmptyState,
  statusToBadge,
} from '../../components/ui';
import { Input } from '../../components/ui/Input';
import { formatPrice, formatStatus } from '../../lib/format';

const OrdersPage: React.FC = () => {
  const { t } = useI18n();
  const [cart, setCart] = useState<{
    items: Array<Record<string, unknown>>;
    total: string;
  } | null>(null);
  const [orders, setOrders] = useState<
    Array<{ id_order: string; montant_total: string; statut: string }>
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [address, setAddress] = useState('');
  const [ordering, setOrdering] = useState(false);

  const reload = () => {
    setLoadingData(true);
    Promise.all([
      fetchCart()
        .then((result) => setCart(result.data))
        .catch((err) => setError(err.message)),
      fetchOrders()
        .then((result) => setOrders(result.data || []))
        .catch((err) => setError(err.message)),
    ]).finally(() => setLoadingData(false));
  };

  useEffect(() => {
    reload();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title={t('navOrders')} />

      {/* Panier */}
      <Card>
        <CardHeader>
          <CardTitle>{t('cartTotal')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-2xl font-bold text-nextrade-blue">
            {formatPrice(cart?.total)}
          </p>
          {(cart?.items ?? []).length > 0 && (
            <ul className="mb-4 space-y-1 text-sm text-nextrade-muted">
              {cart!.items.map((item, index) => (
                <li key={index}>
                  {String(item.productName ?? item.nom ?? '—')} ×{' '}
                  {String(item.quantity ?? item.quantite ?? 1)}
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <Input
                placeholder={t('deliveryAddress')}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                aria-label={t('deliveryAddress')}
              />
            </div>
            <Button
              variant="primary"
              loading={ordering}
              disabled={!address.trim()}
              onClick={async () => {
                setOrdering(true);
                setError(null);
                try {
                  await createOrder(address);
                  setAddress('');
                  reload();
                } catch (err: unknown) {
                  setError(err instanceof Error ? err.message : t('error'));
                } finally {
                  setOrdering(false);
                }
              }}
            >
              {t('placeOrder')}
            </Button>
          </div>
          {error && (
            <p role="alert" className="mt-2 text-sm text-danger-500">
              {error}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Historique commandes */}
      <div>
        <h2 className="mb-3 text-lg font-bold text-nextrade-ink">{t('orderHistory')}</h2>
        <DataTable
          loading={loadingData}
          empty={orders.length === 0}
          emptyTitle="Aucune commande"
          emptyDescription="Vos commandes apparaîtront ici après votre premier achat."
          cols={3}
        >
          <Table>
            <TableHeader>
              <TableHead>Réf. commande</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id_order}>
                  <TableCell>
                    <span className="font-mono text-xs">{order.id_order.slice(0, 8)}…</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">{formatPrice(order.montant_total)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusToBadge(order.statut)}>
                      {formatStatus(order.statut)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataTable>
      </div>
    </div>
  );
};

export default OrdersPage;
