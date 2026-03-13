import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BooksRepository,
  BookWithAuthor,
  PaginatedResult,
} from './books.repository';
import { AuthorsService } from '@/authors/authors.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { FilterBookDto } from './dto/filter-book.dto';

@Injectable()
export class BooksService {
  constructor(
    private readonly booksRepository: BooksRepository,
    private readonly authorsService: AuthorsService,
  ) {}

  async findAll(filter: FilterBookDto): Promise<PaginatedResult<BookWithAuthor>> {
    // Validate authorId exists if provided
    if (filter.authorId) {
      await this.authorsService.findOne(filter.authorId);
    }
    return this.booksRepository.findAll(filter);
  }

  async findOne(id: string): Promise<BookWithAuthor> {
    const book = await this.booksRepository.findById(id);
    if (!book) {
      throw new NotFoundException({
        error: {
          code: 'NOT_FOUND',
          message: `Book with id '${id}' not found`,
        },
      });
    }
    return book;
  }

  async create(dto: CreateBookDto): Promise<BookWithAuthor> {
    // Validate authorId references an existing author
    await this.authorsService.findOne(dto.authorId);

    // 409 — duplicate ISBN
    const existing = await this.booksRepository.findByIsbn(dto.isbn);
    if (existing) {
      throw new ConflictException({
        error: {
          code: 'CONFLICT',
          message: `A book with ISBN '${dto.isbn}' already exists`,
        },
      });
    }

    // Validate price/stock are non-negative (also enforced by DTO, double-check)
    if (dto.price < 0) {
      throw new BadRequestException({
        error: { code: 'VALIDATION_ERROR', message: 'price must be >= 0' },
      });
    }
    if (dto.stock < 0) {
      throw new BadRequestException({
        error: { code: 'VALIDATION_ERROR', message: 'stock must be >= 0' },
      });
    }

    return this.booksRepository.create(dto);
  }

  async update(id: string, dto: UpdateBookDto): Promise<BookWithAuthor> {
    const book = await this.findOne(id);

    // If authorId is being changed, validate it exists
    if (dto.authorId && dto.authorId !== book.authorId) {
      await this.authorsService.findOne(dto.authorId);
    }

    // If ISBN is being changed, check uniqueness
    if (dto.isbn && dto.isbn !== book.isbn) {
      const existing = await this.booksRepository.findByIsbn(dto.isbn);
      if (existing) {
        throw new ConflictException({
          error: {
            code: 'CONFLICT',
            message: `A book with ISBN '${dto.isbn}' already exists`,
          },
        });
      }
    }

    return this.booksRepository.update(book, dto);
  }

  async remove(id: string): Promise<void> {
    const book = await this.findOne(id);
    await this.booksRepository.delete(book);
  }
}
