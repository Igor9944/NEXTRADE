import { test, expect } from '@playwright/test';

test('admin dashboard shows NexTrade analytics', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  const corsHeaders = () => ({
    'access-control-allow-origin': new URL(page.url()).origin,
    'access-control-allow-credentials': 'true',
    'access-control-allow-methods': 'GET, POST, PATCH, OPTIONS',
    'access-control-allow-headers': 'Content-Type',
  });

  await page.route('**/api/v1/profile/me', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    headers: corsHeaders(),
    body: JSON.stringify({
      status: 'success',
      data: { id: 'admin-1', email: 'admin@nextrade.test', role: 'ADMIN' },
    }),
  }));

  await page.route('**/api/v1/analytics/overview**', (route) => {
    const period = new URL(route.request().url()).searchParams.get('period');
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: corsHeaders(),
      body: JSON.stringify({
        status: 'success',
        data: {
          period,
          kpis: {
            revenue: period === '7d' ? 920000 : 1845000,
            orders_total: 128,
            orders_pending: 12,
            orders_paid: 94,
            clients: 46,
            products: 210,
            stock_units: 3820,
            transactions_total: 102,
          },
          sales_series: [
            { day: '2026-10-01', revenue: 420000 },
            { day: '2026-10-02', revenue: 710000 },
          ],
          orders_by_status: [{ statut: 'VALIDEE', count: 94 }],
          top_products: [],
          critical_stock: [],
          alerts: {
            stock_low: 0,
            stock_out: 0,
            blocked_orders: 0,
            failed_payments: 0,
            late_shipments: 0,
          },
        },
      }),
    });
  });

  await page.goto('/admin/dashboard');

  await expect(page.getByText(/1.?845.?000/)).toBeVisible();
  await expect(page.getByText('128', { exact: true })).toBeVisible();
  await expect(page.getByText(/chiffre d'affaires/i)).toBeVisible();
  await expect(page.getByText(/ventes/i).first()).toBeVisible();
  await expect(page.locator('[data-chart] .recharts-area')).toBeVisible();
  await expect(page.getByText('Aucune alerte stock')).toBeVisible();

  await page.getByLabel('Période').selectOption('7d');
  await expect(page.getByText(/920.?000/)).toBeVisible();
  await expect(pageErrors).toEqual([]);
});
