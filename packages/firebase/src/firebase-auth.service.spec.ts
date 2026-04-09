import type { App } from 'firebase-admin/app';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FirebaseAuthService } from './firebase-auth.service';
import { FirebaseWebProxyService } from './firebase-web-proxy.service';

const authMock = {
  createUser: vi.fn(),
  verifyIdToken: vi.fn(),
  getUser: vi.fn(),
};

vi.mock('firebase-admin/auth', () => ({
  getAuth: vi.fn(() => authMock),
}));

describe('FirebaseAuthService', () => {
  const firebaseWebProxy = {
    login: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a new user with provided properties', async () => {
    const userRecord = { uid: 'new-user-1', email: 'new@example.com' };
    authMock.createUser.mockResolvedValue(userRecord);

    const service = new FirebaseAuthService(
      {} as App,
      firebaseWebProxy as unknown as FirebaseWebProxyService,
    );
    const result = await service.createUser({
      email: 'new@example.com',
      password: 'password123',
    });

    expect(result).toEqual(userRecord);
    expect(authMock.createUser).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'password123',
    });
  });

  it('verifies ID token with revocation flag', async () => {
    authMock.verifyIdToken.mockResolvedValue({ uid: 'user-1' });

    const service = new FirebaseAuthService(
      {} as App,
      firebaseWebProxy as unknown as FirebaseWebProxyService,
    );
    const result = await service.verifyIdToken('token-1', true);

    expect(result).toEqual({ uid: 'user-1' });
    expect(authMock.verifyIdToken).toHaveBeenCalledWith('token-1', true);
  });

  it('returns user by uid', async () => {
    authMock.getUser.mockResolvedValue({ uid: 'user-1' });

    const service = new FirebaseAuthService(
      {} as App,
      firebaseWebProxy as unknown as FirebaseWebProxyService,
    );
    const result = await service.getUser('user-1');

    expect(result).toEqual({ uid: 'user-1' });
    expect(authMock.getUser).toHaveBeenCalledWith('user-1');
  });

  it('delegates login to FirebaseWebProxyService', async () => {
    firebaseWebProxy.login.mockResolvedValue({
      idToken: 'firebase-id-token',
      email: 'test@example.com',
      expiresIn: '3600',
      uid: 'firebase-uid-123',
    });

    const service = new FirebaseAuthService(
      {} as App,
      firebaseWebProxy as unknown as FirebaseWebProxyService,
    );
    const result = await service.login({
      email: 'test@example.com',
      password: 'securePass1',
    });

    expect(result).toEqual({
      idToken: 'firebase-id-token',
      email: 'test@example.com',
      expiresIn: '3600',
      uid: 'firebase-uid-123',
    });
    expect(firebaseWebProxy.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'securePass1',
    });
  });

  it('rethrows login errors from FirebaseWebProxyService', async () => {
    firebaseWebProxy.login.mockRejectedValue(new Error('Network failure'));

    const service = new FirebaseAuthService(
      {} as App,
      firebaseWebProxy as unknown as FirebaseWebProxyService,
    );

    await expect(
      service.login({
        email: 'test@example.com',
        password: 'securePass1',
      }),
    ).rejects.toThrow('Network failure');
  });
});
