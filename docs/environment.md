# NexTrade Environment Variables

This document lists all environment variables used across the NexTrade services.
Actual values should be placed in `.env` files in each service directory (never committed to version control).

## Backend (Node.js/Express)

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `nextrade` |
| `DB_USER` | Database username | `nextrade` |
| `DB_PASSWORD` | Database password | `secure_password` |
| `PORT` | Port for the backend server | `3000` |
| `NODE_ENV` | Environment (`development`, `production`, `test`) | `development` |
| `API_BASE_URL` | Base URL of the backend API (for internal reference) | `http://localhost:3000` |
| `AI_SERVICE_URL` | URL of the AI service | `http://localhost:5000` |

## Frontend (React/Vite)

Note: Vite exposes environment variables that start with `VITE_`.

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | URL of the backend API | `http://localhost:3000` |
| `VITE_AI_SERVICE_URL` | URL of the AI service (if needed directly) | `http://localhost:5000` |

## Mobile (Flutter/Dart)

Flutter does not use `.env` files by default. Configuration can be handled via:
- Dart constants
- JSON configuration files
- Platform-specific environment handling (e.g., using `flutter_dotenv` package)

For simplicity, during development you can use constants in `lib/core/config.dart` or similar.

## AI Service (Python/Flask)

| Variable | Description | Example |
|----------|-------------|---------|
| `FLASK_APP` | Entry point file | `run.py` |
| `FLASK_ENV` | Environment (`development` or `production`) | `development` |
| `PORT` | Port for the AI service | `5000` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `nextrade` |
| `DB_USER` | Database username | `nextrade` |
| `DB_PASSWORD` | Database password | `secure_password` |
| `DATABASE_URL` | Full PostgreSQL connection string (optional alternative to individual DB_* vars) | `postgresql://nextrade:secure_password@localhost:5432/nextrade` |
| `API_BASE_URL` | URL of the backend API (for calling backend endpoints) | `http://localhost:3000` |
| `AI_MODEL_PATH` | Path to AI models (if applicable) | `./models/` |

## Database (PostgreSQL)

PostgreSQL itself uses environment variables for connection when using client tools like `psql`. The relevant variables are:

| Variable | Description | Example |
|----------|-------------|---------|
| `PGHOST` | PostgreSQL host | `localhost` |
| `PGPORT` | PostgreSQL port | `5432` |
| `PGDATABASE` | Database name | `nextrade` |
| `PGUSER` | Username | `nextrade` |
| `PGPASSWORD` | Password | `secure_password` |

Note: These are standard libpq environment variables. Alternatively, you can specify connection parameters directly in commands.

## Docker (if using docker-compose)

The `docker-compose.yml` file defines environment variables for the services. When overriding, you can create a `.env` file at the project root (not to be confused with service-specific `.env` files). Example variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `POSTGRES_DB` | PostgreSQL database name | `nextrade` |
| `POSTGRES_USER` | PostgreSQL username | `nextrade` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `secure_password` |
| `BACKEND_PORT` | Port for backend on host | `3000` |
| `AI_SERVICE_PORT` | Port for AI service on host | `5000` |

## Naming Conventions

- Use uppercase with underscores for environment variable names.
- Prefix service-specific variables if necessary to avoid collisions (though each service loads its own `.env` file).
- For frontend, Vite requires the `VITE_` prefix to expose variables to the client code.

## Best Practices

- Never commit real `.env` files to Git; only `.env.example` files are version-controlled.
- Use different values for development, testing, and production environments.
- Keep secrets (passwords, API keys) out of version control; use secrets management tools in production.
- Document any new variables in the respective `.env.example` file and update this documentation if they are shared across services.

---

**Note**: This document reflects the Week 1 setup. Additional variables may be introduced in later weeks as new features are added.