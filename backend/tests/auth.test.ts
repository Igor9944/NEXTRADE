import request from 'supertest';
import { Pool } from 'pg';
import { UserRepository } from '../src/repositories/userRepository';
import { AuthService } from '../src/services/authService';
import { AuthController } from '../src/controllers/authController';
import express, { Application } from 'express';
import { createAuthRoutes } from '../src/routes/authRoutes';
import testProtectedRoutes from '../src/routes/testProtectedRoutes';
import { authMiddleware } from '../src/middlewares/authMiddleware';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

describe('Authentication System', () => {
  let app: Application;
  let pool: Pool;
  let userRepository: UserRepository;
  let authService: AuthService;
  let authController: AuthController;

  const TEST_USER = {
    email: 'test@nextrade.test',
    password: 'TestPass123!',
    role: 'CLIENT' as const,
    nom_entreprise: 'Test Company',
    telephone: '+22890000000'
  };

  beforeAll(async () => {
    // Setup database connection
    pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    // Setup repository and service
    userRepository = new UserRepository(pool);
    authService = new AuthService(userRepository);
    authController = new AuthController(authService);

    // Setup Express app
    app = express();
    app.use(express.json());

    // Setup routes
    const authRouter = createAuthRoutes(authController);
    app.use('/api/v1/auth', authRouter);
    app.use('/api/v1/test', authMiddleware, testProtectedRoutes);

    // Clean up test user if exists
    await pool.query('DELETE FROM users WHERE email = $1', [TEST_USER.email]);
  });

  afterAll(async () => {
    // Clean up
    await pool.query('DELETE FROM users WHERE email = $1', [TEST_USER.email]);
    await pool.end();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(TEST_USER)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Registration successful');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user).toHaveProperty('email', TEST_USER.email);
      expect(response.body.user).toHaveProperty('role', TEST_USER.role);
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user).not.toHaveProperty('password_hash');
    });

    it('should return 409 for duplicate email', async () => {
      // First registration
      await request(app)
        .post('/api/v1/auth/register')
        .send(TEST_USER);

      // Second registration with same email
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(TEST_USER)
        .expect(409);

      expect(response.body).toHaveProperty('message', 'Email already exists');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    let accessToken: string;

    beforeAll(async () => {
      // Ensure test user exists
      await request(app)
        .post('/api/v1/auth/register')
        .send(TEST_USER);
    });

    it('should login user with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: TEST_USER.email,
          password: TEST_USER.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user).toHaveProperty('email', TEST_USER.email);

      // Save token for later tests
      accessToken = response.body.accessToken;
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: TEST_USER.email,
          password: 'WrongPassword123!'
        })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
  });

  describe('GET /api/v1/test/protected', () => {
    let accessToken: string;

    beforeAll(async () => {
      // Login to get token
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: TEST_USER.email,
          password: TEST_USER.password
        });

      accessToken = loginResponse.body.accessToken;
    });

    it('should grant access with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/test/protected')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message', 'Access granted to protected route');
      expect(response.body.user).toHaveProperty('email', TEST_USER.email);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/v1/test/protected')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Access token required');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/test/protected')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid or expired token');
    });
  });

  // Additional tests for role-based access would go here
});