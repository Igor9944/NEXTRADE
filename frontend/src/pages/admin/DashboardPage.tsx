import React, { useEffect, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';
import { apiRequest } from '../../services/http';
import { useI18n } from '../../i18n/I18nProvider';
import { getSessionUser } from '../../auth/session';
import {
  PageHeader,
  CardStat,
  Badge,
  Select,
  EmptyState,
  SkeletonKPI,
  Button,
} from '../../components/ui';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '../../components/ui/chart';
import {
  IconOrders,
  IconPayment,
  IconUser,
  IconCatalog,
  IconInventory,
  IconAlert,
  IconShipment,
} from '../../components/icons';
import { OrderStatusDonutChart } from '../../components/charts/OrderStatusDonutChart';
import type { OrderStatusDatum } from '../../components/charts/OrderStatusDonutChart';
import { formatPrice, formatNumber, formatStatus } from '../../lib/format';

type Overview = {
  period: string;
  kpis: Record<string, string | number>;
  sales_series: Array<{ day: string; revenue: string | number }>;
  orders_by_status: Array<{ statut: string; count: number }>;
  top_products: Array<{ nom: string; quantity: number; revenue: string | number }>;
  critical_stock: Array<{ nom: string; quantite_disponible: number; seuil_alerte: number }>;
  alerts: Record<string, number>;
};

const orderStatusColors = ['#0759C7', '#10B981', '#F59E0B', '#EF4444', '#25BDF0'];

const alertVariant = (key: string): 'danger' | 'warning' | 'pending' => {
  if (key === 'stock_out' || key === 'blocked_orders' || key === 'failed_payments') return 'danger';
  if (key === 'late_shipments') return 'warning';
  return 'pending';
};

function formatChartDay(value: string, locale: string): string {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(date);
}

const DashboardPage: React.FC = () => {
  const { t, uiLang } = useI18n();
  const user = getSessionUser();
  const periodOptions = [
    { value: '7d', label: t('period7') },
    { value: '30d', label: t('period30') },
    { value: '90d', label: t('period90') },
    { value: 'year', label: t('periodYear') },
  ];
  const chartConfig = {
    revenue: { label: t('kpiRevenue'), color: '#0759C7' },
  } satisfies ChartConfig;
  const chartLocale = uiLang === 'ar' ? 'ar' : uiLang === 'en' ? 'en' : 'fr';
  const [period, setPeriod] = useState('30d');
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const gradientId = useId().replace(/:/g, '');

  const load = () => {
    if (user?.role !== 'ADMIN') return;
    setLoading(true);
    setError(null);
    apiRequest<{ status: string; data: Overview }>(
      `/api/v1/analytics/overview?period=${period}`
    )
      .then((result) => setData(result.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [period, user?.role]);

  if (user?.role !== 'ADMIN') {
    return (
      <EmptyState
        variant="restricted"
        title={t('error')}
        description="Accès réservé aux administrateurs."
      />
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex h-10 w-48 animate-pulse rounded-xl bg-slate-200" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonKPI key={i} />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <EmptyState
        variant="error"
        title="Erreur de chargement"
        description={error ?? t('noData')}
        action={<Button variant="outline" onClick={load}>{t('retry')}</Button>}
      />
    );
  }

  const kpis = [
    { key: 'kpiRevenue', value: formatPrice(data.kpis.revenue, 'XOF'), icon: <IconPayment className="h-5 w-5" /> },
    { key: 'kpiOrders', value: formatNumber(data.kpis.orders_total), icon: <IconOrders className="h-5 w-5" /> },
    { key: 'kpiClients', value: formatNumber(data.kpis.clients), icon: <IconUser className="h-5 w-5" /> },
    { key: 'kpiProducts', value: formatNumber(data.kpis.products), icon: <IconCatalog className="h-5 w-5" /> },
    { key: 'kpiPending', value: formatNumber(data.kpis.orders_pending), icon: <IconOrders className="h-5 w-5" /> },
    { key: 'kpiPaid', value: formatNumber(data.kpis.orders_paid), icon: <IconOrders className="h-5 w-5" /> },
    { key: 'kpiStock', value: formatNumber(data.kpis.stock_units), icon: <IconInventory className="h-5 w-5" /> },
    { key: 'kpiTransactions', value: formatNumber(data.kpis.transactions_total), icon: <IconPayment className="h-5 w-5" /> },
  ];

  const alertItems = [
    { key: 'stock_low', labelKey: 'alertLow', count: data.alerts.stock_low },
    { key: 'stock_out', labelKey: 'alertOut', count: data.alerts.stock_out },
    { key: 'blocked_orders', labelKey: 'alertBlocked', count: data.alerts.blocked_orders },
    { key: 'failed_payments', labelKey: 'alertFailed', count: data.alerts.failed_payments },
    { key: 'late_shipments', labelKey: 'alertLate', count: data.alerts.late_shipments },
  ].filter((alert) => alert.count > 0);

  const statusData: OrderStatusDatum[] = data.orders_by_status
    .filter((item) => item.count > 0)
    .map((item, index) => ({
      name: formatStatus(item.statut),
      value: item.count,
      fill: orderStatusColors[index % orderStatusColors.length],
    }));
  const orderCount = statusData.reduce((total, item) => total + item.value, 0);

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title={t('dashboard')}
          description={t('dashboardSummary')}
          className="mb-0"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" as={Link} to="/orders" size="sm">
            <IconOrders className="h-4 w-4" aria-hidden />
            {t('navOrders')}
          </Button>
          <Button variant="outline" as={Link} to="/shipments" size="sm">
            <IconShipment className="h-4 w-4" aria-hidden />
            {t('navShipments')}
          </Button>
          <Select
            aria-label={t('period')}
            options={periodOptions}
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="w-36"
          />
        </div>
      </div>

      <section aria-label={t('dashboardMetrics')} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <CardStat key={kpi.key} label={t(kpi.key)} value={kpi.value} icon={kpi.icon} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
        <Card className="min-w-0 rounded-2xl border-nextrade-border shadow-sm">
          <CardHeader className="flex-row items-start justify-between gap-4 pb-0">
            <div>
              <CardTitle>{t('chartSales')}</CardTitle>
              <p className="mt-1 text-sm text-nextrade-muted">{t('salesTrend')}</p>
            </div>
            <span className="rounded-full bg-nextrade-ice px-3 py-1 text-xs font-semibold text-nextrade-blue">
              {periodOptions.find((option) => option.value === period)?.label}
            </span>
          </CardHeader>
          <CardContent className="pt-5">
            {data.sales_series.length > 0 ? (
              <ChartContainer
                config={chartConfig}
                className="h-[290px] w-full"
                aria-label={t('chartSales')}
              >
                <AreaChart
                  data={data.sales_series}
                  margin={{ top: 12, right: 12, left: 4, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-revenue)" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#DCE7F3" strokeDasharray="4 4" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                    minTickGap={22}
                    tickFormatter={(value: string) => formatChartDay(value, chartLocale)}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                    width={70}
                    tickFormatter={(value: number) => formatNumber(value)}
                  />
                  <ChartTooltip
                    cursor={{ stroke: '#9CB7D2', strokeDasharray: '4 4' }}
                    content={
                      <ChartTooltipContent
                        formatter={(value) => formatPrice(Number(value), 'XOF')}
                        labelFormatter={(label) => formatChartDay(String(label), chartLocale)}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    strokeWidth={2.5}
                    fill={`url(#${gradientId})`}
                    activeDot={{ r: 5, fill: '#0759C7', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[290px] items-center justify-center text-sm text-nextrade-muted">
                {t('noSalesInPeriod')}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-nextrade-border shadow-sm">
          <CardHeader>
            <CardTitle>{t('chartStatus')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-5">
            {orderCount > 0 ? (
              <>
                <OrderStatusDonutChart
                  data={statusData}
                  total={orderCount}
                  label={t('orders')}
                  size={190}
                />
                <ul className="w-full space-y-3" aria-label={t('chartStatus')}>
                  {statusData.map((item) => (
                    <li key={item.name} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex min-w-0 items-center gap-2 text-nextrade-muted">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.fill }} />
                        <span className="truncate">{item.name}</span>
                      </span>
                      <span className="font-semibold tabular-nums text-nextrade-ink">{formatNumber(item.value)}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="flex h-[260px] items-center text-sm text-nextrade-muted">
                {t('noOrdersInPeriod')}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="rounded-2xl border-nextrade-border shadow-sm">
          <CardHeader><CardTitle>{t('chartTop')}</CardTitle></CardHeader>
          <CardContent>
            {data.top_products.length > 0 ? (
              <ol className="divide-y divide-nextrade-border">
                {data.top_products.map((product, index) => (
                  <li key={`${product.nom}-${index}`} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-nextrade-ice text-sm font-bold text-nextrade-blue">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-nextrade-ink">{product.nom}</p>
                      <p className="mt-0.5 text-xs text-nextrade-muted">
                        {formatNumber(product.quantity)} {t('unitsSold')}
                      </p>
                    </div>
                    <span className="text-right text-sm font-semibold tabular-nums text-nextrade-ink">
                      {formatPrice(product.revenue, 'XOF')}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="py-5 text-center text-sm text-nextrade-muted">{t('noSalesInPeriod')}</p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-nextrade-border shadow-sm">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>{t('chartStock')}</CardTitle>
            {data.critical_stock.length > 0 && (
              <Badge variant="warning">{formatNumber(data.critical_stock.length)} alertes</Badge>
            )}
          </CardHeader>
          <CardContent>
            {data.critical_stock.length > 0 ? (
              <ul className="divide-y divide-nextrade-border">
                {data.critical_stock.map((row) => (
                  <li key={row.nom} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="truncate text-sm font-medium text-nextrade-ink">{row.nom}</span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="text-sm tabular-nums">{formatNumber(row.quantite_disponible)}</span>
                      <Badge variant={row.quantite_disponible === 0 ? 'danger' : 'warning'}>
                        {row.quantite_disponible === 0 ? t('stockOut') : t('stockLow')}
                      </Badge>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="flex min-h-24 items-center justify-center gap-2 text-sm font-medium text-success-700">
                <IconInventory className="h-4 w-4" aria-hidden />
                {t('noStockAlert')}
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      {alertItems.length > 0 && (
        <Card className="rounded-2xl border-warning-200 bg-warning-50/60 shadow-none">
          <CardHeader className="flex-row items-center gap-2">
            <IconAlert className="h-5 w-5 text-warning-700" aria-hidden />
            <CardTitle>{t('alerts')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 sm:grid-cols-2">
              {alertItems.map((alert) => (
                <li key={alert.key} className="flex items-center justify-between gap-3 rounded-xl bg-white/80 px-3 py-2">
                  <span className="text-sm text-nextrade-ink">{t(alert.labelKey)}</span>
                  <Badge variant={alertVariant(alert.key)}>{alert.count}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;
