import { Pool } from 'pg';

const PAID = `('PAYEE', 'EN_PREPARATION', 'EXPEDIEE', 'LIVREE')`;

export type AnalyticsPeriod = '7d' | '30d' | '90d' | 'year';

export function periodStart(period: AnalyticsPeriod): Date {
  const now = new Date();
  if (period === 'year') {
    return new Date(now.getFullYear(), 0, 1);
  }
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

export class AnalyticsRepository {
  constructor(private pool: Pool) {}

  async overview(from: Date) {
    const kpis = await this.pool.query(
      `SELECT
         (SELECT COALESCE(SUM(oi.quantite * oi.prix_unitaire_fige), 0)
            FROM order_items oi
            JOIN orders o ON o.id_order = oi.id_order
           WHERE o.statut IN ${PAID} AND o.created_at >= $1) AS revenue,
         (SELECT COUNT(*) FROM orders WHERE created_at >= $1) AS orders_total,
         (SELECT COUNT(*) FROM orders WHERE statut = 'EN_ATTENTE' AND created_at >= $1) AS orders_pending,
         (SELECT COUNT(*) FROM orders WHERE statut = 'PAYEE' AND created_at >= $1) AS orders_paid,
         (SELECT COUNT(*) FROM users WHERE role = 'CLIENT') AS clients,
         (SELECT COUNT(*) FROM users WHERE role = 'FOURNISSEUR') AS suppliers,
         (SELECT COUNT(*) FROM products) AS products,
         (SELECT COALESCE(SUM(quantite_disponible), 0) FROM inventory) AS stock_units,
         (SELECT COUNT(*) FROM inventory WHERE quantite_disponible <= seuil_alerte) AS stock_low,
         (SELECT COUNT(*) FROM inventory WHERE quantite_disponible = 0) AS stock_out,
         (SELECT COUNT(*) FROM transactions WHERE created_at >= $1) AS transactions_total,
         (SELECT COUNT(*) FROM transactions WHERE statut_transaction = 'ECHOUEE' AND created_at >= $1) AS transactions_failed`,
      [from]
    );

    const salesSeries = await this.pool.query(
      `SELECT DATE_TRUNC('day', o.created_at)::date AS day,
              COALESCE(SUM(oi.quantite * oi.prix_unitaire_fige), 0) AS revenue,
              COUNT(DISTINCT o.id_order) AS orders
         FROM orders o
         LEFT JOIN order_items oi ON oi.id_order = o.id_order
        WHERE o.statut IN ${PAID} AND o.created_at >= $1
        GROUP BY 1
        ORDER BY 1`,
      [from]
    );

    const ordersByStatus = await this.pool.query(
      `SELECT statut, COUNT(*)::int AS count
         FROM orders
        WHERE created_at >= $1
        GROUP BY statut
        ORDER BY statut`,
      [from]
    );

    const topProducts = await this.pool.query(
      `SELECT p.id_product, p.nom, p.categorie,
              SUM(oi.quantite)::int AS quantity,
              SUM(oi.quantite * oi.prix_unitaire_fige) AS revenue
         FROM order_items oi
         JOIN orders o ON o.id_order = oi.id_order
         JOIN products p ON p.id_product = oi.id_product
        WHERE o.statut IN ${PAID} AND o.created_at >= $1
        GROUP BY p.id_product, p.nom, p.categorie
        ORDER BY revenue DESC
        LIMIT 5`,
      [from]
    );

    const salesByCategory = await this.pool.query(
      `SELECT COALESCE(NULLIF(p.categorie, ''), 'N/A') AS categorie,
              SUM(oi.quantite * oi.prix_unitaire_fige) AS revenue
         FROM order_items oi
         JOIN orders o ON o.id_order = oi.id_order
         JOIN products p ON p.id_product = oi.id_product
        WHERE o.statut IN ${PAID} AND o.created_at >= $1
        GROUP BY 1
        ORDER BY revenue DESC`,
      [from]
    );

    const criticalStock = await this.pool.query(
      `SELECT p.id_product, p.nom, i.quantite_disponible, i.seuil_alerte
         FROM inventory i
         JOIN products p ON p.id_product = i.id_product
        WHERE i.quantite_disponible <= i.seuil_alerte
        ORDER BY i.quantite_disponible ASC
        LIMIT 20`
    );

    const blockedOrders = await this.pool.query(
      `SELECT COUNT(*)::int AS count
         FROM orders
        WHERE statut = 'EN_ATTENTE' AND created_at < NOW() - INTERVAL '7 days'`
    );

    const lateShipments = await this.pool.query(
      `SELECT COUNT(*)::int AS count
         FROM shipments
        WHERE date_livraison_estimee IS NOT NULL
          AND date_livraison_estimee < NOW()
          AND statut NOT IN ('LIVREE', 'ANNULEE')`
    );

    return {
      kpis: kpis.rows[0],
      sales_series: salesSeries.rows,
      orders_by_status: ordersByStatus.rows,
      top_products: topProducts.rows,
      sales_by_category: salesByCategory.rows,
      critical_stock: criticalStock.rows,
      alerts: {
        stock_low: Number(kpis.rows[0].stock_low),
        stock_out: Number(kpis.rows[0].stock_out),
        blocked_orders: blockedOrders.rows[0].count,
        failed_payments: Number(kpis.rows[0].transactions_failed),
        late_shipments: lateShipments.rows[0].count
      }
    };
  }
}
