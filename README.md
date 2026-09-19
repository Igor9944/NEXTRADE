# NexTrade

Plateforme Web et Mobile intelligente d’Import-Export et de Commerce.

## Objectif

NexTrade est une plateforme complète permettant de gérer l’ensemble du cycle de l’import-export et du commerce international, incluant la gestion des utilisateurs, fournisseurs, clients, produits, achats, ventes, commandes, stocks, logistique, transport, documents, formalités, facturation, paiement, notifications, analyse des données, intelligence artificielle et support multilingue.

## Architecture

L'architecture de référence du projet est :

* Frontend Web : React + TypeScript + Tailwind CSS
* Application Mobile : Flutter + Dart
* Backend/API : Node.js + Express.js + TypeScript
* Base de données : PostgreSQL
* IA / analyse : Python

L’API suit une architecture REST et est organisée de manière modulaire.

## Structure du repository

```text
NexTrade/
├── backend/            # Code serveur Node.js/Express/TypeScript
├── frontend/           # Application web React/TypeScript/Tailwind
├── mobile/             # Application mobile Flutter/Dart
├── ai/                 # Service d'intelligence artificielle Python
├── database/           # Scripts de base de données (migrations, seeds)
├── docs/               # Documentation technique
├── scripts/            # Scripts utilitaires de développement
├── .gitignore
├── .editorconfig
├── README.md
└── docker-compose.yml
```

## Prérequis

Avant d'installer NexTrade, assurez-vous d'avoir installé :

- Node.js (v20+)
- npm (v9+)
- Python 3.11+
- Git
- PostgreSQL
- Flutter (pour le développement mobile)
- Docker (optionnel, pour le déploiement conteneurisé)

## Installation

### 1. Cloner le dépôt

```bash
git clone <repository-url>
cd NexTrade
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Éditez .env pour configurer la base de données et autres variables
```

### 3. Frontend

```bash
cd ../frontend
npm install
cp .env.example .env
# Éditez .env pour définir VITE_API_BASE_URL et VITE_AI_SERVICE_URL
```

### 4. Mobile

```bash
cd ../mobile
# Assurez-vous que Flutter est installé
flutter pub get
```

### 5. Service IA

```bash
cd ../ai
pip install -r requirements.txt
cp .env.example .env
# Éditez .env pour configurer la connexion à la base de données et autres variables
```

### 6. Base de données

Assurez-vous que PostgreSQL est en cours d'exécution et créez la base de données :

```bash
# Exemple (à adapter à votre configuration)
sudo systemctl start postgresql
sudo -u postgres createdb nextrade
sudo -u postgres psql -d nextrade -c "CREATE USER nextrade WITH PASSWORD 'your_password_here';"
sudo -u postgres psql -d nextrade -c "GRANT ALL PRIVILEGES ON DATABASE nextrade TO nextrade;"
```

Mettez à jour les fichiers `.env` du backend et du service IA avec vos identifiants de base de données.

### 7. Docker (optionnel)

Si vous préférez utiliser Docker, assurez-vous que Docker et Docker Compose sont installés, puis démarrez le service PostgreSQL :

```bash
docker-compose up -d db
```

Cela démarrera un conteneur PostgreSQL configuré pour NexTrade.

## Lancement des services

### Backend

```bash
cd backend
npm run dev
```

Le backend sera disponible à l'adresse `http://localhost:3000`.

### Frontend

```bash
cd ../frontend
npm run dev
```

Le frontend sera disponible à l'adresse `http://localhost:5173`.

### Service IA

```bash
cd ../ai
python run.py
```

Le service IA sera disponible à l'adresse `http://localhost:5000`.

### Mobile

```bash
cd ../mobile
flutter run
```

Assurez-vous d'avoir un émulateur en cours d'exécution ou un appareil connecté.

## Variables d'environnement

Chaque service possède son propre fichier `.env` (à partir du fichier `.env.example`). Ne jamais commiter les fichiers `.env` réels dans le référentiel.

### Backend (`backend/.env`)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DB_HOST` | Hôte PostgreSQL | `localhost` |
| `DB_PORT` | Port PostgreSQL | `5432` |
| `DB_NAME` | Nom de la base de données | `nextrade` |
| `DB_USER` | Nom d'utilisateur PostgreSQL | `nextrade` |
| `DB_PASSWORD` | Mot de passe PostgreSQL | `secure_password` |
| `PORT` | Port du serveur backend | `3000` |
| `NODE_ENV` | Environnement (`development`, `production`, `test`) | `development` |
| `API_BASE_URL` | URL de base de l'API backend | `http://localhost:3000` |
| `AI_SERVICE_URL` | URL du service IA | `http://localhost:5000` |

### Frontend (`frontend/.env`)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | URL de l'API backend | `http://localhost:3000` |
| `VITE_AI_SERVICE_URL` | URL du service IA | `http://localhost:5000` |

### Service IA (`ai/.env`)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `FLASK_APP` | Point d'entrée | `run.py` |
| `FLASK_ENV` | Environnement (`development` ou `production`) | `development` |
| `PORT` | Port du service IA | `5000` |
| `DB_HOST` | Hôte PostgreSQL | `localhost` |
| `DB_PORT` | Port PostgreSQL | `5432` |
| `DB_NAME` | Nom de la base de données | `nextrade` |
| `DB_USER` | Nom d'utilisateur PostgreSQL | `nextrade` |
| `DB_PASSWORD` | Mot de passe PostgreSQL | `secure_password` |
| `DATABASE_URL` | Chaîne de connexion complète PostgreSQL (alternative) | `postgresql://nextrade:secure_password@localhost:5432/nextrade` |
| `API_BASE_URL` | URL de l'API backend | `http://localhost:3000` |
| `AI_MODEL_PATH` | Chemin vers les modèles IA (si applicable) | `./models/` |

## Commandes principales

### Backend

- `npm run dev` : Démarre le serveur de développement avec rechargement automatique
- `npm run build` : Compile TypeScript en JavaScript (dans le répertoire `dist/`)
- `npm start` : Démarre le serveur de production (JavaScript compilé)
- `npm test` : Exécute les tests (actuellement un espace réservé)

### Frontend

- `npm run dev` : Démarre le serveur de développement Vite
- `npm run build` : Construit pour la production (dans le répertoire `dist/`)
- `npm run preview` : Prévisualise la construction de production localement

### Mobile

- `flutter pub get` : Récupère les dépendances
- `flutter run` : Exécute l'application sur un émulateur ou un appareil
- `flutter build apk` : Construit un APK Android
- `flutter build ios` : Construit un IPA iOS (nécessite macOS et Xcode)

### Service IA

- `python run.py` : Démarre le serveur de développement Flask
- Pour la production, envisagez d'utiliser un serveur WSGI comme Gunicorn :
  ```bash
  gunicorn --bind 0.0.0.0:5000 run:app
  ```

### Vérification de l'environnement

```bash
./scripts/check-environment
```

### Démarrage de tous les services (développement)

```bash
./scripts/start-dev
```

### Vérification de l'état des services

```bash
./scripts/health-check
```

## État actuel du projet

**PHASE ACTUELLE : SEMAINE 1 — FONDEMENT TECHNIQUE**

À la fin de la semaine 1, le projet possède :

- ✅ Un workspace NexTrade propre
- ✅ Un référentiel Git initialisé
- ✅ Un backend Node.js/TypeScript/Express fonctionnel avec route `/health`
- ✅ Une connexion PostgreSQL préparée (scripts et configuration prêts)
- ✅ Un frontend React/TypeScript/Tailwind fonctionnel avec une page de démarrage
- ✅ Un projet Flutter initialisé (structure prête, nécessite l'installation de Flutter)
- ✅ Un service Python IA initialisé avec endpoint `/health`
- ✅ Une documentation technique complète (`docs/`)
- ✅ Des fichiers `.env.example` propres dans chaque service
- ✅ Des scripts de démarrage et de vérification (`scripts/`)
- ✅ Une structure de projet cohérente
- ✅ Une procédure claire permettant à un autre développeur de cloner et de démarrer le projet

## Roadmap

Voir `docs/roadmap.md` pour le plan détaillé sur 12 semaines.

Résumé :

* Semaine 1 → Socle technique (en cours)
* Semaine 2 → Base de données + architecture métier
* Semaine 3 → Authentification
* Semaine 4 → Clients / Fournisseurs
* Semaine 5 → Produits
* Semaine 6 → Achats / Ventes / Commandes / Stock
* Semaine 7 → Import / Export
* Semaine 8 → Logistique / Expédition
* Semaine 9 → Documents / Facturation
* Semaine 10 → Paiement / Notifications
* Semaine 11 → IA / Dashboard / Multilingue
* Semaine 12 → Tests / Déploiement / Soutenance

## Contribuer

Les contributions sont les bienvenues ! Merci de suivre les bonnes pratiques :

1. Forkez le référentiel
2. Créez une branche pour votre fonctionnalité ou correction
3. Commitez avec des messages clairs et concis
4. Ouvrez une pull request vers la branche `main`
5. Assurez-vous que votre code respecte le style existant

## Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENTE) pour plus de détails.

## Contact

Pour toute question ou suggestion, veuillez ouvrir une issue dans ce référentiel.

---
*Ce fichier README.md a été généré automatiquement lors de la configuration de la Semaine 1.*