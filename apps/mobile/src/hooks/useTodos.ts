import type { CreateTodoDto, TodoDto } from '@todos/core/http';
import { useCallback, useEffect, useState } from 'react';
import {
  createTodo as createTodoRequest,
  listTodos,
} from '@/services/todos.service';
import { useSessionStore } from '@/store/session-store';

export function useTodos() {
  const [todos, setTodos] = useState<TodoDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const currentUser = useSessionStore((s) => s.currentUser);

  const fetchTodos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await listTodos(currentUser?.idToken);
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

  const createTodo = useCallback(
    async (payload: CreateTodoDto): Promise<boolean> => {
      setIsCreating(true);
      setCreateError(null);
      try {
        const created = await createTodoRequest(payload, currentUser?.idToken);
        setTodos((prev) => [created, ...prev]);
        return true;
      } catch (err: unknown) {
        setCreateError(err instanceof Error ? err.message : String(err));
        return false;
      } finally {
        setIsCreating(false);
      }
    },
    [currentUser?.idToken],
  );

  return {
    todos,
    isLoading,
    isCreating,
    error,
    createError,
    refresh: fetchTodos,
    createTodo,
  } as const;
}
