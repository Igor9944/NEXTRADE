# NexTrade Backend

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Then edit `.env` to add your configuration:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nextrade
DB_USER=nextrade
DB_PASSWORD=your_password_here
PORT=3000
API_BASE_URL=http://localhost:3000
AI_SERVICE_URL=http://localhost:5000

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=1h
```

## Database Setup

The application uses PostgreSQL. Make sure you have a running PostgreSQL instance and create the database:

```bash
# Using Docker (recommended)
docker-compose up -d db

# Or manually:
# createdb nextrade
# createuser neotrade
```

Run the migrations:

```bash
# Using Docker
docker exec nextrade_db bash -c 'psql -U $POSTGRES_USER -d $POSTGRES_DB' < database/migrations/001_create_users.sql

# Or manually:
# psql -h localhost -U neotrade -d neotrade -f database/migrations/001_create_users.sql
```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

## Running Tests

The backend test suite writes to PostgreSQL. Never point it at the development or production database.
Jest refuses to run unless `NODE_ENV=test`, `DB_NAME=nextrade_test`, `DB_HOST` is loopback, and the database has the `NEXTRADE_TEST_DATABASE` comment marker.

```bash
# Create a dedicated local database (requires CREATEDB privilege)
createdb -h localhost -U nextrade nextrade_test

# Build the schema from the versioned migrations
for migration in ../database/migrations/*.sql; do
  psql -h localhost -U nextrade -d nextrade_test -v ON_ERROR_STOP=1 -f "$migration"
done

# Mark the database so Jest can verify the target before tests start
psql -h localhost -U nextrade -d postgres -v ON_ERROR_STOP=1 \
  -c "COMMENT ON DATABASE nextrade_test IS 'NEXTRADE_TEST_DATABASE'"

# Run tests only against the dedicated local test database
NODE_ENV=test DB_HOST=localhost DB_NAME=nextrade_test npm test

# Run a specific suite
NODE_ENV=test DB_HOST=localhost DB_NAME=nextrade_test npm test -- tests/productCatalog.test.ts

# Run with coverage
NODE_ENV=test DB_HOST=localhost DB_NAME=nextrade_test npm test -- --coverage
```

Public registration always creates a `CLIENT`; privileged roles must be provisioned by an administrator or controlled seed. Catalog routes require authentication, and catalog/detail responses expose only the effective price for the authenticated role.

## API Documentation

### Authentication

#### Register User
- **URL**: `POST /api/v1/auth/register`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!",
    "nom_entreprise": "Company Name",
    "telephone": "+1234567890"
  }
  ```
- **Success Response**: 
  - Code: 201
  - Content: `{ message: "Registration successful", accessToken: "...", user: { id: "...", email: "...", role: "..." } }`

#### Login User
- **URL**: `POST /api/v1/auth/login`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!"
  }
  ```
- **Success Response**: 
  - Code: 200
  - Content: `{ message: "Login successful", accessToken: "...", user: { id: "...", email: "...", role: "..." } }`

### Protected Routes

All protected routes require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

#### Test Protected Route (Any authenticated user)
- **URL**: `GET /api/v1/test/protected`
- **Success Response**: 
  - Code: 200
  - Content: `{ status: "success", message: "Access granted to protected route", user: { ... } }`

#### Admin Route
- **URL**: `GET /api/v1/test/admin`
- **Required Role**: ADMIN
- **Success Response**: 
  - Code: 200
  - Content: `{ status: "success", message: "Access granted to admin route", user: { ... } }`

#### Commercant Route
- **URL**: `GET /api/v1/test/commercant`
- **Required Role**: COMMERCANT
- **Success Response**: 
  - Code: 200
  - Content: `{ status: "success", message: "Access granted to commercant route", user: { ... } }`

#### Transporteur Route
- **URL**: `GET /api/v1/test/transporteur`
- **Required Role**: TRANSPORTEUR
- **Success Response**: 
  - Code: 200
  - Content: `{ status: "success", message: "Access granted to transporteur route", user: { ... } }`

## Error Responses

- **400**: Bad Request (validation errors)
- **401**: Unauthenticated (missing/invalid/expired token)
- **403**: Forbidden (insufficient permissions)
- **409**: Conflict (email already exists)
- **500**: Internal Server Error

## Security Features

- Passwords are hashed using bcryptjs (never stored in plain text)
- JWT tokens are used for authentication with configurable expiration
- Role-based access control middleware
- Input validation and sanitization
- Error handling that doesn't leak sensitive information
- HTTP security headers via Helmet
- CORS protection