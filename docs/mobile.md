# Application mobile NexTrade

## Installation Flutter

Le dépôt n’embarque pas le SDK. Installez Flutter stable, puis :

```bash
export PATH="$PATH:$HOME/.local/flutter/bin"   # si cloné localement
cd mobile
flutter pub get
flutter test
flutter run --dart-define=API_BASE_URL=http://127.0.0.1:3000
```

`flutter doctor` doit être vert pour la cible visée (Android SDK pour APK, Chrome pour `flutter run -d chrome`).

## Configuration

- URL API : `--dart-define=API_BASE_URL=http://HOST:3000`
- JWT : `flutter_secure_storage` (jamais dans Git ni dans les logs)
- Timeout : 15 s ; message « réseau indisponible » si l’API ne répond pas

Le mobile ne calcule pas le montant : `POST /api/v1/orders` utilise le panier serveur.

## Architecture

```text
lib/
  config/env.dart
  core/api_client.dart, api_exception.dart, token_store.dart
  models/
  repositories/     # auth, catalog, cart, orders, shipments
  auth/login_screen.dart
  catalog/
  orders/
  shipments/
  session.dart
  main.dart
```

## API utilisées

```text
POST /api/v1/auth/login
GET  /api/v1/products/catalog
GET  /api/v1/products/:id
GET/POST /api/v1/cart, /api/v1/cart/items
POST /api/v1/orders
GET  /api/v1/orders
GET  /api/v1/orders/:id
GET  /api/v1/shipments/my
GET  /api/v1/shipments/:id
```

## Tests

```bash
cd mobile && flutter test
```

## Build

```bash
flutter build apk --dart-define=API_BASE_URL=https://api.example
flutter build web --dart-define=API_BASE_URL=https://api.example
```

N’indiquez PASS que pour les cibles réellement exécutées.
