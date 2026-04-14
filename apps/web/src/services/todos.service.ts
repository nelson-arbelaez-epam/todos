import type { CreateTodoDto, TodoDto, TodoListDto } from '@todos/core/http';

// VITE_ prefix is required for Vite to expose the variable in the browser bundle.
const API_BASE_URL =
  import.meta.env.VITE_TODOS_API_URL ?? 'http://localhost:3000';

interface ApiError {
  message?: string | string[];
}

type HttpError = Error & { status?: number };

function resolveApiErrorMessage(body: ApiError, fallback: string): string {
  if (typeof body.message === 'string') {
    return body.message;
  }
  if (Array.isArray(body.message) && body.message.length > 0) {
    return body.message[0] ?? fallback;
  }
  return fallback;
}

/**
 * List active todos for the current user. Returns the items array.
 * Include `idToken` (Firebase JWT) as `Authorization: Bearer <token>` when present.
 */
export async function listTodos(idToken?: string): Promise<TodoDto[]> {
  const url = `${API_BASE_URL}/api/v1/todos`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (idToken) headers.Authorization = `Bearer ${idToken}`;

  const response = await fetch(url, { headers });
  if (!response.ok) {
    const json = (await response.json().catch(() => ({}))) as ApiError;
    const message = resolveApiErrorMessage(json, 'Failed to fetch todos');
    const error = new Error(message) as HttpError;
    error.status = response.status;
    throw error;
  }

  const body = (await response.json()) as TodoListDto;
  return body.items ?? [];
}

/**
 * Create a new todo for the current user.
 */
export async function createTodo(
  payload: CreateTodoDto,
  idToken?: string,
): Promise<TodoDto> {
  const url = `${API_BASE_URL}/api/v1/todos`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (idToken) headers.Authorization = `Bearer ${idToken}`;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const json = (await response.json().catch(() => ({}))) as ApiError;
    const message = resolveApiErrorMessage(json, 'Failed to create todo');
    const error = new Error(message) as HttpError;
    error.status = response.status;
    throw error;
  }

  return response.json() as Promise<TodoDto>;
}
