import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as TodosService from './todos.service';

describe('todos.service', () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    fetchMock.mockReset();
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

  it('returns empty array when body has no items', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    const res = await TodosService.listTodos();
    expect(res).toEqual([]);
  });

  it('throws error with message from body when response not ok', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'oops' }),
    });
    await expect(TodosService.listTodos()).rejects.toThrow('oops');
  });

  it('throws generic error when response not ok and no message', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });
    await expect(TodosService.listTodos()).rejects.toThrow(
      'Failed to fetch todos',
    );
  });

  it('uses first message when API returns an array of messages', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ message: ['title should not be empty'] }),
    });
    await expect(TodosService.listTodos()).rejects.toThrow(
      'title should not be empty',
    );
  });

  it('sends Authorization header when idToken provided', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ items: [] }),
    });

    await TodosService.listTodos('token-123');

    const call = fetchMock.mock.calls[0];
    console.log(call[1].headers);
    expect(call[1].headers.Authorization).toBe('Bearer token-123');
  });

  it('creates todo when response is ok', async () => {
    const todo = {
      id: 'todo-1',
      title: 'Buy milk',
      completed: false,
      createdAt: '2020-01-01',
      updatedAt: '2020-01-01',
    };
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => todo,
    });

    const result = await TodosService.createTodo({ title: 'Buy milk' });
    expect(result).toEqual(todo);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/todos'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ title: 'Buy milk' }),
      }),
    );
  });

  it('throws create-specific fallback message on failed create', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    await expect(TodosService.createTodo({ title: 'Buy milk' })).rejects.toThrow(
      'Failed to create todo',
    );
  });
});
