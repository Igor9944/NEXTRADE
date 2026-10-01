import app, { pool } from './app';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Test database connection
const testDatabaseConnection = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('Database connection established');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

const startServer = async () => {
  await testDatabaseConnection();
  
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

// Handle graceful shutdown
const shutdown = async (signal: string) => {
  console.log(`Received ${signal}; shutting down gracefully...`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
  setTimeout(async () => {
    await pool.end();
    process.exit(1);
  }, 10_000).unref();
};

process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));

startServer();
