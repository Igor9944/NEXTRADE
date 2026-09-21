import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { Pool } from 'pg';

// Load environment variables
dotenv.config();

// Database connection pool
export const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const app: Application = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Import custom middleware
import { errorMiddleware } from './middlewares/errorMiddleware';
import { authMiddleware } from './middlewares/authMiddleware';

// Make db available to all routes and middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  (req as any).app = app;
  (req as any).db = pool;
  next();
});

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'API NexTrade opérationnelle'
  });
});

// Import components
import { AuthController } from './controllers/authController';
import { AuthService } from './services/authService';
import { UserRepository } from './repositories/userRepository';
import { createAuthRoutes } from './routes/authRoutes';
import testProtectedRoutes from './routes/testProtectedRoutes';

// Initialize services and controllers
const userRepository = new UserRepository(pool);
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

// Setup routes
const authRouter = createAuthRoutes(authController);
app.use('/api/v1/auth', authRouter);

// Test protected routes
app.use('/api/v1/test', authMiddleware, testProtectedRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Error handler
app.use(errorMiddleware);

export default app;
