# Notifications NexTrade

## Événement obligatoire

| Événement | Déclencheur | Canal |
| --- | --- | --- |
| `ORDER_PAID` | Webhook paiement `SUCCESS` après transaction `VALIDEE` et commande `PAYEE` | e-mail |

Règle : **aucun e-mail** sur `PAYMENT_FAILED` / transaction `ECHOUEE`. L’échec reste visible dans la transaction et le statut commande.

## Architecture

```text
PaymentService
  → événement métier ORDER_PAID
  → NotificationService
  → NotificationProvider.sendEmail()
```

Les canaux `sendSMS`, `sendPush`, `sendWhatsApp` existent sur l’interface et renvoient 501. Ils ne sont pas implémentés.

Idempotence e-mail : table `notification_events` UNIQUE `(event_type, aggregate_id, channel)`.

## Template e-mail (ORDER_PAID)

- **Objet :** `Confirmation de paiement — Commande {id_order}`
- **Corps :** commande, montant, référence transaction interne, référence passerelle, statut `PAYEE`
- **Interdit :** mot de passe, JWT, secrets passerelle, PAN, CVV

## Provider actuel

`MAIL_PROVIDER=smtp` via Nodemailer.

Développement : **Mailpit** (`MAIL_HOST=127.0.0.1`, `MAIL_PORT=1025`, UI `http://127.0.0.1:8025`).

`ORDER_PAID` n’est émis **qu’après** confirmation webhook (`VALIDEE`). Un simple `POST /api/v1/payments` (initiation `EN_ATTENTE`) n’envoie pas d’e-mail.

## Variables

```env
MAIL_PROVIDER=smtp
MAIL_HOST=127.0.0.1
MAIL_PORT=1025
MAIL_USER=
MAIL_PASSWORD=
MAIL_FROM=nextrade@localhost
```

Les secrets SMTP ne sont jamais loggés.

## Erreurs

Si l’envoi SMTP échoue, l’événement reste `PENDING` et un retry du webhook (nouvel appel `handleOrderPaid` après succès déjà validé) peut renvoyer l’e-mail tant que le statut n’est pas `SENT`. Un événement déjà `SENT` est ignoré.
