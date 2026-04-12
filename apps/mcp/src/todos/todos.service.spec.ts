import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TodosApiService } from './todos.service';

const apiToken = 'token-123';

const sampleTodo = {
  id: 'todo-1',
  title: 'Title',
  description: 'Desc',
  completed: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('TodosApiService', () => {
  let service: TodosApiService;
  let fetchMock: ReturnType<typeof vi.fn>;
  const originalApiUrl = process.env.TODOS_API_URL;

  beforeEach(() => {
    process.env.TODOS_API_URL = 'http://localhost:3001';
    service = new TodosApiService();
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    if (originalApiUrl === undefined) {
      delete process.env.TODOS_API_URL;
    } else {
      process.env.TODOS_API_URL = originalApiUrl;
    }
  });

  it('forwards query params and maps paginated API response', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [sampleTodo],
        total: 3,
        page: 1,
        limit: 2,
      }),
    });

    const result = await service.listTodos(apiToken, {
      page: 1,
      limit: 2,
      orderBy: 'updatedAt',
      orderDir: 'asc',
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/todos');
    expect(url).toContain('page=1');
    expect(url).toContain('limit=2');
    expect(url).toContain('orderBy=updatedAt');
    expect(url).toContain('orderDir=asc');
    expect(options.headers).toEqual({ Authorization: `Bearer ${apiToken}` });

    expect(result).toEqual({
      todos: [sampleTodo],
      total: 3,
      hasMore: true,
    });
  });

  it('computes hasMore as false at the pagination boundary', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [sampleTodo],
        total: 2,
        page: 1,
        limit: 2,
      }),
    });

    const result = await service.listTodos(apiToken, { page: 1, limit: 2 });

    expect(result.hasMore).toBe(false);
  });

  it('propagates API errors with server message when response is non-ok', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      json: async () => ({ message: 'Backend unavailable' }),
    });

    await expect(service.listTodos(apiToken)).rejects.toMatchObject({
      message: 'Backend unavailable',
      status: 503,
    });
  });

  describe('updateTodo', () => {
    it('sends a PATCH request and returns the updated todo', async () => {
      const updatedTodo = { ...sampleTodo, title: 'Updated', completed: true };
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => updatedTodo,
      });

      const result = await service.updateTodo(apiToken, 'todo-1', {
        title: 'Updated',
        completed: true,
      });

      expect(fetchMock).toHaveBeenCalledOnce();
      const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('/api/v1/todos/todo-1');
      expect(options.method).toBe('PATCH');
      expect(options.headers).toMatchObject({
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      });
      expect(JSON.parse(options.body as string)).toEqual({
        title: 'Updated',
        completed: true,
      });
      expect(result).toEqual(updatedTodo);
    });

    it('throws with status 404 when todo is not found', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'Todo not found' }),
      });

      await expect(
        service.updateTodo(apiToken, 'missing-id', { title: 'x' }),
      ).rejects.toMatchObject({
        message: 'Todo not found',
        status: 404,
      });
    });

    it('propagates API errors when response is non-ok', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: async () => ({ message: 'Backend unavailable' }),
      });

      await expect(
        service.updateTodo(apiToken, 'todo-1', { completed: true }),
      ).rejects.toMatchObject({
        message: 'Backend unavailable',
        status: 503,
      });
    });
  });

  describe('archiveTodo', () => {
    const archivedTodo = {
      ...sampleTodo,
      archivedAt: '2026-02-01T00:00:00.000Z',
      updatedAt: '2026-02-01T00:00:00.000Z',
    };

    it('archives a todo and returns the archived todo DTO', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => archivedTodo,
      });

      const result = await service.archiveTodo(apiToken, 'todo-1');

      expect(fetchMock).toHaveBeenCalledOnce();
      const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('http://localhost:3001/api/v1/todos/todo-1/archive');
      expect((options as RequestInit & { method: string }).method).toBe(
        'PATCH',
      );
      expect(options.headers).toEqual({ Authorization: `Bearer ${apiToken}` });
      expect(result).toEqual(archivedTodo);
    });

    it('URL-encodes the todo id', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => archivedTodo,
      });

      await service.archiveTodo(apiToken, 'todo/with/slashes');

      const [url] = fetchMock.mock.calls[0] as [string];
      expect(url).toContain('todo%2Fwith%2Fslashes');
    });

    it('propagates API errors with the server message', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'Todo not found' }),
      });

      await expect(
        service.archiveTodo(apiToken, 'missing-id'),
      ).rejects.toMatchObject({
        message: 'Todo not found',
        status: 404,
      });
    });

    it('falls back to statusText when the error body has no message', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({}),
      });

      await expect(
        service.archiveTodo(apiToken, 'todo-1'),
      ).rejects.toMatchObject({
        message: 'Internal Server Error',
        status: 500,
      });
    });
  });
});
