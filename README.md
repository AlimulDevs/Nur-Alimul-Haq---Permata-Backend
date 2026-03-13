# Bookstore API

A production-ready RESTful API for a Bookstore Management System built with **NestJS**, **TypeScript**, and **MSSQL** (via Docker).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 (Alpine) |
| Language | TypeScript 5 |
| Framework | NestJS 10 |
| Database | Microsoft SQL Server 2022 (Docker) |
| ORM | TypeORM 0.3 |
| Auth | JWT (passport-jwt) + bcrypt |
| Docs | Swagger / OpenAPI 3 |
| Container | Docker, Docker Compose |

---

## Architecture

```
Clean Architecture pattern:
Controller → Service → Repository → Entity
```

```
src/
├── app.module.ts               # Root module
├── main.ts                     # Bootstrap / Swagger / Global setup
├── config/
│   └── database.config.ts      # TypeORM async config
├── common/
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   ├── public.decorator.ts
│   │   └── roles.decorator.ts
│   ├── filters/
│   │   └── http-exception.filter.ts  # Global error format
│   └── guards/
│       ├── jwt-auth.guard.ts
│       └── roles.guard.ts
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── dto/
│   └── strategies/jwt.strategy.ts
├── users/
│   ├── entities/user.entity.ts
│   ├── users.repository.ts
│   ├── users.service.ts
│   └── users.module.ts
├── authors/
│   ├── entities/author.entity.ts
│   ├── authors.repository.ts
│   ├── authors.service.ts
│   ├── authors.controller.ts
│   └── authors.module.ts
├── books/
│   ├── entities/book.entity.ts
│   ├── books.repository.ts
│   ├── books.service.ts
│   ├── books.controller.ts
│   └── books.module.ts
└── database/
    └── seeds/admin.seed.ts
```

---

## Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- [Node.js 20+](https://nodejs.org/) (for local dev and seeder)

---

### 1. Clone & configure environment

```bash
cp .env.example .env
# Edit .env if needed — defaults work out of the box for local dev
```

---

### 2. Start everything with Docker (production mode)

```bash
docker-compose up --build -d
```

This will:
1. Start **MSSQL 2022** on port `1433`
2. Create the `BookstoreDB` database automatically
3. Build and start the **NestJS API** on port `3000`
4. Run TypeORM `synchronize: true` in dev/test (tables auto-created)

---

### 3. Seed the admin user

```bash
# Install dependencies locally (needed only for seeder)
npm install

# Run the seeder (reads from .env)
npm run seed
```

This creates:
```
Email:    admin@bookstore.com
Password: Admin@1234
Role:     admin
```

---

### 4. Open Swagger UI

```
http://localhost:3000/api/v1/docs
```

Use the **Authorize** button in Swagger to paste your JWT token.

---

### Development mode (hot reload)

```bash
npm install
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

---

## API Endpoints

Base URL: `http://localhost:3000/api/v1`

### Auth

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/auth/register` | Public | Register as customer |
| POST | `/auth/login` | Public | Login, get JWT token |

### Authors

| Method | Path | Customer | Admin |
|--------|------|----------|-------|
| GET | `/authors` | ✅ | ✅ |
| GET | `/authors/:id` | ✅ | ✅ |
| POST | `/authors` | ❌ | ✅ |
| PATCH | `/authors/:id` | ❌ | ✅ |
| DELETE | `/authors/:id` | ❌ | ✅ |

### Books

| Method | Path | Customer | Admin |
|--------|------|----------|-------|
| GET | `/books` | ✅ | ✅ |
| GET | `/books/:id` | ✅ | ✅ |
| POST | `/books` | ❌ | ✅ |
| PATCH | `/books/:id` | ❌ | ✅ |
| DELETE | `/books/:id` | ❌ | ✅ |

#### Book filtering (GET /books)

| Query param | Type | Description |
|-------------|------|-------------|
| `authorId` | UUID | Filter by author |
| `q` | string | Search in title (case-insensitive) |
| `minPrice` | number | Minimum price |
| `maxPrice` | number | Maximum price |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10, max: 100) |

---

## Error Response Format

All errors return a consistent structure:

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Admin role required"
  }
}
```

| HTTP | code | Trigger |
|------|------|---------|
| 400 | `VALIDATION_ERROR` | Invalid request body |
| 401 | `UNAUTHORIZED` | Missing / invalid JWT |
| 403 | `FORBIDDEN` | Insufficient role |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Duplicate email / ISBN |
| 500 | `INTERNAL_SERVER_ERROR` | Server error |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_PORT` | `3000` | API port |
| `NODE_ENV` | `development` | Environment |
| `JWT_SECRET` | — | **Required** — min 32 chars |
| `JWT_EXPIRES_IN` | `1d` | Token expiry |
| `DB_HOST` | `localhost` | MSSQL host |
| `DB_PORT` | `1433` | MSSQL port |
| `DB_USERNAME` | `sa` | MSSQL user |
| `DB_PASSWORD` | — | **Required** — MSSQL password |
| `DB_DATABASE` | `BookstoreDB` | Database name |
| `ADMIN_EMAIL` | `admin@bookstore.com` | Seed admin email |
| `ADMIN_PASSWORD` | `Admin@1234` | Seed admin password |
| `ADMIN_FULL_NAME` | `Super Admin` | Seed admin name |

---

## Production Notes

1. Set `NODE_ENV=production` — disables TypeORM `synchronize` and Swagger UI
2. Use migrations instead of `synchronize`: `npm run typeorm migration:run`
3. Change `JWT_SECRET` to a strong random value (≥ 32 chars)
4. Change `DB_PASSWORD` to a strong password
5. Set `encrypt: true` in `database.config.ts` if using Azure SQL

---

## Scripts

```bash
npm run start:dev    # Development with hot reload
npm run build        # Compile TypeScript
npm run start:prod   # Run compiled dist/main
npm run seed         # Seed admin user
npm run lint         # ESLint
npm run test         # Jest unit tests
npm run test:cov     # Jest with coverage
```
# Nur-Alimul-Haq---Permata-Backend
