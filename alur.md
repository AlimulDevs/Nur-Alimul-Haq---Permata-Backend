# Alur Pembuatan API — Bookstore NestJS

## Urutan Pembuatan (Bottom-Up)

```
Database → Prisma Schema → DTO → Repository → Service → Controller → Module → App
```

---

## 1. Prisma Schema — Definisi Tabel Database

**File:** `prisma/schema.prisma`

**Fungsi:** Mendefinisikan struktur tabel database. Ini adalah fondasi, semua layer di atasnya bergantung pada model yang didefinisikan di sini.

```prisma
model Book {
  id        String   @id @default(uuid())
  title     String
  isbn      String   @unique
  price     Decimal
  ...
}
```

---

## 2. DTO (Data Transfer Object) — Validasi Input

**File:** `src/books/dto/create-book.dto.ts`

**Fungsi:** Mendefinisikan bentuk dan aturan validasi data yang **masuk** dari user (request body). Menggunakan decorator dari `class-validator`.

```ts
export class CreateBookDto {
  @IsString() @IsNotEmpty()
  title: string;          // wajib diisi, harus string

  @IsISBN()
  isbn: string;           // harus format ISBN valid

  @IsNumber() @Min(0)
  price: number;          // harus angka, minimal 0
}
```

> Kalau user kirim data yang tidak sesuai, NestJS otomatis tolak dengan **400 Bad Request** sebelum masuk ke controller.

---

## 3. Repository — Query ke Database

**File:** `src/books/books.repository.ts`

**Fungsi:** Satu-satunya layer yang boleh ngobrol langsung dengan database via `PrismaService`. Berisi raw query seperti `findMany`, `create`, `update`, `delete`.

```ts
@Injectable()
export class BooksRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter: FilterBookDto) {
    return this.prisma.book.findMany({ where, include: { author: true } });
  }

  async create(dto: CreateBookDto) {
    return this.prisma.book.create({ data: dto });
  }
}
```

---

## 4. Service — Business Logic

**File:** `src/books/books.service.ts`

**Fungsi:** Berisi semua **business logic** (aturan bisnis). Memanggil repository dan memproses hasilnya. Contoh: cek duplikat ISBN, validasi author exist, throw error yang tepat.

```ts
@Injectable()
export class BooksService {
  constructor(
    private readonly booksRepository: BooksRepository,
    private readonly authorsService: AuthorsService,
  ) {}

  async create(dto: CreateBookDto) {
    await this.authorsService.findOne(dto.authorId); // cek author exist
    const existing = await this.booksRepository.findByIsbn(dto.isbn);
    if (existing) throw new ConflictException('ISBN already exists'); // aturan bisnis
    return this.booksRepository.create(dto);
  }
}
```

---

## 5. Controller — Pintu Masuk Request/Response

**File:** `src/books/books.controller.ts`

**Fungsi:** Menerima HTTP request, meneruskan ke service, dan mengembalikan response. Controller **tidak boleh** mengandung logic bisnis — dia hanya routing layer.

```ts
@Controller('books')           // → route /api/v1/books
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()                       // GET /api/v1/books
  findAll(@Query() filter: FilterBookDto) {
    return this.booksService.findAll(filter);  // lempar ke service
  }

  @Post()                      // POST /api/v1/books
  @Roles(UserRole.ADMIN)       // hanya admin
  create(@Body() dto: CreateBookDto) {
    return this.booksService.create(dto);      // lempar ke service
  }
}
```

---

## 6. Module — Perakitan Komponen

**File:** `src/books/books.module.ts`

**Fungsi:** Mendaftarkan semua komponen (controller, service, repository) agar NestJS tahu cara merakit dan melakukan dependency injection.

```ts
@Module({
  imports: [AuthorsModule],                    // butuh AuthorsService dari sini
  controllers: [BooksController],              // daftarkan controller
  providers: [BooksRepository, BooksService],  // daftarkan service + repo
})
export class BooksModule {}
```

---

## 7. App Module + Main.ts — Bootstrap Aplikasi

**File:** `src/app.module.ts` → mengimpor semua feature module  
**File:** `src/main.ts` → titik mulai aplikasi, setup global (CORS, Swagger, Guards, ValidationPipe)

---

## Alur Request HTTP Lengkap

```
HTTP Request
    ↓
[main.ts] → Global Guards (JWT, Roles), Global Pipe (Validation)
    ↓
[Controller] → parse @Param, @Body, @Query → panggil Service
    ↓
[Service] → terapkan business logic → panggil Repository
    ↓
[Repository] → query Prisma → Database (MSSQL)
    ↓
[Response] balik ke Controller → dikirim ke client
```

---

## Lapisan Support

| File | Fungsi |
|------|--------|
| `src/common/guards/jwt-auth.guard.ts` | Cek JWT token valid sebelum masuk controller |
| `src/common/guards/roles.guard.ts` | Cek role user (ADMIN/CUSTOMER) |
| `src/common/filters/http-exception.filter.ts` | Format semua error response jadi konsisten |
| `src/prisma/prisma.service.ts` | Koneksi ke database, di-inject ke semua repository |
| `src/auth/strategies/jwt.strategy.ts` | Decode JWT dan populate user ke request |

---

## Ringkasan Tanggung Jawab Tiap Layer

| Layer | File | Tanggung Jawab |
|-------|------|----------------|
| **Schema** | `prisma/schema.prisma` | Struktur tabel & relasi DB |
| **DTO** | `dto/*.dto.ts` | Validasi & bentuk data input |
| **Repository** | `*.repository.ts` | Raw query ke database |
| **Service** | `*.service.ts` | Business logic & error handling |
| **Controller** | `*.controller.ts` | Routing HTTP request → response |
| **Module** | `*.module.ts` | Dependency injection & registrasi |
| **Main** | `main.ts` | Bootstrap & konfigurasi global |
