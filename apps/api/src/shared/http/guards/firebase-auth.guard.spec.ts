import { createHash } from 'node:crypto';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, type TestingModule } from '@nestjs/testing';
import { FirebaseAuthService } from '@todos/firebase';
import { ApiTokenStoreService } from '@todos/store';
import { AUTH_SCOPE_KEY } from '../decorators/auth-scope.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { FirebaseAuthGuard } from './firebase-auth.guard';

const mockVerifyIdToken = vi.fn();
const mockFindByHash = vi.fn();
const mockUpdateLastUsedAt = vi.fn();

const mockFirebaseAuthService = {
  verifyIdToken: mockVerifyIdToken,
};

const mockApiTokenStoreService = {
  findByHash: mockFindByHash,
  updateLastUsedAt: mockUpdateLastUsedAt,
};

function buildContext({
  authorization,
  handlerMetadata,
  classMetadata,
}: {
  authorization?: string;
  handlerMetadata?: Record<string, unknown>;
  classMetadata?: Record<string, unknown>;
}) {
  const getHandler = vi.fn();
  const getClass = vi.fn();
  const getRequest = vi.fn().mockReturnValue({
    headers: authorization ? { authorization } : {},
    user: undefined,
  });

  const reflectorGetAllAndOverride = vi
    .fn()
    .mockImplementation(
      (
        key: string,
        targets: [ReturnType<typeof getHandler>, ReturnType<typeof getClass>],
      ) => {
        const [handler, cls] = targets;
        if (handler === getHandler()) return handlerMetadata?.[key];
        if (cls === getClass()) return classMetadata?.[key];
        return undefined;
      },
    );

  return {
    getRequest,
    reflectorGetAllAndOverride,
    context: {
      switchToHttp: () => ({ getRequest }),
      getHandler,
      getClass,
    },
  };
}

describe('FirebaseAuthGuard', () => {
  let guard: FirebaseAuthGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockUpdateLastUsedAt.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseAuthGuard,
        Reflector,
        {
          provide: FirebaseAuthService,
          useValue: mockFirebaseAuthService,
        },
        {
          provide: ApiTokenStoreService,
          useValue: mockApiTokenStoreService,
        },
      ],
    }).compile();

    guard = module.get<FirebaseAuthGuard>(FirebaseAuthGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  describe('public routes', () => {
    it('should allow access to routes marked with @Public()', async () => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(true);

      const { context } = buildContext({});
      const result = await guard.canActivate(context as never);

      expect(result).toBe(true);
      expect(mockVerifyIdToken).not.toHaveBeenCalled();
    });
  });

  describe('protected routes - missing token', () => {
    it('should throw UnauthorizedException when Authorization header is absent', async () => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(false);

      const { context } = buildContext({});

      await expect(guard.canActivate(context as never)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockVerifyIdToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when Authorization header has wrong scheme', async () => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(false);

      const { context } = buildContext({ authorization: 'Basic dXNlcjpwYXNz' });

      await expect(guard.canActivate(context as never)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when Bearer token is empty', async () => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(false);

      const { context } = buildContext({ authorization: 'Bearer ' });

      await expect(guard.canActivate(context as never)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('protected routes - valid Firebase token', () => {
    it('should allow access and attach decoded token to request.user', async () => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(false);

      const decodedToken = {
        uid: 'user-123',
        email: 'user@example.com',
        aud: 'project-id',
        iss: 'https://securetoken.google.com/project-id',
        sub: 'user-123',
        iat: 1000,
        exp: 2000,
        auth_time: 1000,
        firebase: { identities: {}, sign_in_provider: 'password' },
      };

      mockVerifyIdToken.mockResolvedValue(decodedToken);

      const requestObj = {
        headers: { authorization: 'Bearer valid-token' },
        user: undefined,
      };
      const context = {
        switchToHttp: () => ({ getRequest: () => requestObj }),
        getHandler: vi.fn(),
        getClass: vi.fn(),
      };

      const result = await guard.canActivate(context as never);

      expect(result).toBe(true);
      expect(requestObj.user).toEqual(decodedToken);
      expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-token');
    });
  });

  describe('protected routes - invalid/expired Firebase token', () => {
    it('should throw UnauthorizedException when token verification fails', async () => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(false);

      mockVerifyIdToken.mockRejectedValue(
        new Error(
          'Firebase ID token has expired. Get a fresh token from your client app.',
        ),
      );

      const { context } = buildContext({
        authorization: 'Bearer expired-token',
      });

      await expect(guard.canActivate(context as never)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when token is malformed', async () => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(false);

      mockVerifyIdToken.mockRejectedValue(
        new Error(
          'Decoding Firebase ID token failed. Make sure you passed a string.',
        ),
      );

      const { context } = buildContext({ authorization: 'Bearer bad-token' });

      await expect(guard.canActivate(context as never)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should not expose internal error details in the UnauthorizedException message', async () => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(false);

      mockVerifyIdToken.mockRejectedValue(new Error('internal details'));

      const { context } = buildContext({ authorization: 'Bearer some-token' });

      await expect(guard.canActivate(context as never)).rejects.toThrow(
        'Invalid or expired authentication token',
      );
    });
  });

  describe('protected routes - API token (todos_ prefix)', () => {
    const rawToken = 'todos_dGhpcyBpcyBhIHRlc3QgdG9rZW4gZm9yIHRlc3Q';
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    const activeEntity = {
      tokenId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      ownerUid: 'user-123',
      label: 'MCP server – production',
      scopes: ['todos:read', 'todos:write'],
      tokenHash,
      createdAt: '2026-04-11T13:00:00.000Z',
      expiresAt: null,
      lastUsedAt: null,
      revokedAt: null,
    };

    it('should authenticate with a valid API token and attach ApiTokenPrincipal', async () => {
      vi.spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(false) // IS_PUBLIC_KEY
        .mockReturnValueOnce(['todos:read', 'todos:write']); // AUTH_SCOPE_KEY — scoped route

      mockFindByHash.mockResolvedValue(activeEntity);

      const requestObj = {
        headers: { authorization: `Bearer ${rawToken}` },
        user: undefined,
      };
      const context = {
        switchToHttp: () => ({ getRequest: () => requestObj }),
        getHandler: vi.fn(),
        getClass: vi.fn(),
      };

      const result = await guard.canActivate(context as never);

      expect(result).toBe(true);
      expect(requestObj.user).toMatchObject({
        uid: 'user-123',
        authProvider: 'api-token',
        apiTokenId: activeEntity.tokenId,
        scopes: ['todos:read', 'todos:write'],
      });
      expect(mockVerifyIdToken).not.toHaveBeenCalled();
      expect(mockFindByHash).toHaveBeenCalledWith(tokenHash);
    });

    it('should throw UnauthorizedException when API token is not found', async () => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(false);

      mockFindByHash.mockResolvedValue(null);

      const { context } = buildContext({ authorization: `Bearer ${rawToken}` });

      await expect(guard.canActivate(context as never)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when API token is revoked', async () => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(false);

      mockFindByHash.mockResolvedValue({
        ...activeEntity,
        revokedAt: '2026-04-10T00:00:00.000Z',
      });

      const { context } = buildContext({ authorization: `Bearer ${rawToken}` });

      await expect(guard.canActivate(context as never)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when API token is expired', async () => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(false);

      mockFindByHash.mockResolvedValue({
        ...activeEntity,
        expiresAt: '2020-01-01T00:00:00.000Z',
      });

      const { context } = buildContext({ authorization: `Bearer ${rawToken}` });

      await expect(guard.canActivate(context as never)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should call updateLastUsedAt after successful API token validation', async () => {
      vi.spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(['todos:read', 'todos:write']); // scoped route

      mockFindByHash.mockResolvedValue(activeEntity);

      const requestObj = {
        headers: { authorization: `Bearer ${rawToken}` },
        user: undefined,
      };
      const context = {
        switchToHttp: () => ({ getRequest: () => requestObj }),
        getHandler: vi.fn(),
        getClass: vi.fn(),
      };

      await guard.canActivate(context as never);

      // Allow the best-effort promise to settle
      await new Promise((r) => setTimeout(r, 0));
      expect(mockUpdateLastUsedAt).toHaveBeenCalledWith(activeEntity.tokenId);
    });
  });

  describe('@AuthScope enforcement (API-token requests)', () => {
    const rawToken = 'todos_scopeTestTokenValue00000000000000000';
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    const readOnlyEntity = {
      tokenId: 'scope-test-token-id',
      ownerUid: 'user-456',
      label: 'Read-only token',
      scopes: ['todos:read'],
      tokenHash,
      createdAt: '2026-04-11T13:00:00.000Z',
      expiresAt: null,
      lastUsedAt: null,
      revokedAt: null,
    };

    it('should throw ForbiddenException when API token is used on an unscoped route', async () => {
      // Routes without @AuthScope are reserved for Firebase JWT callers only
      vi.spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(false) // IS_PUBLIC_KEY
        .mockReturnValueOnce(undefined); // AUTH_SCOPE_KEY — no scopes declared

      mockFindByHash.mockResolvedValue(readOnlyEntity);

      const requestObj = {
        headers: { authorization: `Bearer ${rawToken}` },
        user: undefined,
      };
      const context = {
        switchToHttp: () => ({ getRequest: () => requestObj }),
        getHandler: vi.fn(),
        getClass: vi.fn(),
      };

      await expect(guard.canActivate(context as never)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException when API token is used on a route with empty scope array', async () => {
      vi.spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(false) // IS_PUBLIC_KEY
        .mockReturnValueOnce([]); // AUTH_SCOPE_KEY — empty array

      mockFindByHash.mockResolvedValue(readOnlyEntity);

      const requestObj = {
        headers: { authorization: `Bearer ${rawToken}` },
        user: undefined,
      };
      const context = {
        switchToHttp: () => ({ getRequest: () => requestObj }),
        getHandler: vi.fn(),
        getClass: vi.fn(),
      };

      await expect(guard.canActivate(context as never)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow access when token has the required scope', async () => {
      vi.spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(false) // IS_PUBLIC_KEY
        .mockReturnValueOnce(['todos:read']); // AUTH_SCOPE_KEY

      mockFindByHash.mockResolvedValue(readOnlyEntity);

      const requestObj = {
        headers: { authorization: `Bearer ${rawToken}` },
        user: undefined,
      };
      const context = {
        switchToHttp: () => ({ getRequest: () => requestObj }),
        getHandler: vi.fn(),
        getClass: vi.fn(),
      };

      const result = await guard.canActivate(context as never);
      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when token lacks a required scope', async () => {
      vi.spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(false) // IS_PUBLIC_KEY
        .mockReturnValueOnce(['todos:write']); // AUTH_SCOPE_KEY — token only has todos:read

      mockFindByHash.mockResolvedValue(readOnlyEntity);

      const requestObj = {
        headers: { authorization: `Bearer ${rawToken}` },
        user: undefined,
      };
      const context = {
        switchToHttp: () => ({ getRequest: () => requestObj }),
        getHandler: vi.fn(),
        getClass: vi.fn(),
      };

      await expect(guard.canActivate(context as never)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should not apply @AuthScope to Firebase-authenticated requests', async () => {
      // Firebase tokens are not checked against scopes
      const decodedToken = {
        uid: 'firebase-user',
        aud: 'project-id',
        iss: 'https://securetoken.google.com/project-id',
        sub: 'firebase-user',
        iat: 1000,
        exp: 9999999999,
        auth_time: 1000,
        firebase: { identities: {}, sign_in_provider: 'password' },
      };

      mockVerifyIdToken.mockResolvedValue(decodedToken);

      const requestObj = {
        headers: { authorization: 'Bearer firebase-jwt-token' },
        user: undefined,
      };
      const context = {
        switchToHttp: () => ({ getRequest: () => requestObj }),
        getHandler: vi.fn(),
        getClass: vi.fn(),
      };

      // Even if @AuthScope('todos:write') is declared, Firebase tokens pass through
      vi.spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(['todos:write']);

      const result = await guard.canActivate(context as never);
      expect(result).toBe(true);
    });
  });

  describe('IS_PUBLIC_KEY metadata check', () => {
    it('uses IS_PUBLIC_KEY constant', () => {
      expect(IS_PUBLIC_KEY).toBe('isPublic');
    });
  });

  describe('AUTH_SCOPE_KEY metadata check', () => {
    it('uses AUTH_SCOPE_KEY constant', () => {
      expect(AUTH_SCOPE_KEY).toBe('authScopes');
    });
  });
});
