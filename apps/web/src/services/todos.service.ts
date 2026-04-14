import type { TodoDto, TodoListDto } from '@todos/core/http';

// VITE_ prefix is required for Vite to expose the variable in the browser bundle.
const API_BASE_URL =
  import.meta.env.VITE_TODOS_API_URL ?? 'http://localhost:3000';

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
    const json = await response.json().catch(() => ({}));
    const message =
      typeof json.message === 'string' ? json.message : 'Failed to fetch todos';
    throw new Error(message);
  }

  const body = (await response.json()) as TodoListDto;
  return body.items ?? [];
}
