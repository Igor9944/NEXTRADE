import request from 'supertest';
import express, { Application, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import os from 'os';
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
import { createImportExportRoutes } from '../src/routes/importExportRoutes';
import { authMiddleware } from '../src/middlewares/authMiddleware';
import { DocumentController } from '../src/controllers/documentController';
import { DocumentService } from '../src/services/documentService';
import { DocumentRepository } from '../src/repositories/documentRepository';
import { ImportExportRepository } from '../src/repositories/importExportRepository';
import { ShipmentRepository } from '../src/repositories/shipmentRepository';
import { StorageService } from '../src/services/storageService';
import { PdfService } from '../src/services/pdfService';
import { createShipmentRoutes } from '../src/routes/shipmentRoutes';
import { ShipmentController } from '../src/controllers/shipmentController';
import { ShipmentService } from '../src/services/shipmentService';
import {
  createDocumentRoutes,
  createInvoiceRoutes,
  createFormalityRoutes,
  createImportExportDocumentRoutes
} from '../src/routes/documentRoutes';

dotenv.config();

const MIN_PDF = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n');

describe('Documents, invoices and customs formalities', () => {
  let app: Application;
  let pool: Pool;
  let clientToken: string;
  let clientBToken: string;
  let adminToken: string;
  let supplierToken: string;
  let transporterAToken: string;
  let transporterBToken: string;
  let transporterAId: string;
  let clientId: string;
  let productId: string;
  let productBId: string;
  let orderId: string;
  let orderBId: string;
  let documentId: string;
  let invoiceId: string;
  let packingId: string;
  let operationId: string;
  let formalityId: string;
  const suffix = Date.now();
  const storageRoot = path.join(os.tmpdir(), `nextrade-docs-${suffix}`);

  const userBase = {
    password: 'ClientPass123!',
    telephone: '+22891100003',
    nom: 'Doc',
    prenom: 'Test',
    adresse: 'Street',
    ville: 'Lome',
    pays: 'Togo'
  };

  const clientUser = { ...userBase, email: `doc-client-a-${suffix}@nextrade.test`, role: 'CLIENT' as const, nom_entreprise: 'Client A Docs' };
  const clientBUser = { ...userBase, email: `doc-client-b-${suffix}@nextrade.test`, role: 'CLIENT' as const, nom_entreprise: 'Client B Docs' };
  const adminUser = { ...userBase, email: `doc-admin-${suffix}@nextrade.test`, role: 'ADMIN' as const, nom_entreprise: 'NexTrade Admin' };
  const supplierUser = { ...userBase, email: `doc-supplier-${suffix}@nextrade.test`, role: 'FOURNISSEUR' as const, nom_entreprise: 'Supplier Docs' };
  const transporterA = { ...userBase, email: `doc-tr-a-${suffix}@nextrade.test`, role: 'TRANSPORTEUR' as const, nom_entreprise: 'Transporteur A' };
  const transporterB = { ...userBase, email: `doc-tr-b-${suffix}@nextrade.test`, role: 'TRANSPORTEUR' as const, nom_entreprise: 'Transporteur B' };

  beforeAll(async () => {
    process.env.STORAGE_DRIVER = 'local';
    process.env.STORAGE_LOCAL_ROOT = storageRoot;
    process.env.INVOICE_TAX_RATE = '0';

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
      path.join(__dirname, '../../database/migrations/017_extend_documents_invoices.sql'),
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
    const documentService = new DocumentService(
      pool,
      new DocumentRepository(pool),
      orderRepository,
      productRepository,
      new ImportExportRepository(pool),
      new ShipmentRepository(pool),
      userRepository,
      new StorageService(),
      new PdfService()
    );
    const documentController = new DocumentController(documentService);
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
    app.use('/api/v1/orders', authMiddleware, createOrderRoutes(new OrderController(orderService), documentController));
    app.use('/api/v1/shipments', authMiddleware, createShipmentRoutes(new ShipmentController(shipmentService)));
    app.use('/api/v1/import-export', createImportExportRoutes(pool));
    app.use('/api/v1/import-export', authMiddleware, createImportExportDocumentRoutes(documentController));
    app.use('/api/v1/documents', authMiddleware, createDocumentRoutes(documentController));
    app.use('/api/v1/invoices', authMiddleware, createInvoiceRoutes(documentController));
    app.use('/api/v1/formalities', authMiddleware, createFormalityRoutes(documentController));
    app.use(errorMiddleware);
  });

  afterAll(async () => {
    const emails = [clientUser.email, clientBUser.email, adminUser.email, supplierUser.email, transporterA.email, transporterB.email];
    const users = await pool.query('SELECT id_user FROM users WHERE email = ANY($1)', [emails]);
    const ids = users.rows.map((row) => row.id_user);
    if (ids.length > 0) {
      await pool.query(
        `DELETE FROM document_history WHERE id_document IN (
           SELECT id_document FROM documents WHERE id_shipment IN (
             SELECT id_shipment FROM shipments WHERE id_order IN (SELECT id_order FROM orders WHERE id_client = ANY($1))
           )
         )`,
        [ids]
      );
      await pool.query(
        `DELETE FROM documents WHERE id_shipment IN (
           SELECT id_shipment FROM shipments WHERE id_order IN (SELECT id_order FROM orders WHERE id_client = ANY($1))
         )`,
        [ids]
      );
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
        `DELETE FROM formality_history WHERE id_formality IN (
           SELECT id_formality FROM customs_formalities WHERE id_operation IN (
             SELECT id_operation FROM import_export_operations WHERE id_order IN (
               SELECT id_order FROM orders WHERE id_client = ANY($1)
             )
           )
         )`,
        [ids]
      );
      await pool.query(
        `DELETE FROM customs_formalities WHERE id_operation IN (
           SELECT id_operation FROM import_export_operations WHERE id_order IN (
             SELECT id_order FROM orders WHERE id_client = ANY($1)
           )
         )`,
        [ids]
      );
      await pool.query(
        `DELETE FROM import_export_items WHERE id_operation IN (
           SELECT id_operation FROM import_export_operations WHERE id_order IN (
             SELECT id_order FROM orders WHERE id_client = ANY($1)
           )
         )`,
        [ids]
      );
      await pool.query(
        'DELETE FROM import_export_operations WHERE id_order IN (SELECT id_order FROM orders WHERE id_client = ANY($1))',
        [ids]
      );
      await pool.query(
        `DELETE FROM invoice_history WHERE id_invoice IN (
           SELECT id_invoice FROM invoices WHERE id_order IN (SELECT id_order FROM orders WHERE id_client = ANY($1))
         )`,
        [ids]
      );
      await pool.query(
        'DELETE FROM invoices WHERE id_order IN (SELECT id_order FROM orders WHERE id_client = ANY($1))',
        [ids]
      );
      await pool.query(
        `DELETE FROM document_history WHERE id_document IN (
           SELECT id_document FROM documents WHERE id_order IN (SELECT id_order FROM orders WHERE id_client = ANY($1))
         )`,
        [ids]
      );
      await pool.query('DELETE FROM documents WHERE id_order IN (SELECT id_order FROM orders WHERE id_client = ANY($1))', [ids]);
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
    fs.rmSync(storageRoot, { recursive: true, force: true });
  });

  it('creates actors, order, invoice PDF, packing list, upload, IDOR, formalities and history', async () => {
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

    const categoryResponse = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${supplierToken}`)
      .send({ nom: `Doc Cat ${suffix}`, description: 'docs' });
    expect(categoryResponse.status).toBe(201);

    const productResponse = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${supplierToken}`)
      .send({
        nom: `Doc Product A ${suffix}`,
        description: 'docs product A',
        categorie: categoryResponse.body.data.nom,
        prix_detail: 100,
        prix_gros: 90
      });
    expect(productResponse.status).toBe(201);
    productId = productResponse.body.data.id_product;
    const productBResponse = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${supplierToken}`)
      .send({
        nom: `Doc Product B ${suffix}`,
        description: 'docs product B',
        categorie: categoryResponse.body.data.nom,
        prix_detail: 50,
        prix_gros: 40
      });
    expect(productBResponse.status).toBe(201);
    productBId = productBResponse.body.data.id_product;
    await pool.query(
      'INSERT INTO inventory (id_product, quantite_disponible, seuil_alerte) VALUES ($1, $2, $3) ON CONFLICT (id_product) DO UPDATE SET quantite_disponible = EXCLUDED.quantite_disponible',
      [productId, 20, 1]
    );
    await pool.query(
      'INSERT INTO inventory (id_product, quantite_disponible, seuil_alerte) VALUES ($1, $2, $3) ON CONFLICT (id_product) DO UPDATE SET quantite_disponible = EXCLUDED.quantite_disponible',
      [productBId, 20, 1]
    );

    await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ productId, quantity: 2 });
    await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ productId: productBId, quantity: 3 });

    const order = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ adresse_livraison: 'Lome' });
    expect(order.status).toBe(201);
    orderId = order.body.data.id_order;
    expect(order.body.data.montant_total).toBe('350.00');

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

    const invoice = await request(app)
      .post(`/api/v1/orders/${orderId}/invoice`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(invoice.status).toBe(201);
    expect(invoice.body.data.invoice.montant_ttc).toBe('350.00');
    expect(invoice.body.data.invoice.id_client).toBe(clientId);
    invoiceId = invoice.body.data.invoice.id_invoice;
    documentId = invoice.body.data.document.id_document;

    const duplicate = await request(app)
      .post(`/api/v1/orders/${orderId}/invoice`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(duplicate.status).toBe(409);

    const pdf = await request(app)
      .get(`/api/v1/invoices/${invoiceId}/download`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(pdf.status).toBe(200);
    expect(pdf.headers['content-type']).toMatch(/pdf/);
    expect(Buffer.isBuffer(pdf.body) || Buffer.from(pdf.body).subarray(0, 4).toString() === '%PDF' || pdf.text.startsWith('%PDF')).toBeTruthy();

    const idorInvoice = await request(app)
      .get(`/api/v1/invoices/${invoiceId}`)
      .set('Authorization', `Bearer ${clientBToken}`);
    expect(idorInvoice.status).toBe(403);

    const supplierInvoice = await request(app)
      .get(`/api/v1/invoices/${invoiceId}`)
      .set('Authorization', `Bearer ${supplierToken}`);
    expect(supplierInvoice.status).toBe(403);

    const packing = await request(app)
      .post(`/api/v1/orders/${orderId}/packing-list`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(packing.status).toBe(201);
    packingId = packing.body.data.id_document;

    const upload = await request(app)
      .post('/api/v1/documents')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('type_document', 'PACKING_LIST')
      .field('id_order', orderId)
      .attach('file', MIN_PDF, { filename: 'packing-scan.pdf', contentType: 'application/pdf' });
    expect(upload.status).toBe(201);
    expect(upload.body.data.reference_document).toMatch(/^DOC-\d{4}-\d{6}$/);

    const badType = await request(app)
      .post('/api/v1/documents')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('type_document', 'AUTRE')
      .field('id_order', orderId)
      .attach('file', Buffer.from('not-a-pdf'), { filename: 'note.txt', contentType: 'text/plain' });
    expect(badType.status).toBe(400);

    const exe = await request(app)
      .post('/api/v1/documents')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('type_document', 'AUTRE')
      .field('id_order', orderId)
      .attach('file', Buffer.from('MZ'), { filename: 'malware.exe', contentType: 'application/octet-stream' });
    expect(exe.status).toBe(400);

    const shell = await request(app)
      .post('/api/v1/documents')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('type_document', 'AUTRE')
      .field('id_order', orderId)
      .attach('file', Buffer.from('#!/bin/sh\n'), { filename: 'run.sh', contentType: 'application/x-sh' });
    expect(shell.status).toBe(400);

    const traversal = await request(app)
      .post('/api/v1/documents')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('type_document', 'AUTRE')
      .field('id_order', orderId)
      .attach('file', MIN_PDF, { filename: '../../etc/passwd.pdf', contentType: 'application/pdf' });
    expect(traversal.status).toBe(201);
    expect(traversal.body.data.original_file_name).toBe('passwd.pdf');
    expect(traversal.body.data.storage_key).toMatch(new RegExp(`^documents/orders/${orderId}/`));
    expect(traversal.body.data.storage_key).not.toMatch(/\.\./);

    const clientList = await request(app)
      .get('/api/v1/documents')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(clientList.status).toBe(200);
    expect(clientList.body.data.documents.length).toBeGreaterThan(0);

    const idorDoc = await request(app)
      .get(`/api/v1/documents/${documentId}`)
      .set('Authorization', `Bearer ${clientBToken}`);
    expect(idorDoc.status).toBe(403);

    const download = await request(app)
      .get(`/api/v1/documents/${packingId}/download`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(download.status).toBe(200);

    const supplierList = await request(app)
      .get('/api/v1/documents')
      .set('Authorization', `Bearer ${supplierToken}`);
    expect(supplierList.status).toBe(200);
    expect(supplierList.body.data.documents.length).toBe(0);

    const ie = await request(app).post('/api/v1/import-export').send({
      type_operation: 'EXPORT',
      id_order: orderId,
      reference_operation: `IE-DOC-${suffix}`,
      pays_origine: 'Chine',
      pays_destination: 'Togo',
      items: [{ id_product: productId, quantite: 2, unite: 'u' }]
    });
    expect(ie.status).toBe(201);
    operationId = ie.body.data.operation.id_operation;
    expect(ie.body.data.formalities.length).toBeGreaterThan(0);
    formalityId = ie.body.data.formalities[0].id_formality;

    const formalities = await request(app)
      .get(`/api/v1/import-export/${operationId}/formalities`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(formalities.status).toBe(200);

    const toEncours = await request(app)
      .patch(`/api/v1/formalities/${formalityId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ statut: 'EN_COURS' });
    expect(toEncours.status).toBe(200);
    const toTermine = await request(app)
      .patch(`/api/v1/formalities/${formalityId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ statut: 'TERMINE' });
    expect(toTermine.status).toBe(200);
    const invalid = await request(app)
      .patch(`/api/v1/formalities/${formalityId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ statut: 'A_FAIRE' });
    expect(invalid.status).toBe(400);

    const history = await request(app)
      .get(`/api/v1/formalities/${formalityId}/history`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(history.status).toBe(200);
    expect(history.body.data.history.length).toBeGreaterThan(0);

    const persisted = await pool.query('SELECT numero_facture, montant_ttc FROM invoices WHERE id_invoice = $1', [invoiceId]);
    expect(persisted.rows[0].montant_ttc).toBe('350.00');
    const stored = await pool.query('SELECT storage_key FROM documents WHERE id_document = $1', [documentId]);
    expect(stored.rows[0].storage_key).toMatch(new RegExp(`^documents/orders/${orderId}/`));
    expect(fs.existsSync(path.join(storageRoot, stored.rows[0].storage_key))).toBe(true);

    const dossier = await request(app)
      .get(`/api/v1/orders/${orderId}/documents`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(dossier.status).toBe(200);
    expect(dossier.body.data.invoice.id_invoice).toBe(invoiceId);
    expect(dossier.body.data.formalities.length).toBeGreaterThan(0);

    const pay = await request(app)
      .patch(`/api/v1/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ statut: 'PAYEE' });
    expect(pay.status).toBe(200);
    const shipment = await request(app)
      .post('/api/v1/shipments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ id_order: orderId });
    expect(shipment.status).toBe(201);
    const shipmentId = shipment.body.data.id_shipment;
    const assigned = await request(app)
      .patch(`/api/v1/shipments/${shipmentId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ transporteur_id: transporterAId });
    expect(assigned.status).toBe(200);
    const transportDoc = await request(app)
      .post('/api/v1/documents')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('type_document', 'DOCUMENT_TRANSPORT')
      .field('id_shipment', shipmentId)
      .attach('file', MIN_PDF, { filename: 'cmr.pdf', contentType: 'application/pdf' });
    expect(transportDoc.status).toBe(201);
    const transportId = transportDoc.body.data.id_document;
    const trARead = await request(app)
      .get(`/api/v1/documents/${transportId}`)
      .set('Authorization', `Bearer ${transporterAToken}`);
    expect(trARead.status).toBe(200);
    const trBRead = await request(app)
      .get(`/api/v1/documents/${transportId}`)
      .set('Authorization', `Bearer ${transporterBToken}`);
    expect(trBRead.status).toBe(403);
  });

  it('forbids unauthenticated document access', async () => {
    const response = await request(app).get('/api/v1/documents');
    expect(response.status).toBe(401);
  });
});
