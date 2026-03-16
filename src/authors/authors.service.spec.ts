import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { AuthorsRepository } from './authors.repository';

const mockAuthorsRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const authorFixture = {
  id: 'uuid-author-1',
  name: 'J.K. Rowling',
  bio: 'British author.',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthorsService', () => {
  let service: AuthorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorsService,
        { provide: AuthorsRepository, useValue: mockAuthorsRepository },
      ],
    }).compile();

    service = module.get<AuthorsService>(AuthorsService);
    jest.clearAllMocks();
  });

  // ─── findAll ──────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return an array of authors', async () => {
      mockAuthorsRepository.findAll.mockResolvedValue([authorFixture]);

      const result = await service.findAll();

      expect(result).toEqual([authorFixture]);
      expect(mockAuthorsRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no authors exist', async () => {
      mockAuthorsRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  // ─── findOne ──────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return the author when found', async () => {
      mockAuthorsRepository.findById.mockResolvedValue(authorFixture);

      const result = await service.findOne('uuid-author-1');

      expect(result).toEqual(authorFixture);
      expect(mockAuthorsRepository.findById).toHaveBeenCalledWith('uuid-author-1');
    });

    it('should throw NotFoundException when author does not exist', async () => {
      mockAuthorsRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create and return the new author', async () => {
      const dto = { name: 'J.K. Rowling', bio: 'British author.' };
      mockAuthorsRepository.create.mockResolvedValue(authorFixture);

      const result = await service.create(dto);

      expect(mockAuthorsRepository.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(authorFixture);
    });
  });

  // ─── update ───────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should update and return the author', async () => {
      const dto = { name: 'Updated Name' };
      const updated = { ...authorFixture, name: 'Updated Name' };
      mockAuthorsRepository.findById.mockResolvedValue(authorFixture);
      mockAuthorsRepository.update.mockResolvedValue(updated);

      const result = await service.update('uuid-author-1', dto);

      expect(mockAuthorsRepository.update).toHaveBeenCalledWith(authorFixture, dto);
      expect(result.name).toBe('Updated Name');
    });

    it('should throw NotFoundException when author to update does not exist', async () => {
      mockAuthorsRepository.findById.mockResolvedValue(null);

      await expect(service.update('bad-id', { name: 'x' })).rejects.toThrow(
        NotFoundException,
      );
      expect(mockAuthorsRepository.update).not.toHaveBeenCalled();
    });
  });

  // ─── remove ───────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should delete the author successfully', async () => {
      mockAuthorsRepository.findById.mockResolvedValue(authorFixture);
      mockAuthorsRepository.delete.mockResolvedValue(undefined);

      await expect(service.remove('uuid-author-1')).resolves.toBeUndefined();
      expect(mockAuthorsRepository.delete).toHaveBeenCalledWith(authorFixture);
    });

    it('should throw NotFoundException when author to delete does not exist', async () => {
      mockAuthorsRepository.findById.mockResolvedValue(null);

      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
      expect(mockAuthorsRepository.delete).not.toHaveBeenCalled();
    });
  });
});
