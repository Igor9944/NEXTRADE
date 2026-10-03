# NexTrade Database

This directory contains database-related files for the NexTrade project.

## Directories

- `migrations/`: Database schema migrations (using a tool like Flyway, Sequelize, or custom SQL scripts)
- `seeds/`: Seed data for initial setup or testing
- `scripts/`: Utility scripts for database operations (backup, restore, etc.)

## Configuration

The database connection is configured via environment variables in the backend and AI service `.env` files:

- `DB_HOST`: Database host
- `DB_PORT`: Database port (default: 5432)
- `DB_NAME`: Database name (recommended: nextrade)
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password

## Schema and Migrations

The schema is defined by the ordered SQL migrations in `migrations/` (currently `001` through `019`). Apply them in filename order to an empty database:

```bash
for migration in database/migrations/*.sql; do
	psql -h localhost -U nextrade -d nextrade -v ON_ERROR_STOP=1 -f "$migration"
done
```

Start the local PostgreSQL service with `docker compose up -d db` from the repository root. Do not run test suites against the development database.

## Isolated Backend Test Database

Backend integration tests require a separate local database named `nextrade_test`. Rebuild it from the migrations, then add the marker that Jest verifies before running any test:

```bash
createdb -h localhost -U nextrade nextrade_test
for migration in database/migrations/*.sql; do
	psql -h localhost -U nextrade -d nextrade_test -v ON_ERROR_STOP=1 -f "$migration"
done
psql -h localhost -U nextrade -d postgres \
	-c "COMMENT ON DATABASE nextrade_test IS 'NEXTRADE_TEST_DATABASE'"
```

Run backend tests with `NODE_ENV=test DB_HOST=localhost DB_NAME=nextrade_test npm test` from `backend/`. Never mark the development or production database as a test database.