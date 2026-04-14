import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as TodosService from './todos.service';

describe('todos.service (mobile)', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    process.env.EXPO_PUBLIC_TODOS_API_URL = 'http://localhost:3000';
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    fetchMock.mockReset();
    delete process.env.EXPO_PUBLIC_TODOS_API_URL;
  });

  it('returns items when response is ok', async () => {
    const items = [
      {
        id: '1',
        title: 'One',
        description: undefined,
        completed: false,
        createdAt: '2020-01-01',
        updatedAt: '2020-01-01',
      },
    ];

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ items }),
    });

    const res = await TodosService.listTodos();
    expect(res).toEqual(items);
    expect(fetchMock.mock.calls[0][0]).toContain('/api/v1/todos');
  });

  it('filters archived todos by default', async () => {
    const items = [
      {
        id: '1',
        title: 'Active',
        completed: false,
        createdAt: '2020-01-01',
        updatedAt: '2020-01-01',
      },
      {
        id: '2',
        title: 'Archived',
        completed: false,
        archivedAt: '2020-02-01',
        createdAt: '2020-01-01',
        updatedAt: '2020-01-01',
      },
    ];

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ items }),
    });

    const res = await TodosService.listTodos();
    expect(res).toEqual([items[0]]);
  });

  it('throws error with message from body when response not ok', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'oops' }),
    });
    await expect(TodosService.listTodos()).rejects.toThrow('oops');
  });

  it('sends Authorization header when idToken provided', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ items: [] }),
    });

    await TodosService.listTodos('token-123');

    const call = fetchMock.mock.calls[0];
    expect(call[1].headers.Authorization).toBe('Bearer token-123');
  });

  it('creates a todo when response is ok', async () => {
    const created = {
      id: '2',
      title: 'Created',
      description: 'Desc',
      completed: false,
      createdAt: '2020-01-01',
      updatedAt: '2020-01-01',
    };

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => created,
    });

    const res = await TodosService.createTodo(
      { title: 'Created', description: 'Desc' },
      'token-abc',
    );

    expect(res).toEqual(created);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('/api/v1/todos');
    expect(options.method).toBe('POST');
    expect(options.headers.Authorization).toBe('Bearer token-abc');
    expect(options.body).toBe(
      JSON.stringify({ title: 'Created', description: 'Desc' }),
    );
  });

  it('uses joined validation messages when create response has message array', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ message: ['title should not be empty'] }),
    });

    await expect(TodosService.createTodo({ title: '' })).rejects.toThrow(
      'title should not be empty',
    );
  });

  it('updates a todo when response is ok', async () => {
    const updated = {
      id: '2',
      title: 'Updated',
      description: 'Updated desc',
      completed: true,
      createdAt: '2020-01-01',
      updatedAt: '2020-01-02',
    };

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => updated,
    });

    const res = await TodosService.updateTodo(
      '2',
      { title: 'Updated', completed: true },
      'token-update',
    );

    expect(res).toEqual(updated);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('/api/v1/todos/2');
    expect(options.method).toBe('PATCH');
    expect(options.headers.Authorization).toBe('Bearer token-update');
    expect(options.body).toBe(
      JSON.stringify({ title: 'Updated', completed: true }),
    );
  });

  it('uses fallback error when update response is not ok', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    await expect(TodosService.updateTodo('2', { completed: true })).rejects.toThrow(
      'Failed to update todo',
    );
  });
});
