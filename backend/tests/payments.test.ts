import request from 'supertest';
import express, { Application, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { createAuthRoutes } from '../src/routes/authRoutes';
import { AuthController } from '../src/controllers/authController';
import { AuthService } from '../src/services/authService';
import { UserRepository } from '../src/repositories/userRepository';
import { errorMiddleware } from '../src/middlewares/errorMiddleware';
import { createCategoryRoutes } from '../src/routes/categoryRoutes';
import { createProductRoutes } from '../src/routes/productRoutes';
import { CategoryController } from '../src/controllers/categoryController';
import { CategoryService } from '../src/services/categoryService';
import { CategoryRepository } from '../src/repositories/categoryRepository';
import { ProductController } from '../src/controllers/productController';
import { ProductService } from '../src/services/productService';
import { ProductRepository } from '../src/repositories/productRepository';
import { createCartRoutes } from '../src/routes/cartRoutes';
import { CartController } from '../src/controllers/cartController';
import { CartService } from '../src/services/cartService';
import { CartRepository } from '../src/repositories/cartRepository';
import { createOrderRoutes } from '../src/routes/orderRoutes';
import { OrderController } from '../src/controllers/orderController';
import { OrderService } from '../src/services/orderService';
import { OrderRepository } from '../src/repositories/orderRepository';
import { authMiddleware } from '../src/middlewares/authMiddleware';
import { PaymentController } from '../src/controllers/paymentController';
import { PaymentService } from '../src/services/paymentService';
import { PaymentRepository } from '../src/repositories/paymentRepository';
import { createPaymentRoutes } from '../src/routes/paymentRoutes';
import { SignedSandboxPaymentProvider, createHmacSignature } from '../src/services/paymentProvider';
import { InMemoryNotificationProvider, NotificationService } from '../src/services/notificationService';

dotenv.config();

const WEBHOOK_SECRET = 'test-webhook-secret';

describe('Payments and notifications', () => {
  let app: Application;
  let pool: Pool;
  let mailer: InMemoryNotificationProvider;
  let clientToken: string;
  let clientBToken: string;
  let adminToken: string;
  let supplierToken: string;
  let productId: string;
  let orderId: string;
  let orderBId: string;
  const suffix = Date.now();

  const userBase = {
    password: 'ClientPass123!',
    telephone: '+22891100003',
    nom: 'Pay',
    prenom: 'Test',
    adresse: 'Street',
    ville: 'Lome',
    pays: 'Togo'
  };

  const clientUser = { ...userBase, email: `pay-client-a-${suffix}@nextrade.test`, role: 'CLIENT' as const, nom_entreprise: 'Client A Pay' };
  const clientBUser = { ...userBase, email: `pay-client-b-${suffix}@nextrade.test`, role: 'CLIENT' as const, nom_entreprise: 'Client B Pay' };
  const adminUser = { ...userBase, email: `pay-admin-${suffix}@nextrade.test`, role: 'ADMIN' as const, nom_entreprise: 'NexTrade Admin' };
  const supplierUser = { ...userBase, email: `pay-supplier-${suffix}@nextrade.test`, role: 'FOURNISSEUR' as const, nom_entreprise: 'Supplier Pay' };

  beforeAll(async () => {
    process.env.PAYMENT_PROVIDER = 'sandbox';
    process.env.PAYMENT_WEBHOOK_SECRET = WEBHOOK_SECRET;
    process.env.PAYMENT_CURRENCY = 'XOF';
    process.env.PAYMENT_MODE = 'test';

    pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    await pool.query(`CREATE TABLE IF NOT EXISTS carts (
      id_cart UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      id_client UUID NOT NULL UNIQUE REFERENCES users(id_user) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS cart_items (
      id_cart_item UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      id_cart UUID NOT NULL REFERENCES carts(id_cart) ON DELETE CASCADE,
      id_product UUID NOT NULL REFERENCES products(id_product) ON DELETE CASCADE,
      quantite INTEGER NOT NULL CHECK (quantite > 0),
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (id_cart, id_product)
    )`);
    const migration = fs.readFileSync(
      path.join(__dirname, '../../database/migrations/018_extend_transactions_notifications.sql'),
      'utf8'
    );
    await pool.query(migration);

    const userRepository = new UserRepository(pool);
    const authController = new AuthController(new AuthService(userRepository));
    const categoryRepository = new CategoryRepository(pool);
    const categoryController = new CategoryController(new CategoryService(categoryRepository));
    const productRepository = new ProductRepository(pool);
    const cartRepository = new CartRepository(pool);
    const orderRepository = new OrderRepository(pool);
    const productService = new ProductService(productRepository, categoryRepository);
    const productController = new ProductController(productService);
    const cartService = new CartService(cartRepository, productRepository, productService.getProductById.bind(productService));
    const orderService = new OrderService(orderRepository, cartRepository, productRepository, userRepository);
    mailer = new InMemoryNotificationProvider();
    const paymentService = new PaymentService(
      pool,
      new PaymentRepository(pool),
      orderRepository,
      userRepository,
      new SignedSandboxPaymentProvider(WEBHOOK_SECRET),
      new NotificationService(pool, mailer)
    );
    const paymentController = new PaymentController(paymentService);

    app = express();
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.originalUrl === '/api/v1/payments/webhook') {
        return express.raw({ type: 'application/json' })(req, res, next);
      }
      return express.json()(req, res, next);
    });
    app.use((req: Request, res: Response, next: NextFunction) => {
      (req as any).db = pool;
      next();
    });
    app.use('/api/v1/auth', createAuthRoutes(authController));
    app.use('/api/v1/categories', createCategoryRoutes(categoryController));
    app.use('/api/v1/products', createProductRoutes(productController));
    app.use('/api/v1/cart', authMiddleware, createCartRoutes(new CartController(cartService)));
    app.use('/api/v1/orders', authMiddleware, createOrderRoutes(new OrderController(orderService), undefined, paymentController));
    app.post('/api/v1/payments/webhook', paymentController.webhook);
    app.use('/api/v1/payments', authMiddleware, createPaymentRoutes(paymentController));
    app.use(errorMiddleware);
  });

  afterAll(async () => {
    const emails = [clientUser.email, clientBUser.email, adminUser.email, supplierUser.email];
    const users = await pool.query('SELECT id_user FROM users WHERE email = ANY($1)', [emails]);
    const ids = users.rows.map((row) => row.id_user);
    if (ids.length > 0) {
      await pool.query(
        'DELETE FROM notification_events WHERE aggregate_id IN (SELECT id_order FROM orders WHERE id_client = ANY($1))',
        [ids]
      );
      await pool.query(
        'DELETE FROM transactions WHERE id_order IN (SELECT id_order FROM orders WHERE id_client = ANY($1))',
        [ids]
      );
      await pool.query(
        'DELETE FROM order_status_history WHERE id_order IN (SELECT id_order FROM orders WHERE id_client = ANY($1))',
        [ids]
      );
      await pool.query('DELETE FROM order_items WHERE id_order IN (SELECT id_order FROM orders WHERE id_client = ANY($1))', [ids]);
      await pool.query('DELETE FROM orders WHERE id_client = ANY($1)', [ids]);
      await pool.query('DELETE FROM cart_items WHERE id_cart IN (SELECT id_cart FROM carts WHERE id_client = ANY($1))', [ids]);
      await pool.query('DELETE FROM carts WHERE id_client = ANY($1)', [ids]);
      const products = await pool.query('SELECT id_product FROM products WHERE id_fournisseur = ANY($1)', [ids]);
      for (const row of products.rows) {
        await pool.query('DELETE FROM inventory WHERE id_product = $1', [row.id_product]);
      }
      await pool.query('DELETE FROM products WHERE id_fournisseur = ANY($1)', [ids]);
      await pool.query('DELETE FROM users WHERE id_user = ANY($1)', [ids]);
    }
    await pool.end();
  });

  const signedWebhook = (payload: object) => {
    const raw = JSON.stringify(payload);
    const timestamp = String(Math.floor(Date.now() / 1000));
    const v1 = createHmacSignature(WEBHOOK_SECRET, timestamp, Buffer.from(raw, 'utf8'));
    return { raw, header: `t=${timestamp},v1=${v1}` };
  };

  it('creates a server-side amount transaction, webhook success, idempotency, IDOR and failure path', async () => {
    const register = async (payload: object) => {
      const response = await request(app).post('/api/v1/auth/register').send(payload);
      expect(response.status).toBe(201);
      return response.body;
    };

    const client = await register(clientUser);
    const clientB = await register(clientBUser);
    const admin = await register(adminUser);
    const supplier = await register(supplierUser);
    clientToken = client.accessToken;
    clientBToken = clientB.accessToken;
    adminToken = admin.accessToken;
    supplierToken = supplier.accessToken;

    const categoryResponse = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${supplierToken}`)
      .send({ nom: `Pay Cat ${suffix}`, description: 'pay' });
    expect(categoryResponse.status).toBe(201);

    const productResponse = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${supplierToken}`)
      .send({
        nom: `Pay Product ${suffix}`,
        description: 'pay product',
        categorie: categoryResponse.body.data.nom,
        prix_detail: 100,
        prix_gros: 90
      });
    expect(productResponse.status).toBe(201);
    productId = productResponse.body.data.id_product;
    await pool.query(
      'INSERT INTO inventory (id_product, quantite_disponible, seuil_alerte) VALUES ($1, $2, $3) ON CONFLICT (id_product) DO UPDATE SET quantite_disponible = EXCLUDED.quantite_disponible',
      [productId, 20, 1]
    );

    await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ productId, quantity: 2 });
    const order = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ adresse_livraison: 'Lome' });
    expect(order.status).toBe(201);
    orderId = order.body.data.id_order;
    expect(order.body.data.montant_total).toBe('200.00');

    await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${clientBToken}`)
      .send({ productId, quantity: 1 });
    const orderB = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${clientBToken}`)
      .send({ adresse_livraison: 'Kara' });
    expect(orderB.status).toBe(201);
    orderBId = orderB.body.data.id_order;

    const forbiddenStatus = await request(app)
      .post('/api/v1/payments')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ order_id: orderId, amount: 1, status: 'SUCCESS' });
    expect(forbiddenStatus.status).toBe(400);

    const supplierPay = await request(app)
      .post('/api/v1/payments')
      .set('Authorization', `Bearer ${supplierToken}`)
      .send({ order_id: orderId });
    expect(supplierPay.status).toBe(403);

    const initiated = await request(app)
      .post('/api/v1/payments')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ order_id: orderId, amount: 1 });
    expect(initiated.status).toBe(201);
    const transaction = initiated.body.data.transaction;
    expect(transaction.montant_paye).toBe('200.00');
    expect(transaction.statut_transaction).toBe('EN_ATTENTE');
    expect(transaction.reference_externe).toMatch(/^sbx_/);

    const idor = await request(app)
      .get(`/api/v1/payments/${transaction.id_transaction}`)
      .set('Authorization', `Bearer ${clientBToken}`);
    expect(idor.status).toBe(403);

    const idorList = await request(app)
      .get(`/api/v1/orders/${orderId}/transactions`)
      .set('Authorization', `Bearer ${clientBToken}`);
    expect(idorList.status).toBe(403);

    const unsigned = await request(app)
      .post('/api/v1/payments/webhook')
      .set('Content-Type', 'application/json')
      .send({ provider_reference: transaction.reference_externe, event_id: 'evt-unsigned', outcome: 'SUCCESS' });
    expect(unsigned.status).toBe(401);

    const successPayload = {
      provider_reference: transaction.reference_externe,
      event_id: `evt-success-${suffix}`,
      outcome: 'SUCCESS'
    };
    const signed = signedWebhook(successPayload);
    const webhook1 = await request(app)
      .post('/api/v1/payments/webhook')
      .set('Content-Type', 'application/json')
      .set('x-nextrade-signature', signed.header)
      .send(signed.raw);
    expect(webhook1.status).toBe(200);
    expect(webhook1.body.data.transaction.statut_transaction).toBe('VALIDEE');
    expect(webhook1.body.data.duplicate).toBe(false);
    expect(webhook1.body.data.notification).toBe('SENT');
    expect(mailer.emails).toHaveLength(1);
    expect(mailer.emails[0].to).toBe(clientUser.email);
    expect(mailer.emails[0].subject).toContain(orderId);

    const orderPaid = await request(app)
      .get(`/api/v1/orders/${orderId}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(orderPaid.status).toBe(200);
    expect(orderPaid.body.data.statut).toBe('PAYEE');

    const webhook2 = await request(app)
      .post('/api/v1/payments/webhook')
      .set('Content-Type', 'application/json')
      .set('x-nextrade-signature', signed.header)
      .send(signed.raw);
    expect(webhook2.status).toBe(200);
    expect(webhook2.body.data.duplicate).toBe(true);
    expect(mailer.emails).toHaveLength(1);

    const adminView = await request(app)
      .get(`/api/v1/payments/${transaction.id_transaction}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminView.status).toBe(200);

    const failInit = await request(app)
      .post('/api/v1/payments')
      .set('Authorization', `Bearer ${clientBToken}`)
      .send({ order_id: orderBId });
    expect(failInit.status).toBe(201);
    const failTx = failInit.body.data.transaction;
    const failSigned = signedWebhook({
      provider_reference: failTx.reference_externe,
      event_id: `evt-fail-${suffix}`,
      outcome: 'FAILED'
    });
    const failedWebhook = await request(app)
      .post('/api/v1/payments/webhook')
      .set('Content-Type', 'application/json')
      .set('x-nextrade-signature', failSigned.header)
      .send(failSigned.raw);
    expect(failedWebhook.status).toBe(200);
    expect(failedWebhook.body.data.transaction.statut_transaction).toBe('ECHOUEE');
    const orderFailed = await request(app)
      .get(`/api/v1/orders/${orderBId}`)
      .set('Authorization', `Bearer ${clientBToken}`);
    expect(orderFailed.body.data.statut).not.toBe('PAYEE');
    expect(mailer.emails).toHaveLength(1);
  });
});
