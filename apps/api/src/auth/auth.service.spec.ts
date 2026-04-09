import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { FirebaseAuthService } from '@todos/firebase';
import { AuthService } from './auth.service';

const mockCreateUser = vi.fn();
const mockLogin = vi.fn();

const mockFirebaseAuthService = {
  createUser: mockCreateUser,
  login: mockLogin,
};

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: FirebaseAuthService, useValue: mockFirebaseAuthService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should return uid and email for a valid registration', async () => {
      const dto = { email: 'test@example.com', password: 'securePass1' };
      mockCreateUser.mockResolvedValue({
        uid: 'firebase-uid-123',
        email: 'test@example.com',
      });

      const result = await authService.register(dto);

      expect(result).toEqual({
        uid: 'firebase-uid-123',
        email: 'test@example.com',
      });
      expect(mockCreateUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'securePass1',
      });
    });

    it('should throw ConflictException when email already exists', async () => {
      const dto = { email: 'existing@example.com', password: 'securePass1' };
      mockCreateUser.mockRejectedValue({
        code: 'auth/email-already-exists',
        message: 'Email already exists',
      });

      await expect(authService.register(dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException for invalid email', async () => {
      const dto = { email: 'not-an-email', password: 'securePass1' };
      mockCreateUser.mockRejectedValue({
        code: 'auth/invalid-email',
        message: 'The email address is improperly formatted.',
      });

      await expect(authService.register(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for weak password', async () => {
      const dto = { email: 'test@example.com', password: '123' };
      mockCreateUser.mockRejectedValue({
        code: 'auth/weak-password',
        message: 'Password should be at least 6 characters.',
      });

      await expect(authService.register(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should re-throw unknown errors', async () => {
      const dto = { email: 'test@example.com', password: 'securePass1' };
      const unknownError = new Error('Network failure');
      mockCreateUser.mockRejectedValue(unknownError);

      await expect(authService.register(dto)).rejects.toThrow(
        'Network failure',
      );
    });
  });

  describe('login', () => {
    const dto = { email: 'test@example.com', password: 'securePass1' };

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should delegate login to FirebaseAuthService', async () => {
      mockLogin.mockResolvedValue({
        idToken: 'firebase-id-token',
        email: 'test@example.com',
        expiresIn: '3600',
        uid: 'firebase-uid-123',
      });

      const result = await authService.login(dto);

      expect(result).toEqual({
        idToken: 'firebase-id-token',
        email: 'test@example.com',
        expiresIn: '3600',
        uid: 'firebase-uid-123',
      });
      expect(mockLogin).toHaveBeenCalledWith(dto);
    });

    it('should rethrow UnauthorizedException from FirebaseAuthService', async () => {
      mockLogin.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(authService.login(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should rethrow InternalServerErrorException from FirebaseAuthService', async () => {
      mockLogin.mockRejectedValue(
        new InternalServerErrorException(
          'Firebase Web API key is not configured',
        ),
      );

      await expect(authService.login(dto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should rethrow network errors from FirebaseAuthService', async () => {
      mockLogin.mockRejectedValue(new Error('Network failure'));

      await expect(authService.login(dto)).rejects.toThrow('Network failure');
    });
  });
});
