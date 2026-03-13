import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { User } from '@/users/entities/user.entity';
import { Author } from '@/authors/entities/author.entity';
import { Book } from '@/books/entities/book.entity';

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'mssql',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: parseInt(configService.get<string>('DB_PORT', '1433'), 10),
    username: configService.get<string>('DB_USERNAME', 'sa'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE', 'BookstoreDB'),
    entities: [User, Author, Book],
    synchronize: configService.get<string>('NODE_ENV') !== 'production',
    // In production set synchronize to false and use migrations instead
    migrations: ['dist/database/migrations/*.js'],
    migrationsRun: false,
    logging: configService.get<string>('NODE_ENV') === 'development',
    options: {
      encrypt: false,           // set true if using Azure SQL
      trustServerCertificate: true,
    },
    extra: {
      connectionTimeout: 30000,
      requestTimeout: 30000,
    },
  }),
};
