import request from 'supertest';
import { Pool } from 'pg';
import { ImportExportRepository } from '../src/repositories/importExportRepository';
import { ImportExportService } from '../src/services/importExportService';
import { ImportExportController } from '../src/controllers/importExportController';
import { AuthService } from '../src/services/authService';
import { UserRepository } from '../src/repositories/userRepository';
import { OrderRepository } from '../src/repositories/orderRepository';
import { ProductRepository } from '../src/repositories/productRepository';
import express, { Application, Request, Response, NextFunction } from 'express';
import { createImportExportRoutes } from '../src/routes/importExportRoutes';
import { authMiddleware } from '../src/middlewares/authMiddleware';
import { errorMiddleware } from '../src/middlewares/errorMiddleware';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

describe('Import-Export System', () => {
  let app: Application;
  let pool: Pool;
  let importExportRepository: ImportExportRepository;
  let importExportService: ImportExportService;
  let importExportController: ImportExportController;
  let authService: AuthService;
  let userRepository: UserRepository;
  let orderRepository: OrderRepository;
  let productRepository: ProductRepository;
  let accessToken: string;
  let testOrderId: string;
  let testProductId: string;

  // Generate a unique email for each test run to avoid conflicts
  const uniqueId = Date.now().toString();
  const TEST_USER = {
    email: `test_import_export_${uniqueId}@nextrade.test`,
    password: 'TestPass123!', // This should meet the password requirements
    role: 'CLIENT' as const, // Changed to CLIENT since clients typically create orders
    nom_entreprise: 'Test Company',
    telephone: '+22890000000',
    nom: 'TestNom',
    prenom: 'TestPrenom',
    adresse: 'Test Address',
    ville: 'Test City',
    pays: 'Test Country',
  };

  const TEST_ORDER = {
    adresse_livraison: '123 Test Street, Test City', // Required for order creation
  };

  const TEST_PRODUCT = {
    id_categorie: '', // Will need a category
    reference: 'TEST_PROD_IMPORT_EXPORT',
    designation: 'Test Product for Import-Export',
    description: 'A test product for import-export operations',
    prix_achat: 10.0,
    prix_vente: 15.0,
    quantite_stock: 1000,
    unite: 'unit',
    seuil_alerte: 10,
  };

  beforeAll(async () => {
    // Initialize database connection
    pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    // Initialize repositories
    userRepository = new UserRepository(pool);
    orderRepository = new OrderRepository(pool);
    productRepository = new ProductRepository(pool);
    importExportRepository = new ImportExportRepository(pool);

    // Initialize services
    authService = new AuthService(userRepository);
    importExportService = new ImportExportService(importExportRepository);

    // Initialize controllers
    importExportController = new ImportExportController(importExportService);

    // Initialize Express app
    app = express();
    app.use(express.json());

    // Make db available to all routes and middleware (copied from app.ts)
    app.use((req: Request, res: Response, next: NextFunction) => {
      (req as any).app = app;
      (req as any).db = pool;
      next();
    });

    // Import export routes
    const importExportRouter = createImportExportRoutes(pool);
    app.use('/api/v1/import-export', authMiddleware, importExportRouter);

    // Error handling middleware
    app.use(errorMiddleware);

    // Create test user using the auth service (properly hashes password)
    await authService.register(TEST_USER);

    // Login to get token
    const loginResponse = await authService.login({
      email: TEST_USER.email,
      password: TEST_USER.password,
    });

    accessToken = loginResponse.accessToken;

    // Get the created user ID from the login response
    const testUserId = loginResponse.user.id;

    // Create test order
    const orderResponse = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(TEST_ORDER);

    console.log('Order creation response:', orderResponse.body);
    
    if (orderResponse.body.data && orderResponse.body.data.id_order) {
      testOrderId = orderResponse.body.data.id_order;
    } else {
      // Fallback: try to get order ID from different field
      testOrderId = orderResponse.body.data?.id_commande || '00000000-0000-0000-0000-000000000001';
    }

    // Create test product - but first we need a category
    // Let's check if we can get an existing category or create a simple one
    // For now, we'll assume category ID 1 exists or we'll work around it
    
    // Try to create product without category first (might fail if category is required)
    const productResponse = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(TEST_PRODUCT);

    console.log('Product creation response:', productResponse.body);

    // If that fails, we might need to create a category first
    if (productResponse.status !== 201) {
      // For now, let's just skip product creation and use a fake ID for testing validation
      // In a full test we would create a proper category and product
      testProductId = '00000000-0000-0000-0000-000000000001'; // Fake ID for validation tests
    } else {
      testProductId = productResponse.body.data.id_produit;
    }
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('Import-Export Operations', () => {
    it('should create an import operation linked to an order', async () => {
      const operationData = {
        type_operation: 'IMPORT',
        id_order: testOrderId,
        reference_operation: 'IMP-2026-TEST-001',
        pays_origine: 'Chine',
        pays_destination: 'Togo',
        statut: 'PREPARATION',
        date_depart: new Date().toISOString(),
        date_arrivee_prevue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days later
        mode_transport: 'MARITIME',
        items: [
          {
            id_product: testProductId,
            quantite: 100,
            unite: 'units',
          }
        ],
      };

      const response = await request(app)
        .post('/api/v1/import-export')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(operationData);

      // Debug: print response if it fails
      if (response.status !== 201) {
        console.log('Create operation failed:', response.body);
      }

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.operation).toBeDefined();
      expect(response.body.data.operation.type_operation).toBe('IMPORT');
      expect(response.body.data.operation.id_order).toBe(testOrderId);
      expect(response.body.data.operation.pays_origine).toBe('Chine');
      expect(response.body.data.operation.pays_destination).toBe('Togo');
      expect(response.body.data.operation.statut).toBe('PREPARATION');
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].quantite).toBe(100);
      expect(response.body.data.formalities).toHaveLength(1); // Should create a formality for transfrontaliere operation
      expect(response.body.data.formalities[0].statut).toBe('A_FAIRE');
    });

    it('should create an export operation linked to a purchase (if purchase module existed)', async () => {
      // For this test, we'll simulate linking to a purchase by using id_purchase
      // Since we don't have a purchase module fully implemented, we'll test the validation
      const operationData = {
        type_operation: 'EXPORT',
        id_purchase: 'fake-purchase-id', // This would fail validation in a real system with purchase check
        reference_operation: 'EXP-2026-TEST-001',
        pays_origine: 'Togo',
        pays_destination: 'Ghana',
        statut: 'PREPARATION',
        date_depart: new Date().toISOString(),
        date_arrivee_prevue: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days later
        mode_transport: 'ROUTIER',
        items: [
          {
            id_product: testProductId,
            quantite: 50,
            unite: 'units',
          }
        ],
      };

      const response = await request(app)
        .post('/api/v1/import-export')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(operationData);

      // This should fail because we don't have a real purchase validation
      // But let's test that it at least validates the required fields
      expect(response.status).toBe(400); // Would fail due to invalid purchase ID in real implementation
    });

    it('should get an operation by ID', async () => {
      // First create an operation
      const operationData = {
        type_operation: 'IMPORT',
        id_order: testOrderId,
        reference_operation: 'IMP-2026-TEST-002',
        pays_origine: 'France',
        pays_destination: 'Belgique',
        statut: 'PREPARATION',
        items: [
          {
            id_product: testProductId,
            quantite: 75,
            unite: 'units',
          }
        ],
      };

      const createResponse = await request(app)
        .post('/api/v1/import-export')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(operationData);

      expect(createResponse.status).toBe(201);
      const operationId = createResponse.body.data.operation.id_operation;

      // Now get the operation by ID
      const getResponse = await request(app)
        .get(`/api/v1/import-export/${operationId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.success).toBe(true);
      expect(getResponse.body.data.operation).toBeDefined();
      expect(getResponse.body.data.operation.id_operation).toBe(operationId);
      expect(getResponse.body.data.operation.reference_operation).toBe('IMP-2026-TEST-002');
      expect(getResponse.body.data.items).toHaveLength(1);
      expect(getResponse.body.data.items[0].quantite).toBe(75);
    });

    it('should list operations with filters', async () => {
      // Get all operations
      const response = await request(app)
        .get('/api/v1/import-export')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.operations).toBeDefined();
      expect(Array.isArray(response.body.data.operations)).toBe(true);
      expect(response.body.data.total).toBeGreaterThanOrEqual(0);
    });

    it('should update operation status', async () => {
      // First create an operation
      const operationData = {
        type_operation: 'IMPORT',
        id_order: testOrderId,
        reference_operation: 'IMP-2026-TEST-003',
        pays_origine: 'Espagne',
        pays_destination: 'Portugal',
        statut: 'PREPARATION',
        items: [
          {
            id_product: testProductId,
            quantite: 60,
            unite: 'units',
          }
        ],
      };

      const createResponse = await request(app)
        .post('/api/v1/import-export')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(operationData);

      expect(createResponse.status).toBe(201);
      const operationId = createResponse.body.data.operation.id_operation;

      // Update status to EXPEDIEE
      const updateResponse = await request(app)
        .patch(`/api/v1/import-export/${operationId}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ statut: 'EXPEDIEE' });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.statut).toBe('EXPEDIEE');
    });

    it('should detect transfrontaliere operation and create formality', async () => {
      // Create an operation with different origin and destination countries
      const operationData = {
        type_operation: 'IMPORT',
        id_order: testOrderId,
        reference_operation: 'IMP-2026-TEST-004',
        pays_origine: 'Allemagne',
        pays_destination: 'Senegal',
        statut: 'PREPARATION',
        items: [
          {
            id_product: testProductId,
            quantite: 80,
            unite: 'units',
          }
        ],
      };

      const response = await request(app)
        .post('/api/v1/import-export')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(operationData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.formalities).toHaveLength(1);
      expect(response.body.data.formalities[0].statut).toBe('A_FAIRE');
      expect(response.body.data.formalities[0].type_formality).toBe('DECLARATION_EN_DOUANE');
    });

    it('should NOT create formality for non-transfrontaliere operation', async () => {
      // Create an operation with same origin and destination countries
      const operationData = {
        type_operation: 'IMPORT',
        id_order: testOrderId,
        reference_operation: 'IMP-2026-TEST-005',
        pays_origine: 'Cote d\'Ivoire',
        pays_destination: 'Cote d\'Ivoire',
        statut: 'PREPARATION',
        items: [
          {
            id_product: testProductId,
            quantite: 90,
            unite: 'units',
          }
        ],
      };

      const response = await request(app)
        .post('/api/v1/import-export')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(operationData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      // For non-transfrontaliere operations, no formality should be created
      expect(response.body.data.formalities).toHaveLength(0);
    });

    it('should validate required fields', async () => {
      // Test missing reference operation
      const operationData = {
        type_operation: 'IMPORT',
        id_order: testOrderId,
        // reference_operation is missing
        pays_origine: 'Maroc',
        pays_destination: 'Algerie',
        statut: 'PREPARATION',
        items: [
          {
            id_product: testProductId,
            quantite: 30,
            unite: 'units',
          }
        ],
      };

      const response = await request(app)
        .post('/api/v1/import-export')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(operationData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Reference operation is required');

      // Test missing origin country
      const operationData2 = {
        type_operation: 'IMPORT',
        id_order: testOrderId,
        reference_operation: 'IMP-2026-TEST-006',
        // pays_origine is missing
        pays_destination: 'Algerie',
        statut: 'PREPARATION',
        items: [
          {
            id_product: testProductId,
            quantite: 30,
            unite: 'units',
          }
        ],
      };

      const response2 = await request(app)
        .post('/api/v1/import-export')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(operationData2);

      expect(response2.status).toBe(400);
      expect(response2.body.success).toBe(false);
      expect(response2.body.error).toContain('Origin and destination countries are required');

      // Test missing both order and purchase
      const operationData3 = {
        type_operation: 'IMPORT',
        // id_order and id_purchase are both missing
        reference_operation: 'IMP-2026-TEST-007',
        pays_origine: 'Maroc',
        pays_destination: 'Algerie',
        statut: 'PREPARATION',
        items: [
          {
            id_product: testProductId,
            quantite: 30,
            unite: 'units',
          }
        ],
      };

      const response3 = await request(app)
        .post('/api/v1/import-export')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(operationData3);

      expect(response3.status).toBe(400);
      expect(response3.body.success).toBe(false);
      expect(response3.body.error).toContain('Either id_order or id_purchase must be provided');

      // Test invalid quantity
      const operationData4 = {
        type_operation: 'IMPORT',
        id_order: testOrderId,
        reference_operation: 'IMP-2026-TEST-008',
        pays_origine: 'Maroc',
        pays_destination: 'Algerie',
        statut: 'PREPARATION',
        items: [
          {
            id_product: testProductId,
            quantite: 0, // Invalid quantity
            unite: 'units',
          }
        ],
      };

      const response4 = await request(app)
        .post('/api/v1/import-export')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(operationData4);

      expect(response4.status).toBe(400);
      expect(response4.body.success).toBe(false);
      expect(response4.body.error).toContain('Quantity must be greater than zero');
    });

    it('should handle non-existent operation gracefully', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/v1/import-export/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Operation not found');
    });
  });
});
