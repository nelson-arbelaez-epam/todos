import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import type { ApiTokenResponseDto, CreateApiTokenDto } from '@todos/core/http';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { AuthenticatedPrincipal } from '../../shared/http/guards/firebase-auth.guard';
import { ApiTokenService } from '../api-token.service';
import { AuthService } from '../auth.service';
import { AuthController } from './auth.controller';

const mockAuthService = {
  register: vi.fn(),
  login: vi.fn(),
};

const mockApiTokenService = {
  createToken: vi.fn(),
};

describe('AuthController', () => {
  let authController: AuthController;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ApiTokenService, useValue: mockApiTokenService },
      ],
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

  describe('createToken', () => {
    const mockUser = { uid: 'firebase-uid-123' } as DecodedIdToken;

    it('should return the token response on successful creation', async () => {
      const dto = {
        label: 'MCP server – production',
        scopes: ['todos:read' as const, 'todos:write' as const],
      };
      const expected: ApiTokenResponseDto = {
        tokenId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        token: 'todos_abc123',
        label: 'MCP server – production',
        scopes: ['todos:read', 'todos:write'],
        createdAt: '2026-04-11T13:00:00.000Z',
        expiresAt: '2027-04-11T13:00:00.000Z',
      };

      mockApiTokenService.createToken.mockResolvedValue(expected);

      const result = await authController.createToken(mockUser, dto);

      expect(result).toEqual(expected);
      expect(mockApiTokenService.createToken).toHaveBeenCalledWith(
        mockUser.uid,
        dto,
      );
    });

    it('should propagate errors from ApiTokenService', async () => {
      const dto = {
        label: 'Test token',
        scopes: ['todos:read' as const],
      };

      mockApiTokenService.createToken.mockRejectedValue(
        new Error('Firestore unavailable'),
      );

      await expect(authController.createToken(mockUser, dto)).rejects.toThrow(
        'Firestore unavailable',
      );
    });

    it('should return 403 when user is authenticated via API token (token proliferation check)', async () => {
      // Per ADR 0022, only Firebase JWT can issue tokens; API tokens cannot create other tokens
      const apiTokenPrincipal: AuthenticatedPrincipal = {
        uid: 'firebase-uid-123',
        authProvider: 'api-token',
        apiTokenId: 'existing-token-id',
        scopes: ['todos:read'],
      };

      const dto: CreateApiTokenDto = {
        label: 'Malicious Token',
        scopes: ['todos:write'],
      };

      await expect(
        authController.createToken(apiTokenPrincipal, dto),
      ).rejects.toThrow(ForbiddenException);

      expect(mockApiTokenService.createToken).not.toHaveBeenCalled();
    });
  });
});
