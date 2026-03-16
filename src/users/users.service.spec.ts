import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { UserRole } from './entities/user.entity';

const mockUsersRepository = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  existsByEmail: jest.fn(),
};

const userFixture = {
  id: 'uuid-user-1',
  email: 'jane@example.com',
  fullName: 'Jane Doe',
  password: 'hashed',
  role: UserRole.CUSTOMER,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockUsersRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(userFixture);

      const result = await service.findByEmail('jane@example.com');

      expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith('jane@example.com');
      expect(result).toEqual(userFixture);
    });

    it('should return null when user not found', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(null);

      const result = await service.findByEmail('noone@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      mockUsersRepository.findById.mockResolvedValue(userFixture);

      const result = await service.findById('uuid-user-1');

      expect(mockUsersRepository.findById).toHaveBeenCalledWith('uuid-user-1');
      expect(result).toEqual(userFixture);
    });

    it('should return null when user not found', async () => {
      mockUsersRepository.findById.mockResolvedValue(null);

      const result = await service.findById('bad-id');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return the new user', async () => {
      const data = {
        email: 'jane@example.com',
        password: 'hashed',
        fullName: 'Jane Doe',
        role: UserRole.CUSTOMER,
      };
      mockUsersRepository.create.mockResolvedValue(userFixture);

      const result = await service.create(data);

      expect(mockUsersRepository.create).toHaveBeenCalledWith(data);
      expect(result).toEqual(userFixture);
    });
  });

  describe('existsByEmail', () => {
    it('should return true when email exists', async () => {
      mockUsersRepository.existsByEmail.mockResolvedValue(true);

      const result = await service.existsByEmail('jane@example.com');

      expect(result).toBe(true);
    });

    it('should return false when email does not exist', async () => {
      mockUsersRepository.existsByEmail.mockResolvedValue(false);

      const result = await service.existsByEmail('noone@example.com');

      expect(result).toBe(false);
    });
  });
});
