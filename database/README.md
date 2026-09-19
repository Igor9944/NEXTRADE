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

## Setup

1. Ensure PostgreSQL is installed and running.
2. Create a database named `nextrade` (or as per your configuration).
3. Update the `.env` files with your database credentials.
4. Run migrations (to be implemented) to create the necessary tables.

## Notes

- This week focuses on setting up the connection and structure.
- No actual tables are created yet; that will be part of Week 2.
- For development, you can use Docker Compose to start a PostgreSQL instance (see docker-compose.yml at the project root).