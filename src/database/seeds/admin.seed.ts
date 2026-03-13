/**
 * Admin Seeder
 * Run once to create the initial admin user:
 *   npm run seed
 */
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { User, UserRole } from '../../users/entities/user.entity';
import { Author } from '../../authors/entities/author.entity';
import { Book } from '../../books/entities/book.entity';

dotenv.config();

const dataSource = new DataSource({
  type: 'mssql',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 1433),
  username: process.env.DB_USERNAME ?? 'sa',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE ?? 'BookstoreDB',
  entities: [User, Author, Book],
  synchronize: true,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
});

async function seed() {
  await dataSource.initialize();
  console.log('✅  Database connected');

  const userRepo = dataSource.getRepository(User);

  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@bookstore.com';
  const existing = await userRepo.findOne({ where: { email: adminEmail } });

  if (existing) {
    console.log(`ℹ️  Admin user already exists (${adminEmail}), skipping.`);
    await dataSource.destroy();
    return;
  }

  const hashedPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD ?? 'Admin@1234',
    12,
  );

  const admin = userRepo.create({
    email: adminEmail,
    password: hashedPassword,
    fullName: process.env.ADMIN_FULL_NAME ?? 'Super Admin',
    role: UserRole.ADMIN,
  });

  await userRepo.save(admin);
  console.log(`🎉  Admin user created: ${adminEmail}`);

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('❌  Seeder error:', err);
  process.exit(1);
});
