# Script de soutenance NexTrade

Environnement : **DEV/TEST local**. Pas de production.

Prérequis : PostgreSQL, `backend` `:3000`, `frontend` `:5173`, Flask IA `:5000`, seed `database/seeds/04_demo_analytics.sql`.

Les e-mails ci-dessous sont des **comptes de démonstration**. Le mot de passe n’est **pas** versionné dans le code source : il est défini uniquement dans votre `.env.test` local (même valeur que celle utilisée pour hasher le seed de démo).

## COMPTES DÉMO

| Rôle | Email |
| --- | --- |
| ADMIN | demo.admin@nextrade.test |
| CLIENT A | demo.client@nextrade.test |
| CLIENT B | demo.clientb@nextrade.test |
| FOURNISSEUR | demo.supplier@nextrade.test |
| TRANSPORTEUR | demo.carrier@nextrade.test |
| COMMERCANT | demo.commercant@nextrade.test |

Mot de passe DEMO (local uniquement, **pas** une clé de production) : `ClientPass123!`

## Étape 1

Action : présenter NexTrade (web + mobile + API + PostgreSQL + IA).  
Compte : aucun.  
Résultat attendu : architecture comprise.

## Étape 2

Action : ouvrir `http://127.0.0.1:5173/login`, connexion CLIENT A.  
Compte : demo.client@nextrade.test  
Résultat attendu : redirection catalogue.

## Étape 3

Action : `/catalog`, choisir un produit en stock (ex. Demo Cacao 50kg).  
Résultat attendu : nom, catégorie, prix API.

## Étape 4

Action : ajouter au panier, `/orders`, passer commande (adresse Lome).  
Résultat attendu : total calculé **par le serveur**, commande `EN_ATTENTE` listée.

## Étape 5

Action : `/shipments/my`, ouvrir une expédition existante du seed.  
Résultat attendu : statut réel (ex. `EN_TRANSIT`).

## Étape 6

Action : `/documents`, ouvrir une facture si générée.  
Résultat attendu : métadonnées ; PDF FR via téléchargement (RTL arabe PDF **non** supporté).

## Étape 7

Action : Assistant IA, questions : « Comment suivre ma commande ? » ; « Quels sont les produits les plus vendus ? »  
Résultat attendu : réponses métier limitées, disclaimer.

## Étape 8

Action : déconnexion, login ADMIN, `/admin/dashboard`.  
Compte : demo.admin@nextrade.test  
Résultat attendu : KPIs = PostgreSQL (CA 30 j affiché).

## Scénario mobile

```text
flutter run --dart-define=API_BASE_URL=http://127.0.0.1:3000
→ Login CLIENT A
→ Catalogue
→ Produit
→ Panier / commande
→ Onglet Suivi
```

Questions IA reproductibles :

1. Comment suivre ma commande ?  
2. Quel est le statut EN_TRANSIT ?  
3. Quels sont les produits les plus vendus ? (ADMIN)
