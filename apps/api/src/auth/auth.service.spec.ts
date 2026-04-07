import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';

const mockCreateUser = vi.fn();

const mockFirebaseAdminService = {
  auth: {
    createUser: mockCreateUser,
  },
};

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: FirebaseAdminService, useValue: mockFirebaseAdminService },
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

      expect(result).toEqual({ uid: 'firebase-uid-123', email: 'test@example.com' });
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

      await expect(authService.register(dto)).rejects.toThrow('Network failure');
    });
  });
});
