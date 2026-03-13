import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { AllExceptionsFilter } from '@/common/filters/http-exception.filter';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { AuthModule } from '@/auth/auth.module';
import { UsersModule } from '@/users/users.module';
import { AuthorsModule } from '@/authors/authors.module';
import { BooksModule } from '@/books/books.module';

@Module({
  imports: [
    // ── Configuration ──────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ── Database (Prisma) ──────────────────────────────────────────────────
    PrismaModule,

    // ── Feature modules ────────────────────────────────────────────────────
    AuthModule,
    UsersModule,
    AuthorsModule,
    BooksModule,
  ],
  providers: [
    // ── Global exception filter ────────────────────────────────────────────
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },

    // ── Global validation pipe ─────────────────────────────────────────────
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,           // strip unknown properties
        forbidNonWhitelisted: true,
        transform: true,           // auto-convert types
        transformOptions: { enableImplicitConversion: true },
      }),
    },

    // ── Global guards (JWT → Roles) ────────────────────────────────────────
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
