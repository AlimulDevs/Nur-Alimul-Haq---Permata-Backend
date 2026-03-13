# 📚 Bookstore API

RESTful API untuk manajemen toko buku — dibangun dengan **NestJS v11**, **Prisma v6 (ORM)**, **MSSQL 2022**, dan **Docker**.

---

## 🚀 Tech Stack

| Layer        | Tech                                  |
|-------------|---------------------------------------|
| Framework   | NestJS v11 (TypeScript)               |
| ORM         | Prisma v6                             |
| Database    | Microsoft SQL Server 2022             |
| Auth        | JWT + Passport (passport-jwt v4)      |
| Docs        | Swagger / OpenAPI (`@nestjs/swagger`) |
| Container   | Docker + Docker Compose               |

---

## 📁 Struktur Proyek

```
bookstore-api/
├── prisma/
│   ├── schema.prisma          # Prisma schema (models & enum)
│   └── migrations/            # Migration files (auto-generated)
├── src/
│   ├── auth/                  # JWT Auth (register, login)
│   ├── books/                 # Books CRUD + filter & pagination
│   ├── authors/               # Authors CRUD
│   ├── users/                 # Users service & repository
│   ├── prisma/                # PrismaService & PrismaModule
│   └── common/                # Guards, filters, decorators
├── docker/
│   ├── mssql/                 # DB init scripts
│   └── entrypoint.sh          # Runs migrations → starts app
├── docker-compose.yml             # Full Docker stack
├── docker-compose.mssql-only.yml  # MSSQL-only (untuk local dev)
├── Dockerfile                 # Multi-stage build
└── .env                       # Local environment variables
```

---

## ⚙️ Environment Variables

Copy `.env.example` → `.env`:

```bash
cp .env.example .env
```

| Variable            | Default                    | Keterangan                         |
|--------------------|----------------------------|------------------------------------|
| `APP_PORT`         | `3000`                     | Port aplikasi                      |
| `NODE_ENV`         | `development`              | `development` / `production`       |
| `SWAGGER_DISABLED` | `false`                    | Set `true` untuk disable Swagger   |
| `JWT_SECRET`       | *(change this!)*           | Secret key JWT min 32 karakter     |
| `JWT_EXPIRES_IN`   | `1d`                       | Durasi token JWT                   |
| `DATABASE_URL`     | `sqlserver://localhost:...`| Prisma connection string (utama)   |
| `DB_PASSWORD`      | `YourStrong!Passw0rd`      | Password SA untuk docker-compose   |
| `DB_DATABASE`      | `BookstoreDB`              | Nama database                      |
| `ADMIN_EMAIL`      | `admin@bookstore.com`      | Email admin awal (seeder)          |
| `ADMIN_PASSWORD`   | `Admin@1234`               | Password admin awal (seeder)       |

---

## 🐳 Mode 1 — Semua via Docker (MSSQL + API)

> Cocok untuk staging / production. Seluruh stack berjalan dalam container.

**Prasyarat:** Docker Desktop berjalan.  
Apple Silicon (M1/M2/M3) sudah dikonfigurasi dengan `platform: linux/amd64`.

### Langkah

```bash
# 1. Masuk ke folder proyek
cd bookstore-api

# 2. Buat file .env dari contoh
cp .env.example .env

# 3. Build dan jalankan semua service
docker-compose up --build -d

# 4. Cek status container
docker-compose ps
```

Pastikan semua container berjalan:
```
NAME                    STATUS
bookstore_mssql         Up (healthy)
bookstore_mssql_init    Exited (0)    ← normal, selesai inisialisasi DB
bookstore_api           Up
```

> **Otomatis:** Saat container `api` pertama kali start, entrypoint menjalankan
> `prisma migrate deploy` sebelum aplikasi dimulai. Tidak perlu migrasi manual.

### Jalankan Seeder (opsional — buat admin user)

```bash
# Dari host (butuh DATABASE_URL di .env mengarah ke localhost)
npm run seed

# Atau jalankan di dalam container yang berjalan
docker exec bookstore_api npx ts-node \
  -r tsconfig-paths/register \
  src/database/seeds/admin.seed.ts
```

### Akses

| Resource       | URL                                 |
|---------------|-------------------------------------|
| API Base      | http://localhost:3000/api/v1        |
| Swagger Docs  | http://localhost:3000/api/v1/docs   |

### Stop

```bash
docker-compose down          # stop container, pertahankan data
docker-compose down -v       # stop + hapus volume (data hilang)
```

---

## 💻 Mode 2 — MSSQL Docker + NestJS Lokal

> Cocok untuk development aktif — hot-reload, debugging lebih mudah.

**Prasyarat:** Docker Desktop + Node.js v20+ + npm v10+

### Langkah

**1. Jalankan hanya MSSQL via Docker:**

```bash
docker-compose -f docker-compose.mssql-only.yml up -d
```

Tunggu MSSQL `healthy`:
```bash
docker ps
# bookstore_mssql   Up X seconds (healthy)
```

**2. Setup environment:**

```bash
cp .env.example .env
```

Pastikan `DATABASE_URL` di `.env` mengarah ke `localhost`:
```dotenv
DATABASE_URL="sqlserver://localhost:1433;database=BookstoreDB;user=sa;password=YourStrong!Passw0rd;trustServerCertificate=true;encrypt=false"
```

**3. Install dependencies:**

```bash
npm install --legacy-peer-deps
```

**4. Generate Prisma Client:**

```bash
npx prisma generate
```

**5. Jalankan migrasi database:**

```bash
# Pertama kali — buat migration file baru + apply:
npx prisma migrate dev --name init

# Selanjutnya — hanya apply migration yang belum dijalankan:
npx prisma migrate deploy
```

**6. Jalankan seeder (buat admin user):**

```bash
npm run seed
# 🎉  Admin user created: admin@bookstore.com
```

**7. Start NestJS (hot-reload):**

```bash
npm run start:dev
```

### Akses

| Resource       | URL                                 |
|---------------|-------------------------------------|
| API Base      | http://localhost:3000/api/v1        |
| Swagger Docs  | http://localhost:3000/api/v1/docs   |

### Stop MSSQL

```bash
docker-compose -f docker-compose.mssql-only.yml down
```

---

## 🗃️ Prisma — Perintah Berguna

| Perintah                                  | Fungsi                                   |
|------------------------------------------|------------------------------------------|
| `npx prisma generate`                    | Generate Prisma Client dari schema       |
| `npx prisma migrate dev --name <nama>`   | Buat + apply migration baru (dev)        |
| `npx prisma migrate deploy`              | Apply semua pending migration (prod)     |
| `npx prisma migrate status`              | Lihat status migration                   |
| `npx prisma db push`                     | Sync schema ke DB tanpa migration file   |
| `npx prisma studio`                      | GUI browser untuk lihat/edit data        |

Atau via npm scripts:

```bash
npm run prisma:generate   # npx prisma generate
npm run migrate:dev       # npx prisma migrate dev
npm run migrate:deploy    # npx prisma migrate deploy
npm run db:push           # npx prisma db push
```

---

## 🔐 Autentikasi

API menggunakan **JWT Bearer Token**.

### Register (customer)

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password@123",
  "fullName": "John Doe"
}
```

### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@bookstore.com",
  "password": "Admin@1234"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1...",
  "tokenType": "Bearer",
  "expiresIn": "1d",
  "user": { "id": "...", "email": "...", "fullName": "...", "role": "admin" }
}
```

### Menggunakan Token

```http
GET /api/v1/books
Authorization: Bearer <accessToken>
```

---

## 📖 API Endpoints

### Auth

| Method | Path                    | Auth | Deskripsi           |
|--------|-------------------------|------|---------------------|
| POST   | `/api/v1/auth/register` | ❌   | Registrasi customer |
| POST   | `/api/v1/auth/login`    | ❌   | Login, ambil JWT    |

### Authors

| Method | Path                  | Role  | Deskripsi         |
|--------|-----------------------|-------|-------------------|
| GET    | `/api/v1/authors`     | Any   | List semua author |
| GET    | `/api/v1/authors/:id` | Any   | Detail author     |
| POST   | `/api/v1/authors`     | Admin | Tambah author     |
| PATCH  | `/api/v1/authors/:id` | Admin | Update author     |
| DELETE | `/api/v1/authors/:id` | Admin | Hapus author      |

### Books

| Method | Path               | Role  | Deskripsi                       |
|--------|--------------------|-------|---------------------------------|
| GET    | `/api/v1/books`    | Any   | List buku (filter + pagination) |
| GET    | `/api/v1/books/:id`| Any   | Detail buku                     |
| POST   | `/api/v1/books`    | Admin | Tambah buku                     |
| PATCH  | `/api/v1/books/:id`| Admin | Update buku                     |
| DELETE | `/api/v1/books/:id`| Admin | Hapus buku                      |

#### Query Params — GET `/api/v1/books`

| Param      | Tipe   | Contoh               | Keterangan             |
|-----------|--------|----------------------|------------------------|
| `q`        | string | `?q=clean`           | Cari judul buku        |
| `authorId` | UUID   | `?authorId=...`      | Filter by author       |
| `minPrice` | number | `?minPrice=50000`    | Harga minimum          |
| `maxPrice` | number | `?maxPrice=200000`   | Harga maksimum         |
| `page`     | number | `?page=2`            | Halaman (default: 1)   |
| `limit`    | number | `?limit=20`          | Per halaman (default: 10) |

---

## 👤 Akun Default (Setelah Seeder)

| Field    | Value                 |
|----------|-----------------------|
| Email    | `admin@bookstore.com` |
| Password | `Admin@1234`          |
| Role     | `admin`               |

---

## 🛠️ npm Scripts

```bash
npm run start:dev       # Development dengan hot-reload
npm run build           # Compile TypeScript ke dist/
npm run start:prod      # Jalankan hasil build
npm run seed            # Seeder admin user
npm run prisma:generate # Generate Prisma client
npm run migrate:dev     # Buat + apply migration (dev)
npm run migrate:deploy  # Apply migration (prod)
npm run lint            # ESLint
npm run test            # Jest unit tests
```

---

## 🐛 Troubleshooting

**`npx prisma generate` gagal:**  
Pastikan `DATABASE_URL` sudah diset di `.env` dan `prisma/schema.prisma` ada.

**MSSQL tidak bisa dikoneksi:**  
```bash
docker ps                        # cek status container
docker logs bookstore_mssql      # lihat log MSSQL
```

**Port 1433 sudah dipakai:**  
Edit `docker-compose.mssql-only.yml` dan ubah port mapping, contoh: `"14330:1433"`.  
Update `DATABASE_URL` dengan port baru.

**Apple Silicon (M1/M2/M3) error:**  
Docker Compose sudah pakai `platform: linux/amd64`. Pastikan Rosetta aktif di Docker Desktop → Settings → Features in development.

**Swagger tidak muncul:**  
Cek `SWAGGER_DISABLED` di `.env` — harus `false`.
