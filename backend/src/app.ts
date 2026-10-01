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
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors());
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl === '/api/v1/payments/webhook') {
    return express.raw({ type: 'application/json' })(req, res, next);
  }
  return express.json()(req, res, next);
});

// Import custom middleware
import { errorMiddleware } from './middlewares/errorMiddleware';
import { authMiddleware } from './middlewares/authMiddleware';
import { requireRole } from './middlewares/roleMiddleware';

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

// Initialize services and controllers
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

// Setup routes
const authRouter = createAuthRoutes(authController);
app.use('/api/v1/auth', authRouter);

// Supplier routes
const supplierRouter = createSupplierRoutes(supplierController);
app.use('/api/v1/suppliers', supplierRouter);

// Profile routes
const profileRouter = createProfileRoutes(profileController);
app.use('/api/v1/profile', profileRouter);

// Client routes
const clientRouter = createClientRoutes(clientController);
app.use('/api/v1/clients', clientRouter);

// Catalogue routes
const categoryRouter = createCategoryRoutes(categoryController);
app.use('/api/v1/categories', categoryRouter);
const productRouter = createProductRoutes(productController);
app.use('/api/v1/products', productRouter);

// Cart and order routes
const cartRouter = createCartRoutes(cartController);
app.use('/api/v1/cart', authMiddleware, cartRouter);
const orderRouter = createOrderRoutes(orderController, documentController, paymentController);
app.use('/api/v1/orders', authMiddleware, orderRouter);

const shipmentRouter = createShipmentRoutes(shipmentController);
app.use('/api/v1/shipments', authMiddleware, shipmentRouter);

// Import-Export routes
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
