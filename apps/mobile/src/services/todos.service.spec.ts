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
});
