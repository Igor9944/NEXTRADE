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

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## API Documentation

### Authentication

#### Register User
- **URL**: `POST /api/v1/auth/register`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!",
    "role": "CLIENT",
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