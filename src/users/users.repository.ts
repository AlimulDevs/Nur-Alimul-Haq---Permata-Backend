import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { PrismaService } from '@/prisma/prisma.service';
import { UserRole } from './entities/user.entity';

export interface CreateUserData {
  email: string;
  password: string;
  fullName: string;
  role?: UserRole;
}

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        role: data.role ?? 'customer',
      },
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { email } });
    return count > 0;
  }
}
