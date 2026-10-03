import dotenv from 'dotenv';
import { Pool } from 'pg';

export default async function globalSetup(): Promise<void> {
  dotenv.config({ quiet: true });

  const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  try {
    const result = await pool.query(
      `SELECT current_database() AS database_name,
              shobj_description(oid, 'pg_database') AS test_marker
         FROM pg_database
        WHERE datname = current_database()`
    );
    if (result.rows[0]?.database_name !== 'nextrade_test' || result.rows[0]?.test_marker !== 'NEXTRADE_TEST_DATABASE') {
      throw new Error('Refusing to run backend tests: database lacks the nextrade_test marker');
    }
  } finally {
    await pool.end();
  }
}