import type {
  RegisterError,
  RegisterPayload,
  RegisterResult,
} from '../types/auth';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

/**
 * Calls the backend register endpoint.
 * Throws a typed RegisterError on failure.
 */
export async function registerUser(
  payload: RegisterPayload,
): Promise<RegisterResult> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    const err: RegisterError = {
      kind: 'network',
      message: 'Network request failed. Check your connection.',
    };
    throw err;
  }

  if (response.ok) {
    return (await response.json()) as RegisterResult;
  }

  let body: { message?: string } = {};
  try {
    body = (await response.json()) as { message?: string };
  } catch {
    // ignore parse failure
  }

  const message = body.message ?? 'An unexpected error occurred.';

  if (response.status === 409) {
    const err: RegisterError = { kind: 'conflict', message };
    throw err;
  }

  if (response.status === 400) {
    const err: RegisterError = { kind: 'validation', message };
    throw err;
  }

  const err: RegisterError = { kind: 'unknown', message };
  throw err;
}
