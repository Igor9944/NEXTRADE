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
import { createShipmentRoutes } from '../src/routes/shipmentRoutes';
import { ShipmentController } from '../src/controllers/shipmentController';
import { ShipmentService } from '../src/services/shipmentService';
import { ShipmentRepository } from '../src/repositories/shipmentRepository';
import { authMiddleware } from '../src/middlewares/authMiddleware';
import { canTransitionShipmentStatus } from '../src/services/shipmentStateMachine';

dotenv.config();

describe('Shipments logistics flow', () => {
  let app: Application;
  let pool: Pool;
  let clientToken: string;
  let clientBToken: string;
  let adminToken: string;
  let supplierToken: string;
  let transporterAToken: string;
  let transporterBToken: string;
  let transporterAId: string;
  let transporterBId: string;
  let clientId: string;
  let productId: string;
  let orderId: string;
  let orderBId: string;
  let shipmentId: string;
  let shipmentBId: string;

  const suffix = Date.now();

  const userBase = {
    password: 'ClientPass123!',
    telephone: '+22891100003',
    nom: 'Log',
    prenom: 'Test',
    adresse: 'Street',
    ville: 'Lome',
    pays: 'Togo'
  };

  const clientUser = { ...userBase, email: `ship-client-a-${suffix}@nextrade.test`, role: 'CLIENT' as const, nom_entreprise: 'Client A' };
  const clientBUser = { ...userBase, email: `ship-client-b-${suffix}@nextrade.test`, role: 'CLIENT' as const, nom_entreprise: 'Client B' };
  const adminUser = { ...userBase, email: `ship-admin-${suffix}@nextrade.test`, role: 'ADMIN' as const, nom_entreprise: 'NexTrade Admin' };
  const supplierUser = { ...userBase, email: `ship-supplier-${suffix}@nextrade.test`, role: 'FOURNISSEUR' as const, nom_entreprise: 'Supplier Ship' };
  const transporterA = { ...userBase, email: `ship-tr-a-${suffix}@nextrade.test`, role: 'TRANSPORTEUR' as const, nom_entreprise: 'Transporteur A' };
  const transporterB = { ...userBase, email: `ship-tr-b-${suffix}@nextrade.test`, role: 'TRANSPORTEUR' as const, nom_entreprise: 'Transporteur B' };

  beforeAll(async () => {
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
      path.join(__dirname, '../../database/migrations/016_extend_shipments.sql'),
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
    const shipmentService = new ShipmentService(pool, new ShipmentRepository(pool), orderRepository, userRepository);

    app = express();
    app.use(express.json());
    app.use((req: Request, res: Response, next: NextFunction) => {
      (req as any).db = pool;
      next();
    });

    app.use('/api/v1/auth', createAuthRoutes(authController));
    app.use('/api/v1/categories', createCategoryRoutes(categoryController));
    app.use('/api/v1/products', createProductRoutes(productController));
    app.use('/api/v1/cart', authMiddleware, createCartRoutes(new CartController(cartService)));
    app.use('/api/v1/orders', authMiddleware, createOrderRoutes(new OrderController(orderService)));
    app.use('/api/v1/shipments', authMiddleware, createShipmentRoutes(new ShipmentController(shipmentService)));
    app.use(errorMiddleware);
  });

  afterAll(async () => {
    const emails = [
      clientUser.email,
      clientBUser.email,
      adminUser.email,
      supplierUser.email,
      transporterA.email,
      transporterB.email
    ];
    const users = await pool.query('SELECT id_user FROM users WHERE email = ANY($1)', [emails]);
    const ids = users.rows.map((row) => row.id_user);
    if (ids.length > 0) {
      await pool.query(
        `DELETE FROM shipment_status_history WHERE id_shipment IN (
           SELECT id_shipment FROM shipments WHERE id_order IN (SELECT id_order FROM orders WHERE id_client = ANY($1))
         )`,
        [ids]
      );
      await pool.query(
        'DELETE FROM shipments WHERE id_order IN (SELECT id_order FROM orders WHERE id_client = ANY($1))',
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

  it('forbids invalid shipment transitions such as LIVREE to PREPARATION', () => {
    expect(canTransitionShipmentStatus('LIVREE', 'PREPARATION', { allowCancel: true })).toBe(false);
    expect(canTransitionShipmentStatus('PREPARATION', 'EN_TRANSIT', { allowCancel: false })).toBe(true);
    expect(canTransitionShipmentStatus('EN_LIVRAISON', 'LIVREE', { allowCancel: false })).toBe(true);
  });

  it('registers actors and creates a paid order ready to ship', async () => {
    const register = async (payload: object) => {
      const response = await request(app).post('/api/v1/auth/register').send(payload);
      expect(response.status).toBe(201);
      return response.body;
    };

    const client = await register(clientUser);
    const clientB = await register(clientBUser);
    const admin = await register(adminUser);
    const supplier = await register(supplierUser);
    const trA = await register(transporterA);
    const trB = await register(transporterB);

    clientToken = client.accessToken;
    clientBToken = clientB.accessToken;
    adminToken = admin.accessToken;
    supplierToken = supplier.accessToken;
    transporterAToken = trA.accessToken;
    transporterBToken = trB.accessToken;
    clientId = client.user.id;
    transporterAId = trA.user.id;
    transporterBId = trB.user.id;

    const category = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${supplierToken}`)
      .send({ nom: `Ship Cat ${suffix}`, description: 'ship' });
    expect(category.status).toBe(201);

    const product = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${supplierToken}`)
      .send({
        nom: `Ship Product ${suffix}`,
        description: 'ship product',
        categorie: category.body.data.nom,
        prix_detail: 40,
        prix_gros: 30
      });
    expect(product.status).toBe(201);
    productId = product.body.data.id_product;
    await pool.query(
      'INSERT INTO inventory (id_product, quantite_disponible, seuil_alerte) VALUES ($1, $2, $3) ON CONFLICT (id_product) DO UPDATE SET quantite_disponible = EXCLUDED.quantite_disponible',
      [productId, 20, 2]
    );

    const addCart = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ productId, quantity: 2 });
    expect(addCart.status).toBe(201);

    const order = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ adresse_livraison: '12 Avenue Commerce, Lomé' });
    expect(order.status).toBe(201);
    orderId = order.body.data.id_order;

    const pay = await request(app)
      .patch(`/api/v1/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ statut: 'PAYEE' });
    expect(pay.status).toBe(200);

    const addCartB = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${clientBToken}`)
      .send({ productId, quantity: 1 });
    expect(addCartB.status).toBe(201);
    const orderB = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${clientBToken}`)
      .send({ adresse_livraison: 'Client B address' });
    expect(orderB.status).toBe(201);
    orderBId = orderB.body.data.id_order;
    await request(app)
      .patch(`/api/v1/orders/${orderBId}/status`)
      .set('Authorization', `Bearer ${clientBToken}`)
      .send({ statut: 'PAYEE' });
  });

  it('rejects shipment creation from a client, missing order, cancelled order and invalid transporter', async () => {
    const asClient = await request(app)
      .post('/api/v1/shipments')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ id_order: orderId });
    expect(asClient.status).toBe(403);

    const missing = await request(app)
      .post('/api/v1/shipments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ id_order: '00000000-0000-0000-0000-000000000000' });
    expect(missing.status).toBe(400);

    const cancel = await request(app)
      .patch(`/api/v1/orders/${orderBId}/status`)
      .set('Authorization', `Bearer ${clientBToken}`)
      .send({ statut: 'ANNULEE' });
    expect(cancel.status).toBe(200);

    const cancelledShip = await request(app)
      .post('/api/v1/shipments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ id_order: orderBId });
    expect(cancelledShip.status).toBe(400);

    const recreateB = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${clientBToken}`)
      .send({ productId, quantity: 1 });
    expect(recreateB.status).toBe(201);
    const newOrderB = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${clientBToken}`)
      .send({ adresse_livraison: 'Client B address 2' });
    expect(newOrderB.status).toBe(201);
    orderBId = newOrderB.body.data.id_order;
    await request(app)
      .patch(`/api/v1/orders/${orderBId}/status`)
      .set('Authorization', `Bearer ${clientBToken}`)
      .send({ statut: 'PAYEE' });
  });

  it('TEST 1: ADMIN creates a shipment from a paid order', async () => {
    const created = await request(app)
      .post('/api/v1/shipments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        id_order: orderId,
        origin: 'Lomé entrepôt',
        destination: 'Kara',
        date_livraison_estimee: '2026-09-30T18:00:00.000Z'
      });

    expect(created.status).toBe(201);
    expect(created.body.data.statut).toBe('PREPARATION');
    expect(created.body.data.reference_shipment).toMatch(/^SHP-\d{4}-\d{6}$/);
    shipmentId = created.body.data.id_shipment;

    const row = await pool.query('SELECT reference_shipment, statut, id_order FROM shipments WHERE id_shipment = $1', [shipmentId]);
    expect(row.rows[0].id_order).toBe(orderId);
    expect(row.rows[0].statut).toBe('PREPARATION');
  });

  it('TEST 2: ADMIN assigns a transporter and rejects invalid assignments', async () => {
    const invalidUser = await request(app)
      .patch(`/api/v1/shipments/${shipmentId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ transporteur_id: clientId });
    expect(invalidUser.status).toBe(400);

    const missing = await request(app)
      .patch(`/api/v1/shipments/${shipmentId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ transporteur_id: '00000000-0000-0000-0000-000000000000' });
    expect(missing.status).toBe(400);

    const assigned = await request(app)
      .patch(`/api/v1/shipments/${shipmentId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ transporteur_id: transporterAId });
    expect(assigned.status).toBe(200);
    expect(assigned.body.data.transporteur_id).toBe(transporterAId);
  });

  it('TEST 3: assigned transporter can consult the shipment', async () => {
    const mine = await request(app)
      .get('/api/v1/shipments/my-assigned')
      .set('Authorization', `Bearer ${transporterAToken}`);
    expect(mine.status).toBe(200);
    expect(mine.body.data.shipments.some((item: { id_shipment: string }) => item.id_shipment === shipmentId)).toBe(true);

    const detail = await request(app)
      .get(`/api/v1/shipments/${shipmentId}`)
      .set('Authorization', `Bearer ${transporterAToken}`);
    expect(detail.status).toBe(200);
    expect(detail.body.data.shipment.id_shipment).toBe(shipmentId);
  });

  it('TEST 4: transporter can move PREPARATION to EN_TRANSIT', async () => {
    const response = await request(app)
      .patch(`/api/v1/shipments/${shipmentId}/status`)
      .set('Authorization', `Bearer ${transporterAToken}`)
      .send({ status: 'EN_TRANSIT' });
    expect(response.status).toBe(200);
    expect(response.body.data.statut).toBe('EN_TRANSIT');
  });

  it('TEST 7: client cannot update shipment status', async () => {
    const response = await request(app)
      .patch(`/api/v1/shipments/${shipmentId}/status`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ statut: 'EN_LIVRAISON' });
    expect(response.status).toBe(403);
  });

  it('TEST 8: transporter B cannot mutate transporter A shipment', async () => {
    const createdB = await request(app)
      .post('/api/v1/shipments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ id_order: orderBId, transporteur_id: transporterBId });
    expect(createdB.status).toBe(201);
    shipmentBId = createdB.body.data.id_shipment;

    const forbidden = await request(app)
      .patch(`/api/v1/shipments/${shipmentId}/status`)
      .set('Authorization', `Bearer ${transporterBToken}`)
      .send({ statut: 'EN_LIVRAISON' });
    expect(forbidden.status).toBe(403);
  });

  it('rejects IDOR when client B reads client A shipment', async () => {
    const response = await request(app)
      .get(`/api/v1/shipments/${shipmentId}`)
      .set('Authorization', `Bearer ${clientBToken}`);
    expect(response.status).toBe(403);
  });

  it('TEST 6: client A can consult tracking', async () => {
    const mine = await request(app)
      .get('/api/v1/shipments/my')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(mine.status).toBe(200);
    expect(mine.body.data.shipments[0].id_shipment).toBe(shipmentId);
    expect(mine.body.data.shipments[0].statut).toBe('EN_TRANSIT');

    const detail = await request(app)
      .get(`/api/v1/shipments/${shipmentId}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(detail.status).toBe(200);
    expect(detail.body.data.history.length).toBeGreaterThan(0);
  });

  it('rejects delivery before EN_LIVRAISON then TEST 5: EN_LIVRAISON to LIVREE', async () => {
    const tooSoon = await request(app)
      .patch(`/api/v1/shipments/${shipmentId}/delivery`)
      .set('Authorization', `Bearer ${transporterAToken}`)
      .send({ recipient_name: 'Jean Doe' });
    expect(tooSoon.status).toBe(400);

    const toDelivery = await request(app)
      .patch(`/api/v1/shipments/${shipmentId}/status`)
      .set('Authorization', `Bearer ${transporterAToken}`)
      .send({ statut: 'EN_LIVRAISON' });
    expect(toDelivery.status).toBe(200);

    const stockBeforeDelivery = await pool.query(
      'SELECT quantite_disponible FROM inventory WHERE id_product = $1',
      [productId]
    );

    const delivered = await request(app)
      .patch(`/api/v1/shipments/${shipmentId}/delivery`)
      .set('Authorization', `Bearer ${transporterAToken}`)
      .send({
        status: 'LIVREE',
        recipient_name: 'Jean Doe',
        delivery_notes: 'Colis remis au destinataire'
      });
    expect(delivered.status).toBe(200);
    expect(delivered.body.data.statut).toBe('LIVREE');
    expect(delivered.body.data.recipient_name).toBe('Jean Doe');

    const stock = await pool.query('SELECT quantite_disponible FROM inventory WHERE id_product = $1', [productId]);
    expect(Number(stock.rows[0].quantite_disponible)).toBe(Number(stockBeforeDelivery.rows[0].quantite_disponible));

    const orderRow = await pool.query('SELECT statut FROM orders WHERE id_order = $1', [orderId]);
    expect(orderRow.rows[0].statut).toBe('LIVREE');

    const clientView = await request(app)
      .get(`/api/v1/shipments/${shipmentId}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(clientView.status).toBe(200);
    expect(clientView.body.data.shipment.statut).toBe('LIVREE');

    const reverse = await request(app)
      .patch(`/api/v1/shipments/${shipmentId}/status`)
      .set('Authorization', `Bearer ${transporterAToken}`)
      .send({ statut: 'PREPARATION' });
    expect(reverse.status).toBe(400);
  });

  it('admin can list and filter shipments', async () => {
    const listed = await request(app)
      .get('/api/v1/shipments')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ reference_shipment: 'SHP-' });
    expect(listed.status).toBe(200);
    expect(listed.body.data.total).toBeGreaterThanOrEqual(1);

    const asSupplier = await request(app)
      .get('/api/v1/shipments')
      .set('Authorization', `Bearer ${supplierToken}`);
    expect(asSupplier.status).toBe(403);
  });
});
