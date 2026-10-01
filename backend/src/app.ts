import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';
const jwtSecret = process.env.JWT_SECRET || '';

if (isProduction && jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be set to at least 32 characters in production');
}

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (isProduction && allowedOrigins.length === 0) {
  throw new Error('CORS_ORIGINS must be configured in production');
}

const poolConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: parseInt(process.env.DB_POOL_MAX || '20', 10),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000
};

export const pool = new Pool(poolConfig);

const app: Application = express();

app.disable('x-powered-by');

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true
}));

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl === '/api/v1/payments/webhook') {
    return express.raw({ type: 'application/json', limit: '1mb' })(req, res, next);
  }
  return express.json({ limit: '1mb' })(req, res, next);
});

// Lightweight in-process protection for auth endpoints.
// For multi-instance production deployments, use a shared rate limiter at the edge.
const authAttempts = new Map<string, { count: number; resetAt: number }>();
const AUTH_WINDOW_MS = 15 * 60 * 1000;
const AUTH_MAX_ATTEMPTS = 30;

const authRateLimit = (req: Request, res: Response, next: NextFunction) => {
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const current = authAttempts.get(key);

  if (!current || current.resetAt <= now) {
    authAttempts.set(key, { count: 1, resetAt: now + AUTH_WINDOW_MS });
    return next();
  }

  if (current.count >= AUTH_MAX_ATTEMPTS) {
    return res.status(429).json({
      status: 'error',
      message: 'Too many authentication attempts. Please try again later.'
    });
  }

  current.count += 1;
  return next();
};

import { errorMiddleware } from './middlewares/errorMiddleware';
import { authMiddleware } from './middlewares/authMiddleware';
import { requireRole } from './middlewares/roleMiddleware';

app.use((req: Request, res: Response, next: NextFunction) => {
  (req as any).app = app;
  (req as any).db = pool;
  next();
});

app.get('/health', async (_req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({
      status: 'success',
      message: 'API NexTrade opérationnelle',
      database: 'connected'
    });
  } catch {
    res.status(503).json({
      status: 'error',
      message: 'API NexTrade indisponible',
      database: 'unavailable'
    });
  }
});

import { AuthController } from './controllers/authController';
import { AuthService } from './services/authService';
import { UserRepository } from './repositories/userRepository';
import { createAuthRoutes } from './routes/authRoutes';
import testProtectedRoutes from './routes/testProtectedRoutes';
import { SupplierController } from './controllers/supplierController';
import { SupplierService } from './services/supplierService';
import { SupplierRepository } from './repositories/supplierRepository';
import { ProfileController } from './controllers/profileController';
import { ClientController } from './controllers/clientController';
import { createSupplierRoutes } from './routes/supplierRoutes';
import { createProfileRoutes } from './routes/profileRoutes';
import { createClientRoutes } from './routes/clientRoutes';
import { createCategoryRoutes } from './routes/categoryRoutes';
import { createProductRoutes } from './routes/productRoutes';
import { createCartRoutes } from './routes/cartRoutes';
import { createOrderRoutes } from './routes/orderRoutes';
import { createShipmentRoutes } from './routes/shipmentRoutes';
import { createImportExportRoutes } from './routes/importExportRoutes';
import {
  createDocumentRoutes,
  createInvoiceRoutes,
  createFormalityRoutes,
  createImportExportDocumentRoutes
} from './routes/documentRoutes';
import { CategoryController } from './controllers/categoryController';
import { CategoryService } from './services/categoryService';
import { CategoryRepository } from './repositories/categoryRepository';
import { ProductController } from './controllers/productController';
import { ProductService } from './services/productService';
import { ProductRepository } from './repositories/productRepository';
import { CartController } from './controllers/cartController';
import { CartService } from './services/cartService';
import { CartRepository } from './repositories/cartRepository';
import { OrderController } from './controllers/orderController';
import { OrderService } from './services/orderService';
import { OrderRepository } from './repositories/orderRepository';
import { ShipmentController } from './controllers/shipmentController';
import { ShipmentService } from './services/shipmentService';
import { ShipmentRepository } from './repositories/shipmentRepository';
import { DocumentController } from './controllers/documentController';
import { DocumentService } from './services/documentService';
import { DocumentRepository } from './repositories/documentRepository';
import { ImportExportRepository } from './repositories/importExportRepository';
import { StorageService } from './services/storageService';
import { PdfService } from './services/pdfService';
import { PaymentController } from './controllers/paymentController';
import { PaymentService } from './services/paymentService';
import { PaymentRepository } from './repositories/paymentRepository';
import { createPaymentProvider } from './services/paymentProvider';
import { NotificationService, createNotificationProvider } from './services/notificationService';
import { NotificationController } from './controllers/notificationController';
import { createNotificationRoutes } from './routes/notificationRoutes';
import { createPaymentRoutes } from './routes/paymentRoutes';
import { AnalyticsController } from './controllers/analyticsController';
import { AnalyticsService } from './services/analyticsService';
import { AnalyticsRepository } from './repositories/analyticsRepository';
import { createAnalyticsRoutes } from './routes/analyticsRoutes';
import { AiController } from './controllers/aiController';
import { AiService } from './services/aiService';
import { createAiRoutes } from './routes/aiRoutes';

const userRepository = new UserRepository(pool);
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);
const supplierRepository = new SupplierRepository(pool);
const supplierService = new SupplierService(supplierRepository);
const supplierController = new SupplierController(supplierService);
const profileController = new ProfileController(userRepository);
const clientController = new ClientController(userRepository);
const categoryRepository = new CategoryRepository(pool);
const categoryService = new CategoryService(categoryRepository);
const categoryController = new CategoryController(categoryService);
const productRepository = new ProductRepository(pool);
const productService = new ProductService(productRepository, categoryRepository);
const productController = new ProductController(productService);
const cartRepository = new CartRepository(pool);
const cartService = new CartService(cartRepository, productRepository, productService.getProductById.bind(productService));
const cartController = new CartController(cartService);
const orderRepository = new OrderRepository(pool);
const orderService = new OrderService(orderRepository, cartRepository, productRepository, userRepository);
const orderController = new OrderController(orderService);
const shipmentRepository = new ShipmentRepository(pool);
const shipmentService = new ShipmentService(pool, shipmentRepository, orderRepository, userRepository);
const shipmentController = new ShipmentController(shipmentService);
const documentRepository = new DocumentRepository(pool);
const documentService = new DocumentService(
  pool,
  documentRepository,
  orderRepository,
  productRepository,
  new ImportExportRepository(pool),
  shipmentRepository,
  userRepository,
  new StorageService(),
  new PdfService()
);
const documentController = new DocumentController(documentService);
const notificationService = new NotificationService(pool, createNotificationProvider());
const paymentService = new PaymentService(
  pool,
  new PaymentRepository(pool),
  orderRepository,
  userRepository,
  createPaymentProvider(),
  notificationService
);
const paymentController = new PaymentController(paymentService);
const analyticsService = new AnalyticsService(new AnalyticsRepository(pool));
const analyticsController = new AnalyticsController(analyticsService);
const aiController = new AiController(
  new AiService(process.env.AI_SERVICE_URL || 'http://127.0.0.1:5000'),
  analyticsService
);

const authRouter = createAuthRoutes(authController);
app.use('/api/v1/auth', authRateLimit, authRouter);

const supplierRouter = createSupplierRoutes(supplierController);
app.use('/api/v1/suppliers', supplierRouter);

const profileRouter = createProfileRoutes(profileController);
app.use('/api/v1/profile', profileRouter);

const clientRouter = createClientRoutes(clientController);
app.use('/api/v1/clients', clientRouter);

const categoryRouter = createCategoryRoutes(categoryController);
app.use('/api/v1/categories', categoryRouter);
const productRouter = createProductRoutes(productController);
app.use('/api/v1/products', productRouter);

const cartRouter = createCartRoutes(cartController);
app.use('/api/v1/cart', authMiddleware, cartRouter);
const orderRouter = createOrderRoutes(orderController, documentController, paymentController);
app.use('/api/v1/orders', authMiddleware, orderRouter);

const shipmentRouter = createShipmentRoutes(shipmentController);
app.use('/api/v1/shipments', authMiddleware, shipmentRouter);

const importExportRouter = createImportExportRoutes(pool);
app.use(
  '/api/v1/import-export',
  authMiddleware,
  requireRole('ADMIN', 'CLIENT', 'FOURNISSEUR', 'COMMERCANT'),
  importExportRouter
);
app.use('/api/v1/import-export', authMiddleware, createImportExportDocumentRoutes(documentController));

app.use('/api/v1/documents', authMiddleware, createDocumentRoutes(documentController));
app.use('/api/v1/invoices', authMiddleware, createInvoiceRoutes(documentController));
app.use('/api/v1/formalities', authMiddleware, createFormalityRoutes(documentController));

app.post('/api/v1/payments/webhook', paymentController.webhook);
app.use('/api/v1/payments', authMiddleware, createPaymentRoutes(paymentController));
app.use('/api/v1/notifications', authMiddleware, createNotificationRoutes(new NotificationController(notificationService)));
app.use('/api/v1/analytics', authMiddleware, createAnalyticsRoutes(analyticsController));
app.use('/api/v1/ai', authMiddleware, createAiRoutes(aiController));

app.use('/api/v1/test', authMiddleware, testProtectedRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

app.use(errorMiddleware);

export default app;
