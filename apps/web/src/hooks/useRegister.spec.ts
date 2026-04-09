import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as authService from '../services/auth.service';
import { useRegister } from './useRegister';

vi.mock('../services/auth.service');

const mockRegisterUser = vi.mocked(authService.registerUser);

describe('useRegister', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts with idle state', () => {
    const { result } = renderHook(() => useRegister());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.registeredUser).toBeNull();
  });

  it('sets isLoading while the request is in flight', async () => {
    let resolveRequest!: (value: authService.RegisterResponse) => void;
    mockRegisterUser.mockReturnValue(
      new Promise((res) => {
        resolveRequest = res;
      }),
    );

    const { result } = renderHook(() => useRegister());

    act(() => {
      void result.current.register({
        email: 'user@example.com',
        password: 'password123',
      });
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolveRequest({ uid: 'uid123', email: 'user@example.com' });
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('sets registeredUser on success', async () => {
    mockRegisterUser.mockResolvedValue({
      uid: 'uid123',
      email: 'user@example.com',
    });

    const { result } = renderHook(() => useRegister());

    await act(async () => {
      await result.current.register({
        email: 'user@example.com',
        password: 'password123',
      });
    });

    expect(result.current.registeredUser).toEqual({
      uid: 'uid123',
      email: 'user@example.com',
    });
    expect(result.current.error).toBeNull();
  });

  it('sets error message on failure', async () => {
    mockRegisterUser.mockRejectedValue(
      new Error('Email is already registered'),
    );

    const { result } = renderHook(() => useRegister());

    await act(async () => {
      await result.current.register({
        email: 'user@example.com',
        password: 'password123',
      });
    });

    expect(result.current.error).toBe('Email is already registered');
    expect(result.current.registeredUser).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('clears error with resetError', async () => {
    mockRegisterUser.mockRejectedValue(new Error('Some error'));

    const { result } = renderHook(() => useRegister());

    await act(async () => {
      await result.current.register({
        email: 'user@example.com',
        password: 'password123',
      });
    });

    expect(result.current.error).toBe('Some error');

    act(() => {
      result.current.resetError();
    });

    expect(result.current.error).toBeNull();
  });
});
