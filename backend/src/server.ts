import app from './app';
import { pool } from './app';

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
  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

startServer();
