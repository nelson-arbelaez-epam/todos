import { ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  register: vi.fn(),
  login: vi.fn(),
};

describe('AuthController', () => {
  let authController: AuthController;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('should return uid and email on successful registration', async () => {
      const dto = { email: 'test@example.com', password: 'securePass1' };
      const expected = { uid: 'firebase-uid-123', email: 'test@example.com' };

      mockAuthService.register.mockResolvedValue(expected);

      const result = await authController.register(dto);

      expect(result).toEqual(expected);
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    });

    it('should propagate ConflictException for duplicate email', async () => {
      const dto = { email: 'duplicate@example.com', password: 'securePass1' };

      mockAuthService.register.mockRejectedValue(
        new ConflictException('Email is already registered'),
      );

      await expect(authController.register(dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should propagate BadRequestException for invalid input', async () => {
      const dto = { email: 'invalid-email', password: '123' };

      mockAuthService.register.mockRejectedValue(
        new BadRequestException('Invalid email address'),
      );

      await expect(authController.register(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('should return token payload on successful login', async () => {
      const dto = { email: 'test@example.com', password: 'securePass1' };
      const expected = {
        idToken: 'firebase-id-token',
        email: 'test@example.com',
        expiresIn: '3600',
        uid: 'firebase-uid-123',
      };

      mockAuthService.login.mockResolvedValue(expected);

      const result = await authController.login(dto);

      expect(result).toEqual(expected);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    });

    it('should propagate UnauthorizedException for invalid credentials', async () => {
      const dto = { email: 'test@example.com', password: 'wrongPass' };

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(authController.login(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should propagate BadRequestException for invalid payload', async () => {
      const dto = { email: 'not-an-email', password: '123' };

      mockAuthService.login.mockRejectedValue(
        new BadRequestException('Validation failed'),
      );

      await expect(authController.login(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
