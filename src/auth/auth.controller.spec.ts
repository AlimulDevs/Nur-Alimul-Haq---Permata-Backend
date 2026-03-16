import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
};

const authResponse = {
  accessToken: 'mock.jwt.token',
  tokenType: 'Bearer',
  expiresIn: '1d',
  user: {
    id: 'uuid-1',
    email: 'jane@example.com',
    fullName: 'Jane Doe',
    role: 'customer',
  },
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should call authService.register and return the result', async () => {
      const dto = { email: 'jane@example.com', password: 'Secret@123', fullName: 'Jane Doe' };
      mockAuthService.register.mockResolvedValue(authResponse);

      const result = await controller.register(dto as any);

      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(authResponse);
    });
  });

  describe('login', () => {
    it('should call authService.login and return the result', async () => {
      const dto = { email: 'jane@example.com', password: 'Secret@123' };
      mockAuthService.login.mockResolvedValue(authResponse);

      const result = await controller.login(dto as any);

      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(authResponse);
    });
  });
});
