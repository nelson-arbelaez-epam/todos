import type { CreateTodoDto, TodoDto, UpdateTodoDto } from '@todos/core/http';
import { useCallback, useEffect, useState } from 'react';
import {
  createTodo as createTodoRequest,
  listTodos,
  updateTodo as updateTodoRequest,
} from '@/services/todos.service';
import { useSessionStore } from '@/store/session-store';

export function useTodos() {
  const [todos, setTodos] = useState<TodoDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  // Track last updated todo for error scoping
  const [lastUpdatedTodoId, setLastUpdatedTodoId] = useState<string | null>(
    null,
  );
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

  const updateTodo = useCallback(
    async (id: string, payload: UpdateTodoDto): Promise<boolean> => {
      if (updating[id]) return false;
      setUpdating((u) => ({ ...u, [id]: true }));
      setUpdateError(null);
      setLastUpdatedTodoId(id);
      try {
        const updated = await updateTodoRequest(
          id,
          payload,
          currentUser?.idToken,
        );
        setTodos((prev) =>
          prev.map((todo) => (todo.id === id ? updated : todo)),
        );
        return true;
      } catch (err: unknown) {
        setUpdateError(err instanceof Error ? err.message : String(err));
        return false;
      } finally {
        setUpdating((u) => {
          const copy = { ...u };
          delete copy[id];
          return copy;
        });
      }
    },
    [currentUser?.idToken, updating],
  );

  return {
    todos,
    isLoading,
    isCreating,
    updating,
    error,
    createError,
    updateError,
    lastUpdatedTodoId,
    refresh: fetchTodos,
    createTodo,
    updateTodo,
  } as const;
}
