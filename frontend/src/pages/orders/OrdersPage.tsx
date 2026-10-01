import React, { useEffect, useState } from 'react';
import { createOrder, fetchCart, fetchOrders } from '../../services/commerceService';
import { useI18n } from '../../i18n/I18nProvider';

const OrdersPage: React.FC = () => {
  const { t } = useI18n();
  const [cart, setCart] = useState<{ items: Array<Record<string, unknown>>; total: string } | null>(null);
  const [orders, setOrders] = useState<Array<{ id_order: string; montant_total: string; statut: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState('Lome');

  const reload = () => {
    fetchCart().then((result) => setCart(result.data)).catch((err) => setError(err.message));
    fetchOrders().then((result) => setOrders(result.data || [])).catch((err) => setError(err.message));
  };

  useEffect(() => {
    reload();
  }, []);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-xl font-bold mb-3">{t('navOrders')}</h1>
        {error && <p className="text-red-600">{error}</p>}
        <p className="text-sm mb-2">{t('cartTotal')}: {cart?.total ?? '0.00'}</p>
        <ul className="text-sm mb-3">
          {(cart?.items || []).map((item, index) => (
            <li key={index}>{String(item.productName || item.nom)} × {String(item.quantity || item.quantite)}</li>
          ))}
        </ul>
        <input className="border rounded px-2 py-1 me-2" value={address} onChange={(event) => setAddress(event.target.value)} />
        <button
          className="bg-blue-700 text-white rounded px-3 py-1"
          onClick={() =>
            createOrder(address)
              .then(() => reload())
              .catch((err) => setError(err.message))
          }
        >
          {t('placeOrder')}
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold mb-2">{t('orderHistory')}</h2>
        <ul className="text-sm space-y-1">
          {orders.map((order) => (
            <li key={order.id_order}>
              {order.montant_total} — {order.statut}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OrdersPage;
