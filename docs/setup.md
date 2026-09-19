# NexTrade Setup Guide

This guide explains how to set up the NexTrade project for development.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v20+)
- npm (comes with Node.js)
- Python 3.11+
- Git
- PostgreSQL
- Flutter (for mobile development)
- Docker (optional, for containerized deployment)

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd NexTrade
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` to set your database credentials and other configuration.

### 3. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd ../frontend
npm install
```

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` to set the API and AI service URLs (if different from defaults).

### 4. Mobile Setup

Navigate to the mobile directory. Ensure Flutter is installed, then get the dependencies:

```bash
cd ../mobile
flutter pub get
```

Note: If Flutter is not installed, follow the installation guide at https://flutter.dev/docs/get-started/install.

### 5. AI Service Setup

Navigate to the AI directory and install dependencies:

```bash
cd ../ai
pip install -r requirements.txt
```

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` to set the database connection and other configuration.

### 6. Database Setup

Ensure PostgreSQL is running and create the database:

```bash
# Example commands (adjust for your setup)
sudo systemctl start postgresql
sudo -u postgres createdb nextrade
sudo -u postgres psql -d nextrade -c "CREATE USER nextrade WITH PASSWORD 'your_password_here';"
sudo -u postgres psql -d nextrade -c "GRANT ALL PRIVILEGES ON DATABASE nextrade TO nextrade;"
```

Update the `.env` files in the backend and AI directories with your database credentials.

### 7. Docker Setup (Optional)

If you prefer to use Docker, ensure Docker and Docker Compose are installed, then start the PostgreSQL service:

```bash
docker-compose up -d db
```

This will start a PostgreSQL container configured for NexTrade.

## Starting the Services

### Backend

```bash
cd backend
npm run dev
```

The backend will be available at `http://localhost:3000`.

### Frontend

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### AI Service

```bash
cd ai
python run.py
```

The AI service will be available at `http://localhost:5000`.

### Mobile

```bash
cd mobile
flutter run
```

Ensure you have an emulator running or a device connected.

## Verification

After starting all services, you can verify the setup:

1. Backend health: `curl http://localhost:3000/health`
2. Frontend: Open `http://localhost:5173` in a browser
3. AI service: `curl http://localhost:5000/health`
4. Mobile: The app should launch on your emulator/device
5. Database: Check that you can connect to PostgreSQL with the credentials in `.env`

## Troubleshooting

- **Port already in use**: Change the port in the respective `.env` files.
- **Database connection failed**: Verify PostgreSQL is running and the credentials in `.env` are correct.
- **Module not found**: Ensure you ran `npm install` or `pip install -r requirements.txt` in the respective directories.
- **Flutter not found**: Install Flutter as per the official guide.

## Environment Variables

Refer to `.env.example` files in each service directory for required variables. Never commit actual `.env` files to version control.

---

**Note**: This setup guide is for Week 1 (technical foundation). As the project evolves, additional steps may be required for new features.