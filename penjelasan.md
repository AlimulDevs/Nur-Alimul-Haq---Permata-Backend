# Penjelasan Struktur Proyek Bookstore API

Proyek ini adalah REST API berbasis **NestJS** dengan **Prisma ORM** dan database **MSSQL**.

---

## Struktur Folder Utama

```
bookstore-api/
├── prisma/          → Konfigurasi & migrasi database
├── src/             → Seluruh source code aplikasi
│   ├── auth/        → Fitur autentikasi (login, register, JWT)
│   ├── authors/     → Fitur manajemen author (CRUD)
│   ├── books/       → Fitur manajemen buku (CRUD)
│   ├── users/       → Fitur manajemen user (internal)
│   ├── common/      → Utility bersama (guard, decorator, filter, interceptor)
│   ├── config/      → Konfigurasi database (deprecated)
│   ├── database/    → Script seeder
│   └── prisma/      → Prisma module & service
├── docker/          → Script untuk setup container
└── docker-compose   → Definisi service Docker
```

---

## `prisma/`

### `schema.prisma`
Mendefinisikan seluruh struktur tabel database (model User, Author, Book) beserta relasi antar tabel. Ini adalah **sumber kebenaran** struktur database. Setiap kali mengubah file ini, harus menjalankan `prisma migrate`.

### `migrations/`
Folder yang berisi file SQL hasil generate otomatis dari Prisma setiap kali ada perubahan schema. File-file ini dijalankan secara urut untuk membentuk struktur database.

---

## `src/main.ts`
**Entry point** aplikasi. File pertama yang dijalankan saat server start. Tugasnya:
- Bootstrap aplikasi NestJS
- Set global prefix `api/v1` untuk semua route
- Set konfigurasi CORS
- Daftarkan Guard global (JWT, Roles)
- Daftarkan Pipe global (ValidationPipe untuk validasi DTO)
- Daftarkan Filter global (AllExceptionsFilter untuk format error)
- Daftarkan Interceptor global (ResponseInterceptor untuk format response)
- Setup Swagger docs di `/api/v1/docs`

## `src/app.module.ts`
**Root module** aplikasi. Titik pusat yang merakit semua feature module. Mengimpor `ConfigModule`, `PrismaModule`, `AuthModule`, `UsersModule`, `AuthorsModule`, dan `BooksModule`.

---

## `src/auth/` — Fitur Autentikasi

### `auth.controller.ts`
Menerima HTTP request untuk endpoint auth:
- `POST /api/v1/auth/register` → diteruskan ke `AuthService.register()`
- `POST /api/v1/auth/login` → diteruskan ke `AuthService.login()`

### `auth.service.ts`
Business logic autentikasi:
- `register()` → cek duplikat email, hash password dengan bcrypt, simpan user baru, return JWT token
- `login()` → validasi email & password, return JWT token

### `auth.module.ts`
Merakit komponen auth: mendaftarkan `JwtModule` (untuk sign/verify token), `PassportModule`, dan `JwtStrategy`.

### `dto/register.dto.ts`
Aturan validasi input untuk register: email valid, fullName wajib, password minimal 8 karakter dengan kombinasi huruf besar, kecil, angka, dan karakter spesial.

### `dto/login.dto.ts`
Aturan validasi input untuk login: email valid dan password wajib diisi.

### `strategies/jwt.strategy.ts`
Logika verifikasi JWT token. Setiap kali ada request dengan `Authorization: Bearer <token>`, Passport memanggil strategy ini untuk:
1. Decode dan verifikasi token
2. Ambil user dari database berdasarkan `sub` (user id) di payload token
3. Attach user ke `request.user` supaya bisa diakses di controller via `@CurrentUser()`

---

## `src/authors/` — Fitur Author

### `authors.controller.ts`
Routing HTTP untuk author:
- `GET /api/v1/authors` → list semua author
- `GET /api/v1/authors/:id` → detail satu author
- `POST /api/v1/authors` → buat author baru (admin only)
- `PATCH /api/v1/authors/:id` → update author (admin only)
- `DELETE /api/v1/authors/:id` → hapus author (admin only)

### `authors.service.ts`
Business logic author:
- `findAll()` → ambil semua author
- `findOne()` → ambil satu author, throw 404 jika tidak ditemukan
- `create()` → buat author baru
- `update()` → update author, cek exist dulu
- `remove()` → hapus author, cek exist dulu

### `authors.repository.ts`
Query langsung ke database via Prisma:
- `findAll()` → `prisma.author.findMany()`
- `findById()` → `prisma.author.findUnique()`
- `create()` → `prisma.author.create()`
- `update()` → `prisma.author.update()`
- `delete()` → `prisma.author.delete()`

### `authors.module.ts`
Merakit komponen author. Mengeksport `AuthorsService` supaya bisa digunakan oleh `BooksModule` (untuk validasi authorId saat buat buku).

### `dto/create-author.dto.ts`
Validasi input create author: `name` wajib string, `bio` opsional.

### `dto/update-author.dto.ts`
Sama seperti `CreateAuthorDto` tapi semua field optional (extend `PartialType`). Sehingga bisa update sebagian field saja.

### `entities/author.entity.ts`
Re-export tipe `Author` dari `@prisma/client`. Berfungsi sebagai alias path agar import konsisten menggunakan path entity, bukan path Prisma langsung.

---

## `src/books/` — Fitur Buku

### `books.controller.ts`
Routing HTTP untuk buku:
- `GET /api/v1/books` → list buku dengan filter & pagination
- `GET /api/v1/books/:id` → detail satu buku
- `POST /api/v1/books` → buat buku (admin only)
- `PATCH /api/v1/books/:id` → update buku (admin only)
- `DELETE /api/v1/books/:id` → hapus buku (admin only)

### `books.service.ts`
Business logic buku:
- `findAll()` → validasi authorId jika ada filter, lalu ambil dari repository
- `findOne()` → ambil satu buku, throw 404 jika tidak ditemukan
- `create()` → validasi authorId exist, cek duplikat ISBN, validasi price/stock ≥ 0, simpan ke DB
- `update()` → cek buku exist, validasi authorId baru jika berubah, cek duplikat ISBN baru
- `remove()` → cek buku exist, lalu hapus

### `books.repository.ts`
Query langsung ke database via Prisma. Selalu menyertakan relasi `author` (include) agar data author ikut terambil bersama data buku. Fitur `findAll()` mendukung filter dinamis dan pagination.

### `books.module.ts`
Merakit komponen buku. Mengimpor `AuthorsModule` karena `BooksService` membutuhkan `AuthorsService` untuk validasi authorId.

### `dto/create-book.dto.ts`
Validasi input create buku: `title`, `authorId` (UUID), `isbn` (format ISBN-10/13), `price` (≥ 0), `stock` (≥ 0), `publishedAt` (tanggal opsional).

### `dto/update-book.dto.ts`
Sama seperti `CreateBookDto` tapi semua field optional (extend `PartialType`).

### `dto/filter-book.dto.ts`
Validasi query parameter untuk filter & pagination: `authorId`, `q` (pencarian judul), `minPrice`, `maxPrice`, `page`, `limit`.

### `entities/book.entity.ts`
Re-export tipe `Book` dari `@prisma/client`. Sama tujuannya dengan `author.entity.ts`.

---

## `src/users/` — Fitur User (Internal)

Module ini tidak punya controller karena tidak ada endpoint publik untuk user. Digunakan secara internal oleh `AuthModule` dan `JwtStrategy`.

### `users.service.ts`
Business logic user: `findByEmail()`, `findById()`, `create()`, `existsByEmail()`. Semua method hanya meneruskan ke repository.

### `users.repository.ts`
Query langsung ke database untuk tabel User: `findByEmail()`, `findById()`, `create()`, `existsByEmail()`.

### `users.module.ts`
Merakit komponen user dan mengeksport `UsersRepository` dan `UsersService` supaya bisa digunakan oleh `AuthModule`.

### `entities/user.entity.ts`
Re-export tipe `User` dari Prisma. Juga mendefinisikan enum `UserRole` (`admin` | `customer`) karena MSSQL tidak support native enum di Prisma.

---

## `src/common/` — Utility Bersama

Folder ini berisi komponen yang dipakai lintas module, bukan milik satu fitur tertentu.

### `decorators/`

| File | Fungsi |
|------|--------|
| `public.decorator.ts` | `@Public()` — tandai endpoint tidak perlu JWT token |
| `roles.decorator.ts` | `@Roles(UserRole.ADMIN)` — tandai endpoint hanya boleh diakses role tertentu |
| `current-user.decorator.ts` | `@CurrentUser()` — ambil data user yang sedang login dari `request.user` |
| `response-message.decorator.ts` | `@ResponseMessage('...')` — set pesan custom untuk response sukses |

### `guards/`

| File | Fungsi |
|------|--------|
| `jwt-auth.guard.ts` | Cek apakah request menyertakan JWT token valid. Jika endpoint ditandai `@Public()`, guard ini dilewati. |
| `roles.guard.ts` | Setelah JWT valid, cek apakah role user sesuai dengan `@Roles()` yang didefinisikan di endpoint. Jika tidak ada `@Roles()`, semua user yang login boleh akses. |

### `filters/http-exception.filter.ts`
Menangkap **semua exception** yang terjadi di aplikasi dan memformat response error menjadi konsisten:
```json
{ "success": false, "message": "...", "data": null }
```

### `interceptors/response.interceptor.ts`
Membungkus **semua response sukses** menjadi format konsisten:
```json
{ "success": true, "message": "...", "data": ... }
```
Pesan diambil dari decorator `@ResponseMessage()`, atau otomatis berdasarkan HTTP method jika tidak ada decorator.

---

## `src/config/`

### `database.config.ts`
**Deprecated** — tidak digunakan lagi. Koneksi database kini dihandle sepenuhnya oleh Prisma via environment variable `DATABASE_URL`.

---

## `src/database/seeds/`

### `admin.seed.ts`
Script one-time untuk membuat user admin pertama di database. Dijalankan dengan `npm run seed`. Membaca `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_FULL_NAME` dari file `.env`.

---

## `src/prisma/`

### `prisma.module.ts`
Module Prisma yang ditandai `@Global()` sehingga `PrismaService` otomatis tersedia di seluruh aplikasi tanpa perlu diimpor ulang per module.

### `prisma.service.ts`
Wrapper `PrismaClient` dari Prisma. Mengelola koneksi ke database:
- `onModuleInit()` → buka koneksi saat aplikasi start
- `onModuleDestroy()` → tutup koneksi saat aplikasi stop

---

## `docker/`

### `entrypoint.sh`
Script yang dijalankan saat container Docker start. Menjalankan migrasi Prisma (`prisma migrate deploy`) lalu menjalankan server.

### `mssql/init.sh` & `mssql/init.sql`
Script inisialisasi database MSSQL: membuat database jika belum ada.

---

## File Konfigurasi Root

| File | Fungsi |
|------|--------|
| `package.json` | Daftar dependency dan script NPM (`start:dev`, `build`, `seed`, dll) |
| `tsconfig.json` | Konfigurasi TypeScript (path alias `@/` → `src/`) |
| `nest-cli.json` | Konfigurasi NestJS CLI |
| `docker-compose.yml` | Jalankan API + MSSQL bersama dalam container |
| `docker-compose.dev.yml` | Versi dev: API mount source code, support hot-reload |
| `docker-compose.mssql-only.yml` | Hanya jalankan container MSSQL (untuk dev lokal tanpa Docker API) |
| `Dockerfile` | Instruksi build image Docker untuk aplikasi API |
