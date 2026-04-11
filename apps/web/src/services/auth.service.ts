import type {
  RegisterUserDto,
  RegisterUserResponseDto,
} from '@todos/core/http';

// VITE_ prefix is required for Vite to expose the variable in the browser bundle.
// The semantic name TODOS_API_URL matches the convention used by other consumers
// (e.g. apps/mcp uses process.env.TODOS_API_URL).
const API_BASE_URL =
  import.meta.env.VITE_TODOS_API_URL ?? 'http://localhost:3000';

/** Mirrors Pick<RegisterUserDto, 'email' | 'password'> so the web layer stays
 *  in sync with the server-side DTO contract at compile time. */
export type RegisterPayload = Pick<RegisterUserDto, 'email' | 'password'>;

/** Alias for the canonical server-side response shape from @todos/core. */
export type RegisterResponse = RegisterUserResponseDto;

/**
 * Minimal subset of the NestJS global-exception-filter response envelope.
 * Kept local because it is only used inside this module to parse error bodies.
 * If more consumers need it, promote to @todos/core/http as a shared type.
 */
interface ApiError {
  message: string;
  statusCode: number;
}

/**
 * Registers a new user with email and password via the API auth endpoint.
 * Throws an error with a user-friendly message on failure.
 */
export async function registerUser(
  payload: RegisterPayload,
): Promise<RegisterResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as Partial<ApiError>;
    const message =
      typeof body.message === 'string'
        ? body.message
        : response.status === 409
          ? 'Email is already registered'
          : 'Registration failed. Please try again.';
    throw new Error(message);
  }

  return response.json() as Promise<RegisterResponse>;
}
