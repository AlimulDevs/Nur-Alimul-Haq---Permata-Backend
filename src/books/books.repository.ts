import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { FilterBookDto } from './dto/filter-book.dto';

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
  constructor(
    @InjectRepository(Book)
    private readonly repo: Repository<Book>,
  ) {}

  async findAll(filter: FilterBookDto): Promise<PaginatedResult<Book>> {
    const {
      authorId,
      q,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
    } = filter;

    const qb = this.repo
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.author', 'author')
      .orderBy('book.createdAt', 'DESC');

    if (authorId) {
      qb.andWhere('book.author_id = :authorId', { authorId });
    }

    if (q) {
      qb.andWhere('LOWER(book.title) LIKE LOWER(:q)', { q: `%${q}%` });
    }

    if (minPrice !== undefined) {
      qb.andWhere('book.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      qb.andWhere('book.price <= :maxPrice', { maxPrice });
    }

    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

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

  async findById(id: string): Promise<Book | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['author'],
    });
  }

  async findByIsbn(isbn: string): Promise<Book | null> {
    return this.repo.findOne({ where: { isbn } });
  }

  async create(dto: CreateBookDto): Promise<Book> {
    const book = this.repo.create({
      title: dto.title,
      authorId: dto.authorId,
      isbn: dto.isbn,
      price: dto.price,
      stock: dto.stock,
      publishedDate: dto.publishedDate ? new Date(dto.publishedDate) : null,
    });
    return this.repo.save(book);
  }

  async update(book: Book, dto: UpdateBookDto): Promise<Book> {
    if (dto.title !== undefined) book.title = dto.title;
    if (dto.authorId !== undefined) book.authorId = dto.authorId;
    if (dto.isbn !== undefined) book.isbn = dto.isbn;
    if (dto.price !== undefined) book.price = dto.price;
    if (dto.stock !== undefined) book.stock = dto.stock;
    if (dto.publishedDate !== undefined) {
      book.publishedDate = dto.publishedDate ? new Date(dto.publishedDate) : null;
    }
    return this.repo.save(book);
  }

  async delete(book: Book): Promise<void> {
    await this.repo.remove(book);
  }
}
