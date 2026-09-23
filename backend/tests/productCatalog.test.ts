import request from 'supertest';
import express, { Application, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { createAuthRoutes } from '../src/routes/authRoutes';
import { AuthController } from '../src/controllers/authController';
import { AuthService } from '../src/services/authService';
import { UserRepository } from '../src/repositories/userRepository';
import { errorMiddleware } from '../src/middlewares/errorMiddleware';
import { authMiddleware } from '../src/middlewares/authMiddleware';
import { createCategoryRoutes } from '../src/routes/categoryRoutes';
import { createProductRoutes } from '../src/routes/productRoutes';
import { CategoryController } from '../src/controllers/categoryController';
import { CategoryService } from '../src/services/categoryService';
import { CategoryRepository } from '../src/repositories/categoryRepository';
import { ProductController } from '../src/controllers/productController';
import { ProductService } from '../src/services/productService';
import { ProductRepository } from '../src/repositories/productRepository';

dotenv.config();

describe('Product catalog and pricing', () => {
  let app: Application;
  let pool: Pool;
  let adminToken: string;
  let supplierToken: string;
  let categoryId: string;
  let productId: string;

  const adminUser = {
    email: 'catalog-admin@nextrade.test',
    password: 'AdminPass123!',
    role: 'ADMIN' as const,
    nom_entreprise: 'Catalog Admin',
    telephone: '+22891100001',
    nom: 'Admin',
    prenom: 'Catalog',
    adresse: 'Admin Street',
    ville: 'Lome',
    pays: 'Togo'
  };

  const supplierUser = {
    email: 'catalog-supplier@nextrade.test',
    password: 'SupplierPass123!',
    role: 'FOURNISSEUR' as const,
    nom_entreprise: 'Supplier Catalog',
    telephone: '+22891100002',
    nom: 'Supplier',
    prenom: 'Catalog',
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

    await pool.query(`CREATE TABLE IF NOT EXISTS categories (
      id_category UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      nom VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS product_categories (
      id_product UUID NOT NULL,
      id_category UUID NOT NULL,
      PRIMARY KEY (id_product, id_category),
      CONSTRAINT fk_product_categories_product FOREIGN KEY (id_product) REFERENCES products(id_product) ON DELETE CASCADE,
      CONSTRAINT fk_product_categories_category FOREIGN KEY (id_category) REFERENCES categories(id_category) ON DELETE CASCADE
    )`);

    const userRepository = new UserRepository(pool);
    const authService = new AuthService(userRepository);
    const authController = new AuthController(authService);
    const categoryRepository = new CategoryRepository(pool);
    const categoryService = new CategoryService(categoryRepository);
    const categoryController = new CategoryController(categoryService);
    const productRepository = new ProductRepository(pool);
    const productService = new ProductService(productRepository, categoryRepository);
    const productController = new ProductController(productService);

    app = express();
    app.use(express.json());
    app.use((req: Request, res: Response, next: NextFunction) => {
      (req as any).db = pool;
      next();
    });

    app.use('/api/v1/auth', createAuthRoutes(authController));
    app.use('/api/v1/categories', createCategoryRoutes(categoryController));
    app.use('/api/v1/products', createProductRoutes(productController));
    app.use('/api/v1/test', authMiddleware, (req, res) => res.status(200).json({ status: 'success' }));
    app.use(errorMiddleware);

    await pool.query('DELETE FROM users WHERE email IN ($1, $2)', [adminUser.email, supplierUser.email]);
    await pool.query('DELETE FROM categories WHERE nom = $1', ['Catalogue test']);
  });

  afterAll(async () => {
    await pool.query('DELETE FROM products WHERE nom = $1', ['Produit catalogue test']);
    await pool.query('DELETE FROM users WHERE email IN ($1, $2)', [adminUser.email, supplierUser.email]);
    await pool.query('DELETE FROM categories WHERE nom = $1', ['Catalogue test']);
    await pool.end();
  });

  it('should create a category as admin', async () => {
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send(adminUser);

    expect(registerResponse.status).toBe(201);
    adminToken = registerResponse.body.accessToken;

    const response = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nom: 'Catalogue test',
        description: 'Catégorie utilisée pour les tests du catalogue'
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.data.nom).toBe('Catalogue test');
    categoryId = response.body.data.id_category;
  });

  it('should create a product as supplier and associate it to a category', async () => {
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send(supplierUser);

    expect(registerResponse.status).toBe(201);
    supplierToken = registerResponse.body.accessToken;

    const response = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${supplierToken}`)
      .send({
        nom: 'Produit catalogue test',
        description: 'Produit de test avec prix de détail et grossiste',
        categorie: 'Informatique',
        categoryIds: [categoryId],
        prix_detail: 120.5,
        prix_gros: 95.25
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.data.nom).toBe('Produit catalogue test');
    expect(response.body.data.id_fournisseur).toBeTruthy();
    productId = response.body.data.id_product;
  });

  it('should return catalog with the correct price according to profile', async () => {
    const clientResponse = await request(app)
      .get('/api/v1/products/catalog')
      .query({ profile: 'CLIENT' });

    expect(clientResponse.status).toBe(200);
    expect(clientResponse.body.data.some((item: any) => item.nom === 'Produit catalogue test')).toBe(true);
    const product = clientResponse.body.data.find((item: any) => item.nom === 'Produit catalogue test');
    expect(product.effective_price).toBe('120.50');

    const supplierResponse = await request(app)
      .get('/api/v1/products/catalog')
      .query({ profile: 'FOURNISSEUR' });

    expect(supplierResponse.status).toBe(200);
    const supplierProduct = supplierResponse.body.data.find((item: any) => item.nom === 'Produit catalogue test');
    expect(supplierProduct.effective_price).toBe('95.25');
  });

  it('should search and filter the catalog', async () => {
    const response = await request(app)
      .get('/api/v1/products/catalog')
      .query({
        search: 'Produit catalogue',
        category: 'Catalogue test',
        minPrice: 90,
        maxPrice: 150,
        page: 1,
        limit: 10
      });

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0].nom).toContain('Produit catalogue');
    expect(response.body.pagination.total).toBeGreaterThanOrEqual(1);
  });

  it('should resolve a single product by id', async () => {
    const response = await request(app)
      .get(`/api/v1/products/${productId}`)
      .query({ profile: 'COMMERCANT' });

    expect(response.status).toBe(200);
    expect(response.body.data.nom).toBe('Produit catalogue test');
    expect(response.body.data.effective_price).toBe('95.25');
  });
});
