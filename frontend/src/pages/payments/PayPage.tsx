import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { paymentService } from '../../services/paymentService';
import { PaymentTransaction } from '../../types/payment';
import { getSessionUser } from '../../auth/session';
import { useI18n } from '../../i18n/I18nProvider';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  EmptyState,
  statusToBadge,
} from '../../components/ui';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { formatPrice, formatStatus } from '../../lib/format';

const PayPage: React.FC = () => {
  const [params] = useSearchParams();
  const presetOrderId = params.get('orderId') ?? '';
  const [orderId, setOrderId] = useState(presetOrderId);
  const { t } = useI18n();
  const user = getSessionUser();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [transaction, setTransaction] = useState<PaymentTransaction | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [orders, setOrders] = useState<
    Array<{ id_order: string; montant_total: string; statut: string }>
  >([]);

  const refresh = async (id: string) => {
    const result = await paymentService.getById(id);
    setTransaction(result.data);
  };

  useEffect(() => {
    if (!user) return;
    paymentService
      .listOrders()
      .then((result) => setOrders(result.data ?? []))
      .catch((err) => setError(err.message));
  }, [user?.id]);

  useEffect(() => {
    if (!transaction?.id_transaction) return;
    if (['VALIDEE', 'ECHOUEE'].includes(transaction.statut_transaction ?? '')) return;
    const timer = window.setInterval(() => {
      refresh(transaction.id_transaction).catch((err) => setError(err.message));
    }, 4000);
    return () => window.clearInterval(timer);
  }, [transaction?.id_transaction, transaction?.statut_transaction]);

  if (!user) {
    return (
      <EmptyState
        variant="restricted"
        title={t('loginRequired')}
        action={
          <Button variant="primary" as={Link} to="/login">
            {t('loginToContinue')}
          </Button>
        }
      />
    );
  }

  const pay = async () => {
    setError(null);
    setBusy(true);
    try {
      const result = await paymentService.initiate(orderId);
      setTransaction(result.data.transaction);
      setCheckoutUrl(result.data.checkout_url);
      if (result.data.checkout_url) {
        window.location.assign(result.data.checkout_url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Paiement impossible');
    } finally {
      setBusy(false);
    }
  };

  const orderOptions = orders.map((o) => ({
    value: o.id_order,
    label: `${o.id_order.slice(0, 8)}… — ${formatPrice(o.montant_total)} — ${formatStatus(o.statut)}`,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title={t('payTitle')} />

      <Card className="max-w-xl">
        <CardHeader><CardTitle>{t('payHint')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {orders.length > 0 && (
            <Select
              label={t('orders')}
              placeholder={t('chooseOrder')}
              options={orderOptions}
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
          )}

          <Input
            label={t('orderId')}
            value={orderId}
            readOnly={Boolean(presetOrderId)}
            onChange={(e) => setOrderId(e.target.value)}
          />

          {error && (
            <p role="alert" className="text-sm text-danger-500">{error}</p>
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              loading={busy}
              disabled={!orderId}
              onClick={pay}
            >
              {t('pay')}
            </Button>

            {/* Bouton sandbox uniquement si la transaction est sandbox */}
            {transaction &&
              transaction.statut_transaction !== 'VALIDEE' &&
              String(transaction.provider ?? transaction.methode_paiement ?? '').toLowerCase().includes('sandbox') && (
                <Button
                  variant="secondary"
                  loading={busy}
                  onClick={async () => {
                    setError(null);
                    setBusy(true);
                    try {
                      const result = await paymentService.confirmSandbox(transaction.id_transaction);
                      setTransaction(result.data.transaction);
                      const ordersResult = await paymentService.listOrders();
                      setOrders(ordersResult.data ?? []);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : t('error'));
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  {t('confirmDemoPay')}
                </Button>
              )}
          </div>

          {checkoutUrl && (
            <p className="text-sm text-nextrade-muted">
              Redirection :{' '}
              <a className="text-nextrade-blue underline" href={checkoutUrl}>
                {checkoutUrl}
              </a>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Détails transaction */}
      {transaction && (
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>{t('transaction')}</CardTitle>
            <Badge variant={statusToBadge(transaction.statut_transaction ?? '')}>
              {formatStatus(transaction.statut_transaction ?? '')}
            </Badge>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-nextrade-muted">ID</dt>
                <dd className="break-all font-mono text-xs">{transaction.id_transaction}</dd>
              </div>
              <div>
                <dt className="text-xs text-nextrade-muted">{t('amount')}</dt>
                <dd className="font-semibold">
                  {formatPrice(transaction.montant_paye, transaction.devise ?? 'XOF')}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-nextrade-muted">{t('extRef')}</dt>
                <dd className="break-all font-mono text-xs">{transaction.reference_externe ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-nextrade-muted">{t('provider')}</dt>
                <dd>{transaction.provider ?? '—'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PayPage;
