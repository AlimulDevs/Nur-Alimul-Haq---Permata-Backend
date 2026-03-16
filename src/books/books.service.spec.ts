import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksRepository } from './books.repository';
import { AuthorsService } from '@/authors/authors.service';

const mockBooksRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByIsbn: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockAuthorsService = {
  findOne: jest.fn(),
};

const authorFixture = {
  id: 'uuid-author-1',
  name: 'J.K. Rowling',
  bio: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const bookFixture = {
  id: 'uuid-book-1',
  title: 'Harry Potter',
  authorId: 'uuid-author-1',
  isbn: '978-3-16-148410-0',
  price: 29.99,
  stock: 100,
  publishedDate: new Date('1997-06-26'),
  createdAt: new Date(),
  updatedAt: new Date(),
  author: authorFixture,
};

const paginatedResult = {
  data: [bookFixture],
  meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
};

describe('BooksService', () => {
  let service: BooksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: BooksRepository, useValue: mockBooksRepository },
        { provide: AuthorsService, useValue: mockAuthorsService },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    jest.clearAllMocks();
  });

  // ─── findAll ──────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return paginated books without authorId filter', async () => {
      mockBooksRepository.findAll.mockResolvedValue(paginatedResult);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(mockAuthorsService.findOne).not.toHaveBeenCalled();
      expect(result).toEqual(paginatedResult);
    });

    it('should validate authorId exists before querying', async () => {
      mockAuthorsService.findOne.mockResolvedValue(authorFixture);
      mockBooksRepository.findAll.mockResolvedValue(paginatedResult);

      const result = await service.findAll({ authorId: 'uuid-author-1', page: 1, limit: 10 });

      expect(mockAuthorsService.findOne).toHaveBeenCalledWith('uuid-author-1');
      expect(result).toEqual(paginatedResult);
    });

    it('should propagate NotFoundException if authorId does not exist', async () => {
      mockAuthorsService.findOne.mockRejectedValue(new NotFoundException());

      await expect(
        service.findAll({ authorId: 'bad-id', page: 1, limit: 10 }),
      ).rejects.toThrow(NotFoundException);

      expect(mockBooksRepository.findAll).not.toHaveBeenCalled();
    });
  });

  // ─── findOne ──────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return the book when found', async () => {
      mockBooksRepository.findById.mockResolvedValue(bookFixture);

      const result = await service.findOne('uuid-book-1');

      expect(result).toEqual(bookFixture);
    });

    it('should throw NotFoundException when book does not exist', async () => {
      mockBooksRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    const createDto = {
      title: 'Harry Potter',
      authorId: 'uuid-author-1',
      isbn: '978-3-16-148410-0',
      price: 29.99,
      stock: 100,
    };

    it('should create and return the book on success', async () => {
      mockAuthorsService.findOne.mockResolvedValue(authorFixture);
      mockBooksRepository.findByIsbn.mockResolvedValue(null);
      mockBooksRepository.create.mockResolvedValue(bookFixture);

      const result = await service.create(createDto);

      expect(mockAuthorsService.findOne).toHaveBeenCalledWith(createDto.authorId);
      expect(mockBooksRepository.findByIsbn).toHaveBeenCalledWith(createDto.isbn);
      expect(mockBooksRepository.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(bookFixture);
    });

    it('should throw NotFoundException when author does not exist', async () => {
      mockAuthorsService.findOne.mockRejectedValue(new NotFoundException());

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
      expect(mockBooksRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when ISBN already exists', async () => {
      mockAuthorsService.findOne.mockResolvedValue(authorFixture);
      mockBooksRepository.findByIsbn.mockResolvedValue(bookFixture);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(mockBooksRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when price is negative', async () => {
      mockAuthorsService.findOne.mockResolvedValue(authorFixture);
      mockBooksRepository.findByIsbn.mockResolvedValue(null);

      await expect(
        service.create({ ...createDto, price: -1 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when stock is negative', async () => {
      mockAuthorsService.findOne.mockResolvedValue(authorFixture);
      mockBooksRepository.findByIsbn.mockResolvedValue(null);

      await expect(
        service.create({ ...createDto, stock: -1 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── update ───────────────────────────────────────────────────────────────

  describe('update', () => {
    const updateDto = { title: 'Updated Title' };

    it('should update and return the book', async () => {
      const updated = { ...bookFixture, title: 'Updated Title' };
      mockBooksRepository.findById.mockResolvedValue(bookFixture);
      mockBooksRepository.update.mockResolvedValue(updated);

      const result = await service.update('uuid-book-1', updateDto);

      expect(mockBooksRepository.update).toHaveBeenCalledWith(bookFixture, updateDto);
      expect(result.title).toBe('Updated Title');
    });

    it('should throw NotFoundException when book to update is not found', async () => {
      mockBooksRepository.findById.mockResolvedValue(null);

      await expect(service.update('bad-id', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should validate new authorId when it changes', async () => {
      const dtoWithAuthor = { authorId: 'uuid-author-2' };
      mockBooksRepository.findById.mockResolvedValue(bookFixture);
      mockAuthorsService.findOne.mockResolvedValue({ ...authorFixture, id: 'uuid-author-2' });
      mockBooksRepository.update.mockResolvedValue({ ...bookFixture, authorId: 'uuid-author-2' });

      await service.update('uuid-book-1', dtoWithAuthor);

      expect(mockAuthorsService.findOne).toHaveBeenCalledWith('uuid-author-2');
    });

    it('should not validate authorId when it is unchanged', async () => {
      const dtoSameAuthor = { authorId: 'uuid-author-1' };
      mockBooksRepository.findById.mockResolvedValue(bookFixture);
      mockBooksRepository.update.mockResolvedValue(bookFixture);

      await service.update('uuid-book-1', dtoSameAuthor);

      expect(mockAuthorsService.findOne).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when new ISBN is already taken', async () => {
      const dtoNewIsbn = { isbn: '978-0-00-000000-2' };
      const anotherBook = { ...bookFixture, id: 'uuid-book-99' };
      mockBooksRepository.findById.mockResolvedValue(bookFixture);
      mockBooksRepository.findByIsbn.mockResolvedValue(anotherBook);

      await expect(service.update('uuid-book-1', dtoNewIsbn)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should not check ISBN uniqueness when ISBN is unchanged', async () => {
      const dtoSameIsbn = { isbn: bookFixture.isbn };
      mockBooksRepository.findById.mockResolvedValue(bookFixture);
      mockBooksRepository.update.mockResolvedValue(bookFixture);

      await service.update('uuid-book-1', dtoSameIsbn);

      expect(mockBooksRepository.findByIsbn).not.toHaveBeenCalled();
    });
  });

  // ─── remove ───────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should delete the book successfully', async () => {
      mockBooksRepository.findById.mockResolvedValue(bookFixture);
      mockBooksRepository.delete.mockResolvedValue(undefined);

      await expect(service.remove('uuid-book-1')).resolves.toBeUndefined();
      expect(mockBooksRepository.delete).toHaveBeenCalledWith(bookFixture);
    });

    it('should throw NotFoundException when book to delete is not found', async () => {
      mockBooksRepository.findById.mockResolvedValue(null);

      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
      expect(mockBooksRepository.delete).not.toHaveBeenCalled();
    });
  });
});
