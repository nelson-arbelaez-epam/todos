import { act } from '@testing-library/react';
import type { LoginUserResponseDto } from '@todos/core/http';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as authService from '../services/auth.service';
import { resetSessionStoreForTests, useSessionStore } from './session-store';

vi.mock('../services/auth.service');

const mockRegisterUser = vi.mocked(authService.registerUser);
const mockLoginUser = vi.mocked(authService.loginUser);

describe('useSessionStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetSessionStoreForTests();
  });

  it('registers then logs in and stores the authenticated session', async () => {
    const session: LoginUserResponseDto = {
      uid: 'uid123',
      email: 'user@example.com',
      idToken: 'token-123',
      expiresIn: '3600',
    };
    mockRegisterUser.mockResolvedValue({
      uid: 'uid123',
      email: 'user@example.com',
    });
    mockLoginUser.mockResolvedValue(session);

    await act(async () => {
      await useSessionStore.getState().register({
        email: 'user@example.com',
        password: 'password123',
      });
    });

    expect(mockRegisterUser).toHaveBeenCalledOnce();
    expect(mockLoginUser).toHaveBeenCalledOnce();
    expect(useSessionStore.getState().currentUser).toEqual(session);
    expect(useSessionStore.getState().error).toBeNull();
    expect(useSessionStore.getState().isLoading).toBe(false);
  });

  it('does not attempt login if registration fails', async () => {
    mockRegisterUser.mockRejectedValue(
      new Error('Email is already registered'),
    );

    await act(async () => {
      await useSessionStore.getState().register({
        email: 'user@example.com',
        password: 'password123',
      });
    });

    expect(mockLoginUser).not.toHaveBeenCalled();
    expect(useSessionStore.getState().currentUser).toBeNull();
    expect(useSessionStore.getState().error).toBe(
      'Email is already registered',
    );
  });

  it('keeps the user signed out when automatic login fails after registration', async () => {
    mockRegisterUser.mockResolvedValue({
      uid: 'uid123',
      email: 'user@example.com',
    });
    mockLoginUser.mockRejectedValue(
      new Error('Login failed. Please try again.'),
    );

    await act(async () => {
      await useSessionStore.getState().register({
        email: 'user@example.com',
        password: 'password123',
      });
    });

    expect(mockLoginUser).toHaveBeenCalledOnce();
    expect(useSessionStore.getState().currentUser).toBeNull();
    expect(useSessionStore.getState().error).toBe(
      'Login failed. Please try again.',
    );
  });
});
