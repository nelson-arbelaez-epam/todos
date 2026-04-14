import type { TodoDto, TodoListDto } from '@todos/core/http';

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
