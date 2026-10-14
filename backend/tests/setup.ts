import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const localDatabaseHosts = new Set(['localhost', '127.0.0.1', '::1']);
if (
  process.env.NODE_ENV !== 'test' ||
  process.env.DB_NAME !== 'nextrade_test' ||
  !localDatabaseHosts.has(process.env.DB_HOST || '')
) {
  throw new Error('Backend tests require NODE_ENV=test, DB_NAME=nextrade_test, and a loopback DB_HOST');
}