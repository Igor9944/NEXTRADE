import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { paymentService } from '../../services/paymentService';
import { PaymentTransaction } from '../../types/payment';
import { getSessionUser } from '../../auth/session';
import { useI18n } from '../../i18n/I18nProvider';

const PayPage: React.FC = () => {
  const [params] = useSearchParams();
  const presetOrderId = params.get('orderId') || '';
  const [orderId, setOrderId] = useState(presetOrderId);
  const { t } = useI18n();
  const user = getSessionUser();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [transaction, setTransaction] = useState<PaymentTransaction | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [orders, setOrders] = useState<Array<{ id_order: string; montant_total: string; statut: string }>>([]);

  const refresh = async (id: string) => {
    const result = await paymentService.getById(id);
    setTransaction(result.data);
  };

  useEffect(() => {
    if (!user) return;
    paymentService
      .listOrders()
      .then((result) => setOrders(result.data || []))
      .catch((err) => setError(err.message));
  }, [user?.id]);

  useEffect(() => {
    if (!transaction?.id_transaction) return;
    if (transaction.statut_transaction === 'VALIDEE' || transaction.statut_transaction === 'ECHOUEE') return;
    const timer = window.setInterval(() => {
      refresh(transaction.id_transaction).catch((err) => setError(err.message));
    }, 4000);
    return () => window.clearInterval(timer);
  }, [transaction?.id_transaction, transaction?.statut_transaction]);

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

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        {t('loginRequired')} <Link className="text-blue-700 underline" to="/login">{t('loginToContinue')}</Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-4">
      <h1 className="text-xl font-bold">{t('payTitle')}</h1>
      <p className="text-sm text-gray-600">{t('payHint')}</p>
      {orders.length > 0 && (
        <label className="block text-sm">
          {t('orders')}
          <select
            className="mt-1 w-full border rounded px-3 py-2"
            value={orderId}
            onChange={(event) => setOrderId(event.target.value)}
          >
            <option value="">{t('chooseOrder')}</option>
            {orders.map((order) => (
              <option key={order.id_order} value={order.id_order}>
                {order.id_order} — {order.montant_total} — {order.statut}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="block text-sm">
        {t('orderId')}
        <input
          className="mt-1 w-full border rounded px-3 py-2"
          value={orderId}
          readOnly={Boolean(presetOrderId)}
          onChange={(event) => setOrderId(event.target.value)}
        />
      </label>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        className="bg-blue-700 text-white rounded px-4 py-2 disabled:opacity-50"
        disabled={busy || !orderId}
        onClick={pay}
      >
        {busy ? t('initiating') : t('pay')}
      </button>
      {transaction && transaction.statut_transaction !== 'VALIDEE' &&
        String(transaction.provider || transaction.methode_paiement || '').toLowerCase().includes('sandbox') && (
        <button
          className="ms-2 bg-emerald-700 text-white rounded px-4 py-2 disabled:opacity-50"
          disabled={busy}
          onClick={async () => {
            setError(null);
            setBusy(true);
            try {
              const result = await paymentService.confirmSandbox(transaction.id_transaction);
              setTransaction(result.data.transaction);
              const ordersResult = await paymentService.listOrders();
              setOrders(ordersResult.data || []);
            } catch (err) {
              setError(err instanceof Error ? err.message : t('error'));
            } finally {
              setBusy(false);
            }
          }}
        >
          {t('confirmDemoPay')}
        </button>
      )}
      {checkoutUrl && (
        <p className="text-sm">
          Redirection passerelle : <a className="text-blue-700 underline" href={checkoutUrl}>{checkoutUrl}</a>
        </p>
      )}
      {transaction && (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-500">{t('transaction')}</dt>
            <dd className="break-all">{transaction.id_transaction}</dd>
          </div>
          <div>
            <dt className="text-gray-500">{t('amount')}</dt>
            <dd>
              {transaction.montant_paye} {transaction.devise || ''}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">{t('status')}</dt>
            <dd>{transaction.statut_transaction}</dd>
          </div>
          <div>
            <dt className="text-gray-500">{t('extRef')}</dt>
            <dd className="break-all">{transaction.reference_externe || '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">{t('provider')}</dt>
            <dd>{transaction.provider || '—'}</dd>
          </div>
        </dl>
      )}
    </div>
  );
};

export default PayPage;
