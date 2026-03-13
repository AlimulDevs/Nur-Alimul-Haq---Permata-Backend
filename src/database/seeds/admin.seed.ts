/**
 * Admin Seeder
 * Run once to create the initial admin user:
 *   npm run seed
 */
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

async function seed() {
  await prisma.$connect();
  console.log('✅  Database connected');

  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@bookstore.com';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existing) {
    console.log(`ℹ️  Admin user already exists (${adminEmail}), skipping.`);
    await prisma.$disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD ?? 'Admin@1234',
    12,
  );

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      fullName: process.env.ADMIN_FULL_NAME ?? 'Super Admin',
      role: 'admin',
    },
  });

  console.log(`🎉  Admin user created: ${admin.email}`);

  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error('❌  Seeder error:', err);
  process.exit(1);
});

