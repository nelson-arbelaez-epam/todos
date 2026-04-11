import type {
  LoginUserDto,
  LoginUserResponseDto,
  RegisterUserDto,
  RegisterUserResponseDto,
} from '@todos/core/http';

// VITE_ prefix is required for Vite to expose the variable in the browser bundle.
const API_BASE_URL =
  import.meta.env.VITE_TODOS_API_URL ?? 'http://localhost:3000';

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
  payload: RegisterUserDto,
): Promise<RegisterUserResponseDto> {
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

  return response.json() as Promise<RegisterUserResponseDto>;
}

/**
 * Authenticates a user with email and password via the API auth endpoint.
 * Returns the authenticated session payload used by the web app.
 */
export async function loginUser(
  payload: LoginUserDto,
): Promise<LoginUserResponseDto> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as Partial<ApiError>;
    const message =
      typeof body.message === 'string'
        ? body.message
        : response.status === 401
          ? 'Invalid email or password'
          : 'Login failed. Please try again.';
    throw new Error(message);
  }

  return response.json() as Promise<LoginUserResponseDto>;
}
