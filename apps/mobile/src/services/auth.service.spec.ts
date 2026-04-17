// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loginUser, registerUser } from './auth.service';

const mockFetch = vi.fn();
const originalApiBaseUrl = process.env.EXPO_PUBLIC_TODOS_API_URL;

describe('registerUser', () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_TODOS_API_URL = 'http://mobile-api.test';
    mockFetch.mockReset();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.restoreAllMocks();

    if (originalApiBaseUrl === undefined) {
      delete process.env.EXPO_PUBLIC_TODOS_API_URL;
      return;
    }

    process.env.EXPO_PUBLIC_TODOS_API_URL = originalApiBaseUrl;
  });

  it('returns uid and email on successful registration', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ uid: 'uid-123', email: 'test@example.com' }),
    });

    const result = await registerUser({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result).toEqual({ uid: 'uid-123', email: 'test@example.com' });
    expect(mockFetch).toHaveBeenCalledWith(
      'http://mobile-api.test/api/v1/auth/register',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('throws before making a request when EXPO_PUBLIC_TODOS_API_URL is missing', async () => {
    delete process.env.EXPO_PUBLIC_TODOS_API_URL;

    await expect(
      registerUser({ email: 'test@example.com', password: 'password123' }),
    ).rejects.toThrow(
      'EXPO_PUBLIC_TODOS_API_URL is required for mobile API requests.',
    );

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('throws an error with conflict message when email is already registered (409)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ message: 'Email is already registered' }),
    });

    await expect(
      registerUser({ email: 'dup@example.com', password: 'password123' }),
    ).rejects.toThrow('Email is already registered');
  });

  it('throws an error with validation message when input is invalid (400)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: 'password is too weak' }),
    });

    await expect(
      registerUser({ email: 'a@b.com', password: '123' }),
    ).rejects.toThrow('password is too weak');
  });

  it('throws an error when the server response body has no message and status is 409', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({}),
    });

    await expect(
      registerUser({ email: 'a@b.com', password: 'password123' }),
    ).rejects.toThrow('Email is already registered');
  });

  it('throws a generic error for unexpected status codes', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Internal server error' }),
    });

    await expect(
      registerUser({ email: 'a@b.com', password: 'password123' }),
    ).rejects.toThrow('Internal server error');
  });

  it('throws a network error when fetch rejects', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    await expect(
      registerUser({ email: 'a@b.com', password: 'password123' }),
    ).rejects.toThrow('Failed to fetch');
  });

  it('uses the configured API base URL for login requests', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        uid: 'uid-123',
        email: 'test@example.com',
        idToken: 'token-123',
        expiresIn: '3600',
      }),
    });

    const result = await loginUser({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result).toEqual({
      uid: 'uid-123',
      email: 'test@example.com',
      idToken: 'token-123',
      expiresIn: '3600',
    });
    expect(mockFetch).toHaveBeenCalledWith(
      'http://mobile-api.test/api/v1/auth/login',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  describe('loginUser error handling', () => {
    it('throws an error with server-provided message on 401', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Invalid credentials' }),
      });

      await expect(
        loginUser({ email: 'a@b.com', password: 'wrong' }),
      ).rejects.toThrow('Invalid credentials');
    });

    it('throws default message on 401 when body has no message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({}),
      });

      await expect(
        loginUser({ email: 'a@b.com', password: 'wrong' }),
      ).rejects.toThrow('Invalid email or password');
    });

    it('throws network error when fetch rejects for login', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network fail'));

      await expect(
        loginUser({ email: 'a@b.com', password: 'pwd' }),
      ).rejects.toThrow('Network fail');
    });
  });
});
