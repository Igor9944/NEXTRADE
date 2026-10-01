import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/http';
import { useI18n } from '../../i18n/I18nProvider';
import { getSessionUser } from '../../auth/session';

type Overview = {
  period: string;
  kpis: Record<string, string | number>;
  sales_series: Array<{ day: string; revenue: string | number }>;
  orders_by_status: Array<{ statut: string; count: number }>;
  top_products: Array<{ nom: string; quantity: number; revenue: string | number }>;
  critical_stock: Array<{ nom: string; quantite_disponible: number; seuil_alerte: number }>;
  alerts: Record<string, number>;
};

function BarList({ items, valueKey, labelKey }: { items: Array<Record<string, unknown>>; valueKey: string; labelKey: string }) {
  const max = Math.max(...items.map((item) => Number(item[valueKey]) || 0), 1);
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index}>
          <div className="flex justify-between text-xs mb-1">
            <span>{String(item[labelKey])}</span>
            <span>{String(item[valueKey])}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded">
            <div className="h-2 bg-blue-700 rounded" style={{ width: `${(Number(item[valueKey]) / max) * 100}%` }} />
          </div>
        </div>
      ))}
      {items.length === 0 && <p className="text-sm text-gray-500">—</p>}
    </div>
  );
}

const DashboardPage: React.FC = () => {
  const { t } = useI18n();
  const user = getSessionUser();
  const [period, setPeriod] = useState('30d');
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    apiRequest<{ status: string; data: Overview }>(`/api/v1/analytics/overview?period=${period}`)
      .then((result) => setData(result.data))
      .catch((err) => setError(err.message));
  }, [period, user?.role]);

  if (user?.role !== 'ADMIN') {
    return <div className="bg-white rounded-lg shadow p-6">{t('error')}</div>;
  }
  if (error) return <div className="bg-white rounded-lg shadow p-6 text-red-600">{error}</div>;
  if (!data) return <div className="bg-white rounded-lg shadow p-6">{t('loading')}</div>;

  const kpis = [
    { key: 'kpiRevenue', value: data.kpis.revenue },
    { key: 'kpiOrders', value: data.kpis.orders_total },
    { key: 'kpiPending', value: data.kpis.orders_pending },
    { key: 'kpiPaid', value: data.kpis.orders_paid },
    { key: 'kpiClients', value: data.kpis.clients },
    { key: 'kpiProducts', value: data.kpis.products },
    { key: 'kpiStock', value: data.kpis.stock_units },
    { key: 'kpiTransactions', value: data.kpis.transactions_total }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl font-bold">{t('dashboard')}</h1>
        <label className="text-sm">
          {t('period')}
          <select className="ms-2 border rounded px-2 py-1" value={period} onChange={(event) => setPeriod(event.target.value)}>
            <option value="7d">{t('period7')}</option>
            <option value="30d">{t('period30')}</option>
            <option value="90d">{t('period90')}</option>
            <option value="year">{t('periodYear')}</option>
          </select>
        </label>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((item) => (
          <div key={item.key} className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500">{t(item.key)}</p>
            <p className="text-lg font-semibold">{item.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold mb-2">{t('alerts')}</h2>
        <ul className="text-sm grid sm:grid-cols-2 gap-1">
          <li>{t('alertLow')}: {data.alerts.stock_low}</li>
          <li>{t('alertOut')}: {data.alerts.stock_out}</li>
          <li>{t('alertBlocked')}: {data.alerts.blocked_orders}</li>
          <li>{t('alertFailed')}: {data.alerts.failed_payments}</li>
          <li>{t('alertLate')}: {data.alerts.late_shipments}</li>
        </ul>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <section className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-3">{t('chartSales')}</h2>
          <BarList items={data.sales_series as unknown as Array<Record<string, unknown>>} labelKey="day" valueKey="revenue" />
        </section>
        <section className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-3">{t('chartStatus')}</h2>
          <BarList items={data.orders_by_status as unknown as Array<Record<string, unknown>>} labelKey="statut" valueKey="count" />
        </section>
        <section className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-3">{t('chartTop')}</h2>
          <BarList items={data.top_products as unknown as Array<Record<string, unknown>>} labelKey="nom" valueKey="quantity" />
        </section>
        <section className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-3">{t('chartStock')}</h2>
          <BarList
            items={data.critical_stock.map((row) => ({ nom: row.nom, value: row.quantite_disponible })) as unknown as Array<Record<string, unknown>>}
            labelKey="nom"
            valueKey="value"
          />
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
