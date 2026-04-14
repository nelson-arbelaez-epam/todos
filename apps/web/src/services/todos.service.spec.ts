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
});
