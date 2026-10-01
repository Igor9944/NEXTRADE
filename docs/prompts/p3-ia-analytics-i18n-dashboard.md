# Prompt maître P3 — IA, analyses, multilinguisme et dashboard

Ce fichier ancre le **prompt maître** de la mission P3 dans le dépôt.

Ordre de travail inchangé :

```text
PHASE 0 — FAISABILITÉ
↓
PHASE 1 — ARCHITECTURE
↓
PHASE 2 — IMPLÉMENTATION
↓
PHASE 3 — TESTS
↓
PHASE 4 — CORRECTIONS
↓
PHASE 5 — VALIDATION
```

## PHASE 3 — TESTS

Les tests listés dans le prompt maître (dashboard, KPIs, IA, permissions, FR/EN/AR, RTL, persistance, builds) **ne suffisent pas** à eux seuls.

**Après PHASE 3, appliquer obligatoirement** la stratégie structurée :

→ [`docs/test-strategy.md`](../test-strategy.md)

Un build vert, un test unitaire vert ou une capture d’écran **n’est pas** une validation.

Routes réellement présentes (ne pas inventer `/api/ai/chat`) :

```http
GET  /health
GET  http://127.0.0.1:5000/health
GET  /api/v1/analytics/overview
GET  /api/v1/analytics/sales
GET  /api/v1/analytics/orders
GET  /api/v1/analytics/inventory
POST /api/v1/ai/chat
PATCH /api/v1/profile/me
```
