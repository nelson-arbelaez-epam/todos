const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface RegisterResponse {
  uid: string;
  email: string;
}

export interface ApiError {
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
