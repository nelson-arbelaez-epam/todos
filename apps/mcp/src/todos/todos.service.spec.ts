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
});
