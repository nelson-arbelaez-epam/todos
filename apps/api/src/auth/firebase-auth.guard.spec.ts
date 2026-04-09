import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, type TestingModule } from '@nestjs/testing';
import { IS_PUBLIC_KEY } from '@todos/shared';
import { FirebaseAuthService } from '@todos/firebase';
import { FirebaseAuthGuard } from './firebase-auth.guard';

const mockVerifyIdToken = vi.fn();

const mockFirebaseAuthService = {
  verifyIdToken: mockVerifyIdToken,
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseAuthGuard,
        Reflector,
        {
          provide: FirebaseAuthService,
          useValue: mockFirebaseAuthService,
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

  describe('protected routes - valid token', () => {
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

  describe('protected routes - invalid/expired token', () => {
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

  describe('IS_PUBLIC_KEY metadata check', () => {
    it('uses IS_PUBLIC_KEY constant from @todos/shared', () => {
      expect(IS_PUBLIC_KEY).toBe('isPublic');
    });
  });
});
