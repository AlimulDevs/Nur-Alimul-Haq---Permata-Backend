import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';

const mockBooksService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
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
  author: { id: 'uuid-author-1', name: 'J.K. Rowling', bio: null, createdAt: new Date(), updatedAt: new Date() },
};

const paginatedResult = {
  data: [bookFixture],
  meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
};

describe('BooksController', () => {
  let controller: BooksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [{ provide: BooksService, useValue: mockBooksService }],
    }).compile();

    controller = module.get<BooksController>(BooksController);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should call booksService.findAll with the filter and return result', async () => {
      const filter = { page: 1, limit: 10 } as any;
      mockBooksService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(filter);

      expect(mockBooksService.findAll).toHaveBeenCalledWith(filter);
      expect(result).toEqual(paginatedResult);
    });
  });

  describe('findOne', () => {
    it('should call booksService.findOne with the id and return result', async () => {
      mockBooksService.findOne.mockResolvedValue(bookFixture);

      const result = await controller.findOne('uuid-book-1');

      expect(mockBooksService.findOne).toHaveBeenCalledWith('uuid-book-1');
      expect(result).toEqual(bookFixture);
    });
  });

  describe('create', () => {
    it('should call booksService.create with the dto and return result', async () => {
      const dto = {
        title: 'Harry Potter',
        authorId: 'uuid-author-1',
        isbn: '978-3-16-148410-0',
        price: 29.99,
        stock: 100,
      } as any;
      mockBooksService.create.mockResolvedValue(bookFixture);

      const result = await controller.create(dto);

      expect(mockBooksService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(bookFixture);
    });
  });

  describe('update', () => {
    it('should call booksService.update with id and dto and return result', async () => {
      const dto = { title: 'Updated Title' } as any;
      const updated = { ...bookFixture, title: 'Updated Title' };
      mockBooksService.update.mockResolvedValue(updated);

      const result = await controller.update('uuid-book-1', dto);

      expect(mockBooksService.update).toHaveBeenCalledWith('uuid-book-1', dto);
      expect(result.title).toBe('Updated Title');
    });
  });

  describe('remove', () => {
    it('should call booksService.remove with id and return undefined', async () => {
      mockBooksService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('uuid-book-1');

      expect(mockBooksService.remove).toHaveBeenCalledWith('uuid-book-1');
      expect(result).toBeUndefined();
    });
  });
});
