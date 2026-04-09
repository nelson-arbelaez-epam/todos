import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FirebaseWebProxyService } from './firebase-web-proxy.service';

describe('FirebaseWebProxyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.FIREBASE_WEB_API_KEY;
    vi.unstubAllGlobals();
  });

  it('signs in a user through Firebase Identity Toolkit', async () => {
    process.env.FIREBASE_WEB_API_KEY = 'test-api-key';
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

    const service = new FirebaseWebProxyService();
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
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('identitytoolkit.googleapis.com'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('throws UnauthorizedException for credential-related Firebase errors', async () => {
    process.env.FIREBASE_WEB_API_KEY = 'test-api-key';
    const mockResponse = {
      ok: false,
      json: vi.fn().mockResolvedValue({
        error: { message: 'INVALID_LOGIN_CREDENTIALS' },
      }),
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    const service = new FirebaseWebProxyService();

    await expect(
      service.login({
        email: 'test@example.com',
        password: 'securePass1',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException for unknown Firebase sign-in errors', async () => {
    process.env.FIREBASE_WEB_API_KEY = 'test-api-key';
    const mockResponse = {
      ok: false,
      json: vi.fn().mockResolvedValue({
        error: { message: 'SOME_UNKNOWN_ERROR' },
      }),
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    const service = new FirebaseWebProxyService();

    await expect(
      service.login({
        email: 'test@example.com',
        password: 'securePass1',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws InternalServerErrorException when FIREBASE_WEB_API_KEY is not set', async () => {
    const service = new FirebaseWebProxyService();

    await expect(
      service.login({
        email: 'test@example.com',
        password: 'securePass1',
      }),
    ).rejects.toThrow(InternalServerErrorException);
  });

  it('rethrows network errors during sign-in', async () => {
    process.env.FIREBASE_WEB_API_KEY = 'test-api-key';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network failure')),
    );

    const service = new FirebaseWebProxyService();

    await expect(
      service.login({
        email: 'test@example.com',
        password: 'securePass1',
      }),
    ).rejects.toThrow('Network failure');
  });
});
