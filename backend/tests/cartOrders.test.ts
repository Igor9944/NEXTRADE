import request from 'supertest';
import express, { Application, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
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

dotenv.config();

describe('Cart and order flow', () => {
  let app: Application;
  let pool: Pool;
  let clientToken: string;
  let supplierToken: string;
  let productId: string;
  let cartItemId: string;
  let orderId: string;

  const clientUser = {
    email: `client-${Date.now()}@nextrade.test`,
    password: 'ClientPass123!',
    role: 'CLIENT' as const,
    nom_entreprise: 'Client Shop',
    telephone: '+22891100003',
    nom: 'Client',
    prenom: 'Order',
    adresse: 'Client Street',
    ville: 'Lome',
    pays: 'Togo'
  };

  const supplierUser = {
    email: `supplier-${Date.now()}@nextrade.test`,
    password: 'SupplierPass123!',
    role: 'FOURNISSEUR' as const,
    nom_entreprise: 'Supplier Order',
    telephone: '+22891100004',
    nom: 'Supplier',
    prenom: 'Order',
    adresse: 'Supplier Street',
    ville: 'Lome',
    pays: 'Togo'
  };

  beforeAll(async () => {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
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

    await pool.query(`CREATE TABLE IF NOT EXISTS order_status_history (
      id_status_history UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      id_order UUID NOT NULL REFERENCES orders(id_order) ON DELETE CASCADE,
      statut VARCHAR(50) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )`);

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
    const cartController = new CartController(cartService);
    const orderController = new OrderController(orderService);

    app = express();
    app.use(express.json());
    app.use((req: Request, res: Response, next: NextFunction) => {
      (req as any).db = pool;
      next();
    });

    app.use('/api/v1/auth', createAuthRoutes(authController));
    app.use('/api/v1/categories', createCategoryRoutes(categoryController));
    app.use('/api/v1/products', createProductRoutes(productController));
    app.use('/api/v1/cart', authMiddleware, createCartRoutes(cartController));
    app.use('/api/v1/orders', authMiddleware, createOrderRoutes(orderController));
    app.use(errorMiddleware);

    await pool.query('DELETE FROM users WHERE email = $1', [clientUser.email]);
    await pool.query('DELETE FROM users WHERE email = $1', [supplierUser.email]);
  });

  afterAll(async () => {
    const clientRow = await pool.query('SELECT id_user FROM users WHERE email = $1', [clientUser.email]);
    const supplierRow = await pool.query('SELECT id_user FROM users WHERE email = $1', [supplierUser.email]);

    if (clientRow.rows[0]) {
      const clientId = clientRow.rows[0].id_user;
      await pool.query('DELETE FROM order_status_history WHERE id_order IN (SELECT id_order FROM orders WHERE id_client = $1)', [clientId]);
      await pool.query('DELETE FROM order_items WHERE id_order IN (SELECT id_order FROM orders WHERE id_client = $1)', [clientId]);
      await pool.query('DELETE FROM orders WHERE id_client = $1', [clientId]);
      await pool.query('DELETE FROM cart_items WHERE id_cart IN (SELECT id_cart FROM carts WHERE id_client = $1)', [clientId]);
      await pool.query('DELETE FROM carts WHERE id_client = $1', [clientId]);
    }

    if (supplierRow.rows[0]) {
      const supplierId = supplierRow.rows[0].id_user;
      const supplierProducts = await pool.query('SELECT id_product FROM products WHERE id_fournisseur = $1', [supplierId]);
      for (const row of supplierProducts.rows) {
        await pool.query('DELETE FROM order_status_history WHERE id_order IN (SELECT id_order FROM orders WHERE id_client = $1)', [clientRow.rows[0]?.id_user ?? null]);
        await pool.query('DELETE FROM cart_items WHERE id_product = $1', [row.id_product]);
        await pool.query('DELETE FROM order_items WHERE id_product = $1', [row.id_product]);
        await pool.query('DELETE FROM inventory WHERE id_product = $1', [row.id_product]);
      }
      await pool.query('DELETE FROM products WHERE id_fournisseur = $1', [supplierId]);
    }

    if (productId) {
      await pool.query('DELETE FROM cart_items WHERE id_product = $1', [productId]);
      await pool.query('DELETE FROM order_items WHERE id_product = $1', [productId]);
      await pool.query('DELETE FROM inventory WHERE id_product = $1', [productId]);
      await pool.query('DELETE FROM products WHERE id_product = $1', [productId]);
    }

    await pool.query('DELETE FROM users WHERE email = $1', [clientUser.email]);
    await pool.query('DELETE FROM users WHERE email = $1', [supplierUser.email]);
    await pool.end();
  });

  it('should create a client cart and add a product to it', async () => {
    const clientRegister = await request(app)
      .post('/api/v1/auth/register')
      .send(clientUser);

    expect(clientRegister.status).toBe(201);
    clientToken = clientRegister.body.accessToken;

    const supplierRegister = await request(app)
      .post('/api/v1/auth/register')
      .send(supplierUser);

    expect(supplierRegister.status).toBe(201);
    supplierToken = supplierRegister.body.accessToken;

    const categoryResponse = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${supplierToken}`)
      .send({ nom: `Cart Test Category ${Date.now()}`, description: 'Category used by cart tests' });

    expect(categoryResponse.status).toBe(201);

    const productResponse = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${supplierToken}`)
      .send({
        nom: `Cart Test Product ${Date.now()}`,
        description: 'Product for cart testing',
        categorie: categoryResponse.body.data.nom,
        prix_detail: 100,
        prix_gros: 80
      });

    expect(productResponse.status).toBe(201);
    productId = productResponse.body.data.id_product;

    await pool.query('INSERT INTO inventory (id_product, quantite_disponible, seuil_alerte) VALUES ($1, $2, $3) ON CONFLICT (id_product) DO UPDATE SET quantite_disponible = EXCLUDED.quantite_disponible', [productId, 12, 3]);

    const cartAddResponse = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ productId, quantity: 2 });

    expect(cartAddResponse.status).toBe(201);
    expect(cartAddResponse.body.data.quantity).toBe(2);
    cartItemId = cartAddResponse.body.data.id_cart_item;

    const cartResponse = await request(app)
      .get('/api/v1/cart')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(cartResponse.status).toBe(200);
    expect(cartResponse.body.data.items.length).toBe(1);
    expect(cartResponse.body.data.total).toBe('200.00');
  });

  it('should create an order with fixed price snapshot and decrement stock', async () => {
    const createOrder = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        adresse_livraison: '12 Rue de l\'Exemple, Lomé'
      });

    expect(createOrder.status).toBe(201);
    expect(createOrder.body.data.montant_total).toBe('200.00');
    expect(createOrder.body.data.statut).toBe('EN_ATTENTE');
    orderId = createOrder.body.data.id_order;

    const inventoryRow = await pool.query('SELECT quantite_disponible FROM inventory WHERE id_product = $1', [productId]);
    expect(Number(inventoryRow.rows[0].quantite_disponible)).toBe(10);

    const orderItems = await pool.query('SELECT prix_unitaire_fige, quantite FROM order_items WHERE id_order = $1', [orderId]);
    expect(orderItems.rows[0].prix_unitaire_fige).toBe('100.00');
  });

  it('should reject an insufficient stock order and keep the stock untouched', async () => {
    const insufficientProduct = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${supplierToken}`)
      .send({
        nom: `Stock Guard Product ${Date.now()}`,
        description: 'Insufficient stock product',
        categorie: 'Stock test',
        prix_detail: 50,
        prix_gros: 40
      });

    expect(insufficientProduct.status).toBe(201);
    const guardProductId = insufficientProduct.body.data.id_product;
    await pool.query('INSERT INTO inventory (id_product, quantite_disponible, seuil_alerte) VALUES ($1, $2, $3) ON CONFLICT (id_product) DO UPDATE SET quantite_disponible = EXCLUDED.quantite_disponible', [guardProductId, 2, 1]);

    const addCart = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ productId: guardProductId, quantity: 3 });

    expect(addCart.status).toBe(201);

    const attempt = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ adresse_livraison: '12 Rue de l\'Exemple, Lomé' });

    expect(attempt.status).toBe(400);
    expect(attempt.body.message).toMatch(/stock/i);

    const stockAfter = await pool.query('SELECT quantite_disponible FROM inventory WHERE id_product = $1', [guardProductId]);
    expect(Number(stockAfter.rows[0].quantite_disponible)).toBe(2);

    await pool.query('DELETE FROM cart_items WHERE id_product = $1', [guardProductId]);
    await pool.query('DELETE FROM order_items WHERE id_product = $1', [guardProductId]);
    await pool.query('DELETE FROM inventory WHERE id_product = $1', [guardProductId]);
    await pool.query('DELETE FROM products WHERE id_product = $1', [guardProductId]);
  });

  it('should allow cancellation and restore stock', async () => {
    const cancelResponse = await request(app)
      .patch(`/api/v1/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ statut: 'ANNULEE' });

    expect(cancelResponse.status).toBe(200);
    expect(cancelResponse.body.data.statut).toBe('ANNULEE');

    const stockAfterCancel = await pool.query('SELECT quantite_disponible FROM inventory WHERE id_product = $1', [productId]);
    expect(Number(stockAfterCancel.rows[0].quantite_disponible)).toBe(12);
  });
});
