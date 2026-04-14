import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as AuthService from './auth.service';

describe('auth.service', () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('registerUser returns body on success and sends JSON body', async () => {
    const body = { userId: '1' };
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => body,
    } as Response);

    const res = await AuthService.registerUser({
      email: 'a',
      password: 'b',
    });
    expect(res).toEqual(body);

    const call = fetchMock.mock.calls[0];
    expect(call[1]?.method).toBe('POST');
    expect(call[1]?.headers).toMatchObject(
      expect.objectContaining({ 'Content-Type': 'application/json' }),
    );
  });

  it('registerUser maps 409 to friendly message when no body message', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({}),
    } as Response);
    await expect(
      AuthService.registerUser({ email: '', password: '' }),
    ).rejects.toThrow('Email is already registered');
  });

  it('loginUser returns body on success', async () => {
    const body = { token: 'x' };
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => body,
    } as Response);
    const res = await AuthService.loginUser({
      email: 'a',
      password: 'b',
    });
    expect(res).toEqual(body);
  });

  it('loginUser maps 401 to friendly message when no body message', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({}),
    } as Response);
    await expect(
      AuthService.loginUser({ email: '', password: '' }),
    ).rejects.toThrow('Invalid email or password');
  });
});
