import { Test, TestingModule } from '@nestjs/testing';
import { AuthorsController } from './authors.controller';
import { AuthorsService } from './authors.service';

const mockAuthorsService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const authorFixture = {
  id: 'uuid-author-1',
  name: 'J.K. Rowling',
  bio: 'British author.',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthorsController', () => {
  let controller: AuthorsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthorsController],
      providers: [{ provide: AuthorsService, useValue: mockAuthorsService }],
    }).compile();

    controller = module.get<AuthorsController>(AuthorsController);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all authors', async () => {
      mockAuthorsService.findAll.mockResolvedValue([authorFixture]);

      const result = await controller.findAll();

      expect(mockAuthorsService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([authorFixture]);
    });
  });

  describe('findOne', () => {
    it('should return a single author by id', async () => {
      mockAuthorsService.findOne.mockResolvedValue(authorFixture);

      const result = await controller.findOne('uuid-author-1');

      expect(mockAuthorsService.findOne).toHaveBeenCalledWith('uuid-author-1');
      expect(result).toEqual(authorFixture);
    });
  });

  describe('create', () => {
    it('should create a new author', async () => {
      const dto = { name: 'J.K. Rowling', bio: 'British author.' };
      mockAuthorsService.create.mockResolvedValue(authorFixture);

      const result = await controller.create(dto);

      expect(mockAuthorsService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(authorFixture);
    });
  });

  describe('update', () => {
    it('should update an author', async () => {
      const dto = { name: 'Updated Name' };
      const updated = { ...authorFixture, name: 'Updated Name' };
      mockAuthorsService.update.mockResolvedValue(updated);

      const result = await controller.update('uuid-author-1', dto);

      expect(mockAuthorsService.update).toHaveBeenCalledWith('uuid-author-1', dto);
      expect(result.name).toBe('Updated Name');
    });
  });

  describe('remove', () => {
    it('should delete an author', async () => {
      mockAuthorsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('uuid-author-1');

      expect(mockAuthorsService.remove).toHaveBeenCalledWith('uuid-author-1');
      expect(result).toBeUndefined();
    });
  });
});
