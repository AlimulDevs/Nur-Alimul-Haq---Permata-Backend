import { Injectable } from '@nestjs/common';
import { Author } from './entities/author.entity';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

@Injectable()
export class AuthorsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Author[]> {
    return this.prisma.author.findMany({ orderBy: { createdAt: 'asc' } });
  }

  async findById(id: string): Promise<Author | null> {
    return this.prisma.author.findUnique({ where: { id } });
  }

  async create(dto: CreateAuthorDto): Promise<Author> {
    return this.prisma.author.create({
      data: {
        name: dto.name,
        bio: dto.bio ?? null,
      },
    });
  }

  async update(author: Author, dto: UpdateAuthorDto): Promise<Author> {
    return this.prisma.author.update({
      where: { id: author.id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
      },
    });
  }

  async delete(author: Author): Promise<void> {
    await this.prisma.author.delete({ where: { id: author.id } });
  }
}
