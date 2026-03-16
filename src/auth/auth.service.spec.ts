import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersRepository } from '@/users/users.repository';
import { UserRole } from '@/users/entities/user.entity';

jest.mock('bcrypt');

const mockUsersRepository = {
  existsByEmail: jest.fn(),
  create: jest.fn(),
  findByEmail: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersRepository, useValue: mockUsersRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  // ─── register ─────────────────────────────────────────────────────────────

  describe('register', () => {
    const registerDto = {
      email: 'jane@example.com',
      password: 'Secret@123',
      fullName: 'Jane Doe',
    };

    const createdUser = {
      id: 'uuid-1',
      email: 'jane@example.com',
      fullName: 'Jane Doe',
      role: UserRole.CUSTOMER,
      password: 'hashed',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should register a new user and return auth response', async () => {
      mockUsersRepository.existsByEmail.mockResolvedValue(false);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockUsersRepository.create.mockResolvedValue(createdUser);

      const result = await service.register(registerDto);

      expect(mockUsersRepository.existsByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 12);
      expect(mockUsersRepository.create).toHaveBeenCalledWith({
        email: registerDto.email.toLowerCase().trim(),
        password: 'hashed',
        fullName: registerDto.fullName,
        role: UserRole.CUSTOMER,
      });
      expect(result.accessToken).toBe('mock.jwt.token');
      expect(result.tokenType).toBe('Bearer');
      expect(result.user.email).toBe(createdUser.email);
      expect(result.user.role).toBe(UserRole.CUSTOMER);
    });

    it('should throw ConflictException when email already exists', async () => {
      mockUsersRepository.existsByEmail.mockResolvedValue(true);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockUsersRepository.create).not.toHaveBeenCalled();
    });
  });

  // ─── login ────────────────────────────────────────────────────────────────

  describe('login', () => {
    const loginDto = {
      email: 'jane@example.com',
      password: 'Secret@123',
    };

    const storedUser = {
      id: 'uuid-1',
      email: 'jane@example.com',
      fullName: 'Jane Doe',
      role: UserRole.CUSTOMER,
      password: 'hashed',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should login and return auth response when credentials are valid', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(storedUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith(
        loginDto.email.toLowerCase().trim(),
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, storedUser.password);
      expect(result.accessToken).toBe('mock.jwt.token');
      expect(result.user.id).toBe(storedUser.id);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(storedUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should normalise email to lower case before lookup', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: '  JANE@Example.COM  ', password: 'x' }),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith(
        'jane@example.com',
      );
    });
  });
});
