import type { CreateTodoDto, TodoDto, UpdateTodoDto } from '@todos/core/http';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  const updatingRef = useRef<Record<string, boolean>>({});
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

  const clearUpdateError = useCallback(() => {
    setUpdateError(null);
  }, []);

  const updateTodo = useCallback(
    async (id: string, payload: UpdateTodoDto): Promise<boolean> => {
      if (updatingRef.current[id]) return false;
      updatingRef.current[id] = true;
      setUpdating((u) => ({ ...u, [id]: true }));
      setUpdateError(null);
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
        delete updatingRef.current[id];
      }
    },
    [currentUser?.idToken],
  );

  return {
    todos,
    isLoading,
    isCreating,
    updating,
    error,
    createError,
    updateError,
    clearUpdateError,
    refresh: fetchTodos,
    createTodo,
    updateTodo,
  } as const;
}
