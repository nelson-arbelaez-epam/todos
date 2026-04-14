// @vitest-environment node

import type { LoginUserResponseDto } from '@todos/core/http';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as authService from '@/services/auth.service';
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

    await useSessionStore.getState().register({
      email: 'user@example.com',
      password: 'password123',
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

    await useSessionStore.getState().register({
      email: 'user@example.com',
      password: 'password123',
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

    await useSessionStore.getState().register({
      email: 'user@example.com',
      password: 'password123',
    });

    expect(mockLoginUser).toHaveBeenCalledOnce();
    expect(useSessionStore.getState().currentUser).toBeNull();
    expect(useSessionStore.getState().error).toBe(
      'Login failed. Please try again.',
    );
  });

  it('logs in and stores the authenticated session when login succeeds', async () => {
    const session: LoginUserResponseDto = {
      uid: 'uid-login',
      email: 'login@example.com',
      idToken: 'token-xyz',
      expiresIn: '3600',
    };

    mockLoginUser.mockResolvedValue(session);

    await useSessionStore.getState().login({
      email: 'login@example.com',
      password: 'password123',
    });

    expect(mockLoginUser).toHaveBeenCalledOnce();
    expect(useSessionStore.getState().currentUser).toEqual(session);
    expect(useSessionStore.getState().error).toBeNull();
    expect(useSessionStore.getState().isLoading).toBe(false);
  });

  it('sets an error and keeps user signed out when login fails', async () => {
    mockLoginUser.mockRejectedValue(new Error('Invalid email or password'));

    await useSessionStore.getState().login({
      email: 'bad@example.com',
      password: 'wrong',
    });

    expect(useSessionStore.getState().currentUser).toBeNull();
    expect(useSessionStore.getState().error).toBe('Invalid email or password');
    expect(useSessionStore.getState().isLoading).toBe(false);
  });

  it('clears session when clearCurrentUser is called and resets error with resetError', () => {
    useSessionStore.setState({
      currentUser: { uid: 'u', email: 'e', idToken: 't', expiresIn: '1' },
      error: 'some-error',
    });

    useSessionStore.getState().clearCurrentUser();

    expect(useSessionStore.getState().currentUser).toBeNull();
    // error is not cleared by clearCurrentUser; call resetError to clear it
    expect(useSessionStore.getState().error).toBe('some-error');

    useSessionStore.getState().resetError();
    expect(useSessionStore.getState().error).toBeNull();
  });

  it('clears current user and error on logout', () => {
    useSessionStore.setState({
      currentUser: { uid: 'u', email: 'e', idToken: 't', expiresIn: '1' },
      error: 'some-error',
    });

    useSessionStore.getState().logout();

    expect(useSessionStore.getState().currentUser).toBeNull();
    expect(useSessionStore.getState().error).toBeNull();
  });

  it('returns current session snapshot from hydrateSession', () => {
    const session: LoginUserResponseDto = {
      uid: 'uid-hydrate',
      email: 'hydrate@example.com',
      idToken: 'token-hydrate',
      expiresIn: '3600',
    };
    useSessionStore.setState({ currentUser: session });

    expect(useSessionStore.getState().hydrateSession()).toEqual(session);
  });
});
