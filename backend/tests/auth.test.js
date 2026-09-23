"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const pg_1 = require("pg");
const userRepository_1 = require("../src/repositories/userRepository");
const authService_1 = require("../src/services/authService");
const authController_1 = require("../src/controllers/authController");
const express_1 = __importDefault(require("express"));
const authRoutes_1 = require("../src/routes/authRoutes");
const testProtectedRoutes_1 = __importDefault(require("../src/routes/testProtectedRoutes"));
const authMiddleware_1 = require("../src/middlewares/authMiddleware");
const errorMiddleware_1 = require("../src/middlewares/errorMiddleware");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
describe('Authentication System', () => {
    let app;
    let pool;
    let userRepository;
    let authService;
    let authController;
    const TEST_USER = {
        email: 'test@nextrade.test',
        password: 'TestPass123!',
        role: 'CLIENT',
        nom_entreprise: 'Test Company',
        telephone: '+22890000000'
    };
    beforeAll(async () => {
        // Setup database connection
        pool = new pg_1.Pool({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '5432', 10),
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        });
        // Setup repository and service
        userRepository = new userRepository_1.UserRepository(pool);
        authService = new authService_1.AuthService(userRepository);
        authController = new authController_1.AuthController(authService);
        // Setup Express app
        app = (0, express_1.default)();
        app.use(express_1.default.json());

        // Make db available to all routes and middleware (like in src/app.ts)
        app.use((req, res, next) => {
            req.db = pool;
            next();
        });

        // Setup routes
        const authRouter = (0, authRoutes_1.createAuthRoutes)(authController);
        app.use('/api/v1/auth', authRouter);
        app.use('/api/v1/test', authMiddleware_1.authMiddleware, testProtectedRoutes_1.default);
        app.use(errorMiddleware_1.errorMiddleware);
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
            const response = await (0, supertest_1.default)(app)
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
            await (0, supertest_1.default)(app)
                .post('/api/v1/auth/register')
                .send(TEST_USER);
            // Second registration with same email
            const response = await (0, supertest_1.default)(app)
                .post('/api/v1/auth/register')
                .send(TEST_USER)
                .expect(409);
            expect(response.body).toHaveProperty('message', 'Email already exists');
        });
    });
    describe('POST /api/v1/auth/login', () => {
        let accessToken;
        beforeAll(async () => {
            // Ensure test user exists
            await (0, supertest_1.default)(app)
                .post('/api/v1/auth/register')
                .send(TEST_USER);
        });
        it('should login user with valid credentials', async () => {
            const response = await (0, supertest_1.default)(app)
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
            const response = await (0, supertest_1.default)(app)
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
        let accessToken;
        beforeAll(async () => {
            // Login to get token
            const loginResponse = await (0, supertest_1.default)(app)
                .post('/api/v1/auth/login')
                .send({
                email: TEST_USER.email,
                password: TEST_USER.password
            });
            accessToken = loginResponse.body.accessToken;
        });
        it('should grant access with valid token', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/v1/test/protected')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
            expect(response.body).toHaveProperty('status', 'success');
            expect(response.body).toHaveProperty('message', 'Access granted to protected route');
            expect(response.body.user).toHaveProperty('email', TEST_USER.email);
        });
        it('should return 401 without token', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/v1/test/protected')
                .expect(401);
            expect(response.body).toHaveProperty('message', 'Access token required');
        });
        it('should return 401 with invalid token', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/v1/test/protected')
                .set('Authorization', 'Bearer invalid_token')
                .expect(401);
            expect(response.body).toHaveProperty('message', 'Invalid or expired token');
        });
    });
    // Additional tests for role-based access would go here
});
