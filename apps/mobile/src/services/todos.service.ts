import type { CreateTodoDto, TodoDto, TodoListDto } from '@todos/core/http';

function getApiBaseUrl(): string {
  const apiBaseUrl = process.env.EXPO_PUBLIC_TODOS_API_URL;

  if (!apiBaseUrl) {
    throw new Error(
      'EXPO_PUBLIC_TODOS_API_URL is required for mobile API requests.',
    );
  }

  return apiBaseUrl;
}

/**
 * List active todos for the current user. Returns the items array with archived items filtered out.
 */
export async function listTodos(idToken?: string): Promise<TodoDto[]> {
  const url = `${getApiBaseUrl()}/api/v1/todos`;

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
  // Exclude archived todos by default
  return (body.items ?? []).filter((t) => !t.archivedAt);
}

function extractErrorMessage(
  json: unknown,
  fallback: string,
): string {
  if (typeof json !== 'object' || json === null) return fallback;
  const maybeMessage = (json as { message?: unknown }).message;

  if (typeof maybeMessage === 'string') return maybeMessage;
  if (Array.isArray(maybeMessage)) {
    const text = maybeMessage.filter((item) => typeof item === 'string').join(', ');
    if (text) return text;
  }

  return fallback;
}

/**
 * Create a todo for the current user and return the created record.
 */
export async function createTodo(
  payload: CreateTodoDto,
  idToken?: string,
): Promise<TodoDto> {
  const url = `${getApiBaseUrl()}/api/v1/todos`;

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
    const json = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(json, 'Failed to create todo'));
  }

  return (await response.json()) as TodoDto;
}
