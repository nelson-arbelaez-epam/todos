import { QueryClient } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { listTodos } from '@/services/todos.service';
import { shouldRetryQuery } from './query-client';

describe('query-client policy (mobile)', () => {
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

  it('does not retry when response status is 429', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ message: 'rate limited' }),
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: shouldRetryQuery,
          retryDelay: () => 0,
        },
      },
    });

    await expect(
      queryClient.fetchQuery({
        queryKey: ['todos', 'rate-limit'],
        queryFn: () => listTodos(),
      }),
    ).rejects.toThrow('rate limited');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('retries with capped attempts for non-429 failures', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: 'server error' }),
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: shouldRetryQuery,
          retryDelay: () => 0,
        },
      },
    });

    await expect(
      queryClient.fetchQuery({
        queryKey: ['todos', 'server-error'],
        queryFn: () => listTodos(),
      }),
    ).rejects.toThrow('server error');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
