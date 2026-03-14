import { Injectable } from '@nestjs/common';
import {  Prisma } from '@prisma/client';
import { Book } from './entities/book.entity';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { FilterBookDto } from './dto/filter-book.dto';

export type BookWithAuthor = Prisma.BookGetPayload<{ include: { author: true } }>;

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class BooksRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter: FilterBookDto): Promise<PaginatedResult<BookWithAuthor>> {
    const {
      authorId,
      q,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
    } = filter;

    const where: Prisma.BookWhereInput = {};

    if (authorId) where.authorId = authorId;
    if (q) where.title = { contains: q };
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) (where.price as Prisma.DecimalFilter).gte = minPrice;
      if (maxPrice !== undefined) (where.price as Prisma.DecimalFilter).lte = maxPrice;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.book.findMany({
        where,
        include: { author: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.book.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<BookWithAuthor | null> {
    return this.prisma.book.findUnique({
      where: { id },
      include: { author: true },
    });
  }

  async findByIsbn(isbn: string): Promise<Book | null> {
    return this.prisma.book.findUnique({ where: { isbn } });
  }

  async create(dto: CreateBookDto): Promise<BookWithAuthor> {
    return this.prisma.book.create({
      data: {
        title: dto.title,
        authorId: dto.authorId,
        isbn: dto.isbn,
        price: dto.price,
        stock: dto.stock ?? 0,
        publishedDate: dto.publishedDate ? new Date(dto.publishedDate) : null,
      },
      include: { author: true },
    });
  }

  async update(book: Book, dto: UpdateBookDto): Promise<BookWithAuthor> {
    return this.prisma.book.update({
      where: { id: book.id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.authorId !== undefined && { authorId: dto.authorId }),
        ...(dto.isbn !== undefined && { isbn: dto.isbn }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.stock !== undefined && { stock: dto.stock }),
        ...(dto.publishedDate !== undefined && {
          publishedDate: dto.publishedDate ? new Date(dto.publishedDate) : null,
        }),
      },
      include: { author: true },
    });
  }

  async delete(book: Book): Promise<void> {
    await this.prisma.book.delete({ where: { id: book.id } });
  }
}
