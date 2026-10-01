# Dashboard admin

Route : `/admin/dashboard`

Données : `GET /api/v1/analytics/overview`

- KPIs CA, commandes, clients, produits, stock, transactions
- Graphiques barres : ventes, statuts, top produits, stock critique
- Alertes uniquement si les compteurs PostgreSQL existent

Dataset de démonstration : `database/seeds/04_demo_analytics.sql` (comptes `demo.*@nextrade.test`).

Stratégie de tests : [`docs/test-strategy.md`](test-strategy.md).
