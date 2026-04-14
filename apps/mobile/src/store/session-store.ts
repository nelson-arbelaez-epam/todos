import type {
  LoginUserDto,
  LoginUserResponseDto,
  RegisterUserDto,
} from '@todos/core/http';
import { create } from 'zustand';
import { loginUser, registerUser } from '@/services/auth.service';

interface SessionStoreState {
  isLoading: boolean;
  error: string | null;
  currentUser: LoginUserResponseDto | null;
  register: (payload: RegisterUserDto) => Promise<void>;
  login: (payload: LoginUserDto) => Promise<void>;
  logout: () => void;
  hydrateSession: () => LoginUserResponseDto | null;
  resetError: () => void;
  clearCurrentUser: () => void;
}

const initialSessionState = {
  isLoading: false,
  error: null,
  currentUser: null,
} as const;

export const useSessionStore = create<SessionStoreState>((set, get) => ({
  ...initialSessionState,
  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      await registerUser(payload);
      const session = await loginUser(payload);
      set({ currentUser: session });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Registration failed';
      set({ error: message, currentUser: null });
    } finally {
      set({ isLoading: false });
    }
  },
  login: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const session = await loginUser(payload);
      set({ currentUser: session });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Login failed. Please try again.';
      set({ error: message, currentUser: null });
    } finally {
      set({ isLoading: false });
    }
  },
  /** Clears in-memory session state. Persistence cleanup is handled by adapter integration. */
  logout: () => set({ currentUser: null, error: null }),
  /** Returns the current session snapshot used during hydration orchestration. */
  hydrateSession: () => get().currentUser,
  resetError: () => set({ error: null }),
  clearCurrentUser: () => set({ currentUser: null }),
}));

/** Test helper to guarantee deterministic store state between test cases. */
export const resetSessionStoreForTests = () => {
  useSessionStore.setState({ ...initialSessionState });
};
