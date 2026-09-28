# Paiement NexTrade

## Fournisseurs

NexTrade expose une interface unique `PaymentProvider`. Deux adaptateurs :

| `PAYMENT_PROVIDER` | Rôle | Paiement bancaire ? |
| --- | --- | --- |
| `sandbox` | HMAC interne (CI, tests, dev sans clés) | **Non** |
| `stripe` | API Stripe (`PaymentIntents` + `stripe-signature`) | Oui, **uniquement** avec clés sandbox |

Le sandbox HMAC **n’est pas** une passerelle bancaire. Il ne doit jamais être présenté comme un paiement carte.

## Credentials

Rechercher uniquement dans `.env`, variables Vercel, CI. Ne jamais committer les secrets.

Requises pour Stripe sandbox :

```env
PAYMENT_PROVIDER=stripe
PAYMENT_MODE=test
PAYMENT_BASE_URL=https://api.stripe.com
PAYMENT_PUBLIC_KEY=
PAYMENT_SECRET_KEY=
PAYMENT_WEBHOOK_SECRET=
PAYMENT_CURRENCY=XOF
```

Sans `PAYMENT_SECRET_KEY` / `STRIPE_SECRET_KEY` : laisser `PAYMENT_PROVIDER=sandbox`. Ne pas inventer de clés.

## Endpoints

| Méthode | Chemin | Auth |
| --- | --- | --- |
| POST | `/api/v1/payments` | CLIENT, ADMIN |
| GET | `/api/v1/payments/:id` | CLIENT (propriétaire), ADMIN |
| GET | `/api/v1/orders/:id/transactions` | CLIENT (propriétaire), ADMIN |
| POST | `/api/v1/payments/webhook` | signature, **sans JWT** |

Le montant vient de `orders.montant_total`. Le client ne peut pas envoyer `status: SUCCESS`.

## Sandbox HMAC (interne)

En-tête : `x-nextrade-signature: t=<unix_seconds>,v1=<hmac_sha256>`

HMAC sur `"{t}.{raw_json}"` avec `PAYMENT_WEBHOOK_SECRET` (fenêtre 300 s).

```json
{
  "provider_reference": "sbx_<id_transaction>",
  "event_id": "evt-unique",
  "outcome": "SUCCESS"
}
```

`outcome` : `SUCCESS` | `FAILED`.

## Stripe (quand les clés existent)

- Auth : `Authorization: Bearer` (`PAYMENT_SECRET_KEY`)
- Création : `POST /v1/payment_intents`
- Webhook : `stripe-signature` (`t`, `v1`)
- Succès : `payment_intent.succeeded` → transaction `VALIDEE`, commande `PAYEE`
- Échec : `payment_intent.payment_failed` → `ECHOUEE`, commande non `PAYEE`
- Référence : `transactions.reference_externe` = id PaymentIntent

Probe sans clé : l’API Stripe répond 401 « You did not provide an API key ».

## Statuts

`INITIEE` → `EN_ATTENTE` → `VALIDEE` | `ECHOUEE` (`REMBOURSEE` réservé)

Idempotence : index unique `provider_event_id` et `reference_externe`.

## Test frontend

1. `npm run dev` (frontend) + backend à jour
2. Connexion CLIENT → `/payments`
3. Choisir une commande → Payer
4. Le statut affiché est celui de l’API (`EN_ATTENTE` tant que le webhook n’est pas confirmé)
5. Sans URL checkout Stripe, il n’y a pas de redirection bancaire
