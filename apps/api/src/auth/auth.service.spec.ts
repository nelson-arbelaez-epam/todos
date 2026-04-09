import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { FirebaseAuthService } from '@todos/firebase';
import { AuthService } from './auth.service';

const mockCreateUser = vi.fn();

const mockFirebaseAuthService = {
  createUser: mockCreateUser,
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

    beforeEach(() => {
      process.env.FIREBASE_WEB_API_KEY = 'test-api-key';
    });

    afterEach(() => {
      delete process.env.FIREBASE_WEB_API_KEY;
      vi.restoreAllMocks();
    });

    it('should return idToken and metadata on successful login', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          idToken: 'firebase-id-token',
          email: 'test@example.com',
          expiresIn: '3600',
          localId: 'firebase-uid-123',
          refreshToken: 'refresh-token',
          registered: true,
        }),
      };
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

      const result = await authService.login(dto);

      expect(result).toEqual({
        idToken: 'firebase-id-token',
        email: 'test@example.com',
        expiresIn: '3600',
        uid: 'firebase-uid-123',
      });
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('identitytoolkit.googleapis.com'),
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('should throw UnauthorizedException for INVALID_PASSWORD', async () => {
      const mockResponse = {
        ok: false,
        json: vi.fn().mockResolvedValue({
          error: { message: 'INVALID_PASSWORD' },
        }),
      };
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

      await expect(authService.login(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for EMAIL_NOT_FOUND', async () => {
      const mockResponse = {
        ok: false,
        json: vi.fn().mockResolvedValue({
          error: { message: 'EMAIL_NOT_FOUND' },
        }),
      };
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

      await expect(authService.login(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for INVALID_LOGIN_CREDENTIALS', async () => {
      const mockResponse = {
        ok: false,
        json: vi.fn().mockResolvedValue({
          error: { message: 'INVALID_LOGIN_CREDENTIALS' },
        }),
      };
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

      await expect(authService.login(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for USER_DISABLED', async () => {
      const mockResponse = {
        ok: false,
        json: vi.fn().mockResolvedValue({
          error: { message: 'USER_DISABLED' },
        }),
      };
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

      await expect(authService.login(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for unknown Firebase error codes', async () => {
      const mockResponse = {
        ok: false,
        json: vi.fn().mockResolvedValue({
          error: { message: 'SOME_UNKNOWN_ERROR' },
        }),
      };
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

      await expect(authService.login(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw InternalServerErrorException when FIREBASE_WEB_API_KEY is not set', async () => {
      delete process.env.FIREBASE_WEB_API_KEY;

      await expect(authService.login(dto)).rejects.toThrow(
        'Firebase Web API key is not configured',
      );
    });

    it('should re-throw network errors', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new Error('Network failure')),
      );

      await expect(authService.login(dto)).rejects.toThrow('Network failure');
    });
  });
});
