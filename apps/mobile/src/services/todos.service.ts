import type {
  CreateTodoDto,
  TodoDto,
  TodoListDto,
  UpdateTodoDto,
} from '@todos/core/http';

type HttpError = Error & { status?: number };
interface ListTodosParams {
  page?: number;
  limit?: number;
}

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
 * List active todos for the current user. Returns a paginated response.
 */
export async function listTodos(
  idToken?: string,
  params: ListTodosParams = {},
): Promise<TodoListDto> {
  const search = new URLSearchParams();
  if (params.page !== undefined) {
    search.set('page', String(params.page));
  }
  if (params.limit !== undefined) {
    search.set('limit', String(params.limit));
  }

  const queryString = search.toString();
  const url = `${getApiBaseUrl()}/api/v1/todos${queryString ? `?${queryString}` : ''}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (idToken) headers.Authorization = `Bearer ${idToken}`;

  const response = await fetch(url, { headers });
  if (!response.ok) {
    const json = await response.json().catch(() => ({}));
    const message =
      typeof json.message === 'string' ? json.message : 'Failed to fetch todos';
    const error = new Error(message) as HttpError;
    error.status = response.status;
    throw error;
  }

  return (await response.json()) as TodoListDto;
}

function extractErrorMessage(json: unknown, fallback: string): string {
  if (typeof json !== 'object' || json === null) return fallback;
  const maybeMessage = (json as { message?: unknown }).message;

  if (typeof maybeMessage === 'string') return maybeMessage;
  if (Array.isArray(maybeMessage)) {
    const joinedMessages = maybeMessage
      .filter((item) => typeof item === 'string')
      .join(', ');
    if (joinedMessages) return joinedMessages;
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
    const error = new Error(
      extractErrorMessage(json, 'Failed to create todo'),
    ) as HttpError;
    error.status = response.status;
    throw error;
  }

  return (await response.json()) as TodoDto;
}

/**
 * Update an existing todo for the current user.
 */
export async function updateTodo(
  id: string,
  payload: UpdateTodoDto,
  idToken?: string,
): Promise<TodoDto> {
  const url = `${getApiBaseUrl()}/api/v1/todos/${id}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (idToken) headers.Authorization = `Bearer ${idToken}`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const json = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(json, 'Failed to update todo'));
  }

  return (await response.json()) as TodoDto;
}
