import { useCallback, useState } from 'react';
import { registerUser } from '../services/auth-api';
import type { RegisterError, RegisterResult } from '../types/auth';

export interface UseRegisterState {
  isLoading: boolean;
  error: RegisterError | null;
  result: RegisterResult | null;
}

export interface UseRegisterReturn extends UseRegisterState {
  register: (email: string, password: string) => Promise<void>;
  reset: () => void;
}

const INITIAL_STATE: UseRegisterState = {
  isLoading: false,
  error: null,
  result: null,
};

/**
 * Manages the registration flow state in isolation from UI components.
 * Calls the auth API and tracks loading, error, and success states.
 */
export function useRegister(): UseRegisterReturn {
  const [state, setState] = useState<UseRegisterState>(INITIAL_STATE);

  const register = useCallback(
    async (email: string, password: string): Promise<void> => {
      setState({ isLoading: true, error: null, result: null });
      try {
        const result = await registerUser({ email, password });
        setState({ isLoading: false, error: null, result });
      } catch (err) {
        const registerError = err as RegisterError;
        setState({ isLoading: false, error: registerError, result: null });
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return { ...state, register, reset };
}
