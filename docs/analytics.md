# Analytics NexTrade

## Architecture

```text
PostgreSQL → AnalyticsRepository → GET /api/v1/analytics/overview → Dashboard admin
```

Pas de `SELECT *`. Index sur dates/statuts commandes, produits, stock.

## KPIs (sources réelles)

| Indicateur | Source |
| --- | --- |
| CA | `order_items.quantite * prix_unitaire_fige` pour commandes `PAYEE`, `EN_PREPARATION`, `EXPEDIEE`, `LIVREE` |
| Commandes | `orders` |
| Clients / Fournisseurs | `users.role` |
| Stock / seuil / rupture | `inventory` |
| Transactions / échecs | `transactions` |
| Top produits / catégories | `order_items` + `products` |

## Périodes

`7d`, `30d`, `90d`, `year`

## Alertes

Stock faible, rupture, commandes `EN_ATTENTE` > 7 jours, paiements `ECHOUEE`, expéditions en retard (`date_livraison_estimee` dépassée).

Stratégie de tests (après PHASE 3) : [`docs/test-strategy.md`](test-strategy.md).

## Endpoint

`GET /api/v1/analytics/overview?period=30d` — **ADMIN** uniquement.
