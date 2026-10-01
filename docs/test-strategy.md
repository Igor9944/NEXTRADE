# Stratégie de tests obligatoire — mission P3

Cette section **complète PHASE 3 — TESTS** du prompt maître IA / analyses / i18n / dashboard.

Ne passe jamais directement au test End-to-End.

Environnement de validation : **DEV/TEST local** uniquement. Aucun test destructif en production.

```text
PRÉREQUIS
↓
TESTS UNITAIRES
↓
TESTS D’INTÉGRATION
↓
TESTS API
↓
TESTS BASE DE DONNÉES
↓
TESTS FRONTEND
↓
TESTS IA
↓
TESTS MULTILINGUES / RTL
↓
TESTS SÉCURITÉ
↓
TESTS END-TO-END
↓
NON-RÉGRESSION
↓
BUILD FINAL
↓
VERDICT
```

## 1. Critères d’entrée

Avant les tests fonctionnels :

```text
PostgreSQL disponible
API disponible
Service Python disponible
Frontend disponible
Variables d’environnement configurées (sans secrets dans le rapport)
Migrations appliquées
Données de test disponibles
```

Minimum :

```text
GET /health
GET http://127.0.0.1:5000/health
PostgreSQL → SELECT NOW();
Frontend → HTTP 200
```

Si un prérequis critique échoue : **TEST BLOQUÉ**. Ne pas transformer l’échec en PASS.

## 2. Environnements

`DEV` / `TEST` / `PRODUCTION` — la validation utilise DEV/TEST.

## 3. Données de test

Jeu reproductible (`database/seeds/04_demo_analytics.sql`) :

```text
ADMIN          demo.admin@nextrade.test
CLIENT A       demo.client@nextrade.test
CLIENT B       demo.clientb@nextrade.test
FOURNISSEUR    demo.supplier@nextrade.test
TRANSPORTEUR   demo.carrier@nextrade.test
```

Mot de passe de démonstration uniquement (voir le seed). Pas de données personnelles réelles.

Situations : commande payée, en attente, produit vendu / peu vendu, stock normal / faible / rupture.

## 4. Tests unitaires

IA : construction de réponse, contexte module, langue, filtrage secrets, commande inconnue → indisponible.

Analytics : `periodStart`, agrégats CA / commandes / stock (via SQL + Jest).

i18n : clés FR = EN = AR ; clé absente → la clé elle-même.

PDF : buffer `%PDF` en français. **PDF arabe RTL : non implémenté** (pdfkit, pas de reshaper). Ne pas marquer PASS RTL PDF.

Objectif des unitaires concernés : **FAIL = 0**.

## 5. Tests d’intégration

```text
Backend ↔ PostgreSQL
Backend ↔ Python AI (Flask /chat)
Backend ↔ Analytics
Frontend ↔ Backend
```

Vérifier HTTP, JSON, codes, erreurs, timeouts, payload.

## 6. Tests API

Routes réelles (préfixe `/api/v1`) :

| METHOD | URL | AUTH | ROLE |
| --- | --- | --- | --- |
| GET | `/api/v1/analytics/overview` | JWT | ADMIN |
| GET | `/api/v1/analytics/sales` | JWT | ADMIN |
| GET | `/api/v1/analytics/orders` | JWT | ADMIN |
| GET | `/api/v1/analytics/inventory` | JWT | ADMIN |
| POST | `/api/v1/ai/chat` | JWT | authentifié |
| PATCH | `/api/v1/profile/me` | JWT | authentifié |

Pour chaque appel : METHOD, URL, AUTH, ROLE, INPUT, HTTP, OUTPUT, RESULT.

## 7. Tests base de données

Comparer PostgreSQL ↔ API ↔ Dashboard pour CA, nombre de commandes, stock, top produits. Tout écart doit être investigué.

## 8–9. Tests IA

Question simple, FR/EN/AR, contexte module, refus secrets / autres clients.

Commande inexistante : **information indisponible**, pas un statut inventé.

## 10–11. Dashboard et graphiques

KPIs réels. Graphiques non vides sur le seed. Cas vide : pas d’exception JS (`BarList` max=1).

Dates des séries : encore ISO dans l’UI (P2).

## 12–14. Multilingue, RTL, indépendance

FR/EN LTR, AR RTL (`document.documentElement.dir`).

Combinaisons plateforme ≠ assistant, puis refresh / navigation / logout-login / réouverture.

## 15. Documents PDF

Génération LTR française (éventuellement libellés EN à étendre). Inspection réelle du fichier.

Arabe RTL PDF : **non fonctionnel** — ne pas le déclarer PASS.

## 16–18. Persistance, sécurité, non-régression

Sans token → 401. Mauvais rôle analytics → 403. IDOR / autre client via IA → refus.

Non-régression minimale : AUTH, commandes, produits, stock, import/export, shipments, documents, facturation, paiement, notifications.

## 19–20. Frontend runtime et build

`npm run dev` + navigateur. Builds backend / frontend / pytest séparés.

## 21. Priorités

- **P0** : service / API / PostgreSQL / assistant / dashboard inaccessibles, PDF corrompu
- **P1** : mauvais CA, fuite, secrets IA, langue/RTL cassés
- **P2** : visuel, graphique, persistance imparfaite
- **P3** : UI mineure

## 22. Critères d’arrêt

**BLOQUÉ** si PostgreSQL, service IA, dashboard, test multilingue **ou** test PDF (fichier illisible) est impossible.

Un PDF arabe RTL absent n’est **pas** contourné en PASS ; il bloque le critère de sortie « PDF vérifié (FR/EN/AR RTL) ».

## 23–24. Preuves et captures

Dashboard : SQL + API + capture.

IA : requête + réponse + langue + contexte.

PDF : fichier + ouverture. Captures listées dans `docs/captures/` (dashboard FR/EN/AR, assistant FR/AR ; PDF AR RTL **non produit**).

## 25–27. Rapport, sortie, verdict

Table par niveau (Total / Pass / Fail / Bloqué).

Sortie complète seulement si P0=0, P1 bloquant=0, dashboard réel, assistant, FR/EN/AR, RTL UI, PDF (y compris AR si exigé), sécurité, non-régression, build.

Verdict uniquement : VALIDÉE / PARTIELLEMENT VALIDÉE / NON VALIDÉE.

**Règle finale :** CODE + API + PostgreSQL + frontend + IA + i18n + RTL + sécurité + E2E + non-régression. Indiquer TESTÉ / RÉUSSI / ÉCHOUÉ / BLOQUÉ / NON VÉRIFIÉ.

## Dernière exécution (DEV/TEST)

| Niveau      | Total | Pass | Fail | Bloqué |
| ----------- | ----: | ---: | ---: | -----: |
| Unitaires   |    11 |   11 |    0 |      0 |
| Intégration |     4 |    4 |    0 |      0 |
| API         |    10 |   10 |    0 |      0 |
| PostgreSQL  |     2 |    2 |    0 |      0 |
| IA          |     6 |    6 |    0 |      0 |
| Dashboard   |     1 |    1 |    0 |      0 |
| Multilingue |     3 |    3 |    0 |      0 |
| RTL         |     1 |    1 |    0 |      0 |
| Sécurité    |     5 |    5 |    0 |      0 |
| Frontend    |     1 |    1 |    0 |      0 |
| E2E         |     1 |    1 |    0 |      0 |
| Régression  |    10 |    0 |    0 |     10 |

Comptes (unitaires) : pytest 7 + Jest i18n/période/PDF/analyticsAi 7, avec recouvrement analytics. Tableau ci-dessus agrège les contrôles de cette passe.

**TESTÉ / RÉUSSI :** prérequis health, CA 6655 API = PostgreSQL 30 j, 18 commandes, FR/EN/AR assistant, 401/403, commande inconnue → indisponible, mots de passe → 403, build frontend, `tsc`.

**BLOQUÉ / NON VÉRIFIÉ :** PDF arabe RTL (non généré) ; inspection visuelle PDF FR/EN ; logout/login persistance langues ; suite Jest globale (autres fichiers) ; non-régression AUTH…NOTIFICATIONS non rejouée module par module ; console navigateur.

**P0 ouvert :** aucun service down.

**P1 ouvert :** PDF AR RTL exigé par les critères de sortie → empêche VALIDÉE.

Verdict de cette passe : **MISSION PARTIELLEMENT VALIDÉE**.
