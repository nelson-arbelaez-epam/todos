import { useState } from 'react';
import {
  type RegisterPayload,
  type RegisterResponse,
  registerUser,
} from '../services/auth.service';

export interface UseRegisterState {
  isLoading: boolean;
  error: string | null;
  registeredUser: RegisterResponse | null;
}

export interface UseRegisterReturn extends UseRegisterState {
  register: (payload: RegisterPayload) => Promise<void>;
  resetError: () => void;
}

/**
 * Hook that encapsulates registration state and API interaction.
 * Keeps business logic out of presentational components.
 */
export function useRegister(): UseRegisterReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredUser, setRegisteredUser] =
    useState<RegisterResponse | null>(null);

  const register = async (payload: RegisterPayload): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await registerUser(payload);
      setRegisteredUser(user);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Registration failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetError = () => setError(null);

  return { isLoading, error, registeredUser, register, resetError };
}
