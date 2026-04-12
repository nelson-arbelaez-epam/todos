import { act } from '@testing-library/react';
import type { LoginUserResponseDto } from '@todos/core/http';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

describe('useSessionStore – login / logout', () => {
  const session: LoginUserResponseDto = {
    uid: 'uid456',
    email: 'login@example.com',
    idToken: 'token-456',
    expiresIn: '3600',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    resetSessionStoreForTests();
  });

  it('logs in and stores the authenticated session', async () => {
    mockLoginUser.mockResolvedValue(session);

    await act(async () => {
      await useSessionStore.getState().login({
        email: 'login@example.com',
        password: 'password123',
      });
    });

    expect(mockLoginUser).toHaveBeenCalledOnce();
    expect(useSessionStore.getState().currentUser).toEqual(session);
    expect(useSessionStore.getState().error).toBeNull();
    expect(useSessionStore.getState().isLoading).toBe(false);
  });

  it('stores the error and keeps user null when login fails', async () => {
    mockLoginUser.mockRejectedValue(new Error('Invalid email or password'));

    await act(async () => {
      await useSessionStore.getState().login({
        email: 'login@example.com',
        password: 'wrongpassword',
      });
    });

    expect(useSessionStore.getState().currentUser).toBeNull();
    expect(useSessionStore.getState().error).toBe('Invalid email or password');
    expect(useSessionStore.getState().isLoading).toBe(false);
  });

  it('clears the current user and error on logout', () => {
    useSessionStore.setState({ currentUser: session, error: 'some error' });

    useSessionStore.getState().logout();

    expect(useSessionStore.getState().currentUser).toBeNull();
    expect(useSessionStore.getState().error).toBeNull();
  });
});

describe('useSessionStore – persistence', () => {
  const session: LoginUserResponseDto = {
    uid: 'uid789',
    email: 'persist@example.com',
    idToken: 'token-789',
    expiresIn: '3600',
  };

  beforeEach(() => {
    localStorage.clear();
    resetSessionStoreForTests();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('persists currentUser to localStorage after login', async () => {
    mockLoginUser.mockResolvedValue(session);

    await act(async () => {
      await useSessionStore.getState().login({
        email: 'persist@example.com',
        password: 'password123',
      });
    });

    const stored = JSON.parse(localStorage.getItem('todos-session') ?? '{}');
    expect(stored.state.currentUser).toEqual(session);
  });

  it('clears persisted session from localStorage on logout', async () => {
    mockLoginUser.mockResolvedValue(session);

    await act(async () => {
      await useSessionStore.getState().login({
        email: 'persist@example.com',
        password: 'password123',
      });
    });

    act(() => {
      useSessionStore.getState().logout();
    });

    const stored = JSON.parse(localStorage.getItem('todos-session') ?? '{}');
    expect(stored.state?.currentUser).toBeNull();
  });

  it('hydrateSession returns currentUser from in-memory state', () => {
    useSessionStore.setState({ currentUser: session });

    const hydrated = useSessionStore.getState().hydrateSession();

    expect(hydrated).toEqual(session);
  });

  it('hydrateSession returns null when no session exists', () => {
    expect(useSessionStore.getState().hydrateSession()).toBeNull();
  });

  it('handles missing persisted data gracefully without throwing', () => {
    localStorage.setItem('todos-session', 'corrupted-json{');

    expect(() => {
      resetSessionStoreForTests();
    }).not.toThrow();

    expect(useSessionStore.getState().currentUser).toBeNull();
  });
});
