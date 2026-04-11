import type {
  RegisterUserDto,
  RegisterUserResponseDto,
} from '@todos/core/http';
import { create } from 'zustand';
import { registerUser } from '../services/auth.service';

interface SessionStoreState {
  isLoading: boolean;
  error: string | null;
  currentUser: RegisterUserResponseDto | null;
  register: (payload: RegisterUserDto) => Promise<void>;
  resetError: () => void;
  clearCurrentUser: () => void;
}

const initialSessionState = {
  isLoading: false,
  error: null,
  currentUser: null,
} as const;

export const useSessionStore = create<SessionStoreState>((set) => ({
  ...initialSessionState,
  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const user = await registerUser(payload);
      set({ currentUser: user });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Registration failed';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },
  resetError: () => set({ error: null }),
  clearCurrentUser: () => set({ currentUser: null }),
}));

// Test helper to guarantee deterministic store state between test cases.
export const resetSessionStoreForTests = () => {
  useSessionStore.setState({ ...initialSessionState });
};
