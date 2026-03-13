import { NestFactory, Reflector } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('APP_PORT', 3000);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  // ── Global prefix ──────────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ── CORS ───────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: nodeEnv === 'production' ? false : true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ── Global pipes ───────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Global exception filter ────────────────────────────────────────────────
  app.useGlobalFilters(new AllExceptionsFilter());

  // ── Global guards ──────────────────────────────────────────────────────────
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector), new RolesGuard(reflector));

  // ── Swagger / OpenAPI ──────────────────────────────────────────────────────
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Bookstore API')
      .setDescription(
        `## Bookstore Management System\n\nRESTful API for managing **Users**, **Authors**, and **Books** with JWT-based authentication and role-based access control (RBAC).\n\n### Roles\n- **admin** — full access (seeded manually)\n- **customer** — read-only access to authors & books; can self-register`,
      )
      .setVersion('1.0.0')
      .addServer(`http://localhost:${port}`, 'Local Development')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token (obtained from POST /api/v1/auth/login)',
        },
        'JWT-auth',
      )
      .addTag('Auth', 'Authentication endpoints')
      .addTag('Authors', 'Author management')
      .addTag('Books', 'Book management')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/v1/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });

    logger.log(`📚  Swagger docs available at http://localhost:${port}/api/v1/docs`);
  }

  // ── Start server ───────────────────────────────────────────────────────────
  await app.listen(port, '0.0.0.0');
  logger.log(`🚀  Application running on http://localhost:${port}/api/v1`);
  logger.log(`🌍  Environment: ${nodeEnv}`);
}

bootstrap();
