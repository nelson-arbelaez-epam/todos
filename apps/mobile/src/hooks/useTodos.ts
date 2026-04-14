import type { TodoDto } from '@todos/core/http';
import { useCallback, useEffect, useState } from 'react';
import { useSessionStore } from '../store/session-store';

export function useTodos() {
  const [todos, setTodos] = useState<TodoDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentUser = useSessionStore((s) => s.currentUser);

  const fetchTodos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiBaseUrl = process.env.EXPO_PUBLIC_TODOS_API_URL;
      if (!apiBaseUrl) throw new Error('EXPO_PUBLIC_TODOS_API_URL is not set');

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (currentUser?.idToken)
        headers.Authorization = `Bearer ${currentUser.idToken}`;

      const res = await fetch(`${apiBaseUrl}/api/v1/todos`, { headers });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        const message =
          typeof json.message === 'string'
            ? json.message
            : 'Failed to fetch todos';
        throw new Error(message);
      }

      const body = (await res.json()) as { items?: TodoDto[] };
      const items = (body.items ?? []).filter((t) => !t.archivedAt);
      setTodos(items);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setTodos([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.idToken]);

  useEffect(() => {
    void fetchTodos();
  }, [fetchTodos]);

  return { todos, isLoading, error, refresh: fetchTodos } as const;
}
