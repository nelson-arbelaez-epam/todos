// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { registerUser } from './auth.service';

const mockFetch = vi.fn();

describe('registerUser', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.restoreAllMocks();
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
      expect.stringContaining('/api/v1/auth/register'),
      expect.objectContaining({ method: 'POST' }),
    );
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
});
