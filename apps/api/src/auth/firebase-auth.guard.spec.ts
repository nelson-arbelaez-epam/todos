import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';

const mockVerifyIdToken = vi.fn();

const mockFirebaseAdminService = {
  auth: {
    verifyIdToken: mockVerifyIdToken,
  },
};

function buildContext(authHeader?: string): ExecutionContext {
  const request = {
    headers: authHeader ? { authorization: authHeader } : {},
  } as unknown;

  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as ExecutionContext;
}

describe('FirebaseAuthGuard', () => {
  let guard: FirebaseAuthGuard;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseAuthGuard,
        { provide: FirebaseAdminService, useValue: mockFirebaseAdminService },
      ],
    }).compile();

    guard = module.get<FirebaseAuthGuard>(FirebaseAuthGuard);
  });

  it('should attach user and return true for a valid token', async () => {
    mockVerifyIdToken.mockResolvedValue({ uid: 'user-123' });

    const ctx = buildContext('Bearer valid-token');
    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-token');
    const req = ctx.switchToHttp().getRequest<{ user: { uid: string } }>();
    expect(req.user).toEqual({ uid: 'user-123' });
  });

  it('should throw UnauthorizedException when Authorization header is missing', async () => {
    const ctx = buildContext();

    await expect(guard.canActivate(ctx)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(mockVerifyIdToken).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException when Authorization header has wrong scheme', async () => {
    const ctx = buildContext('Basic some-credentials');

    await expect(guard.canActivate(ctx)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(mockVerifyIdToken).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException when token is invalid', async () => {
    mockVerifyIdToken.mockRejectedValue(new Error('Token expired'));

    const ctx = buildContext('Bearer expired-token');

    await expect(guard.canActivate(ctx)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
