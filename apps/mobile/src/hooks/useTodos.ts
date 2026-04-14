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
  const [isUpdatingTodoId, setIsUpdatingTodoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const isUpdatingRef = useRef(false);
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
      if (isUpdatingRef.current) {
        return false;
      }

      isUpdatingRef.current = true;
      setIsUpdatingTodoId(id);
      setUpdateError(null);
      try {
        const updated = await updateTodoRequest(id, payload, currentUser?.idToken);
        setTodos((prev) => prev.map((todo) => (todo.id === id ? updated : todo)));
        return true;
      } catch (err: unknown) {
        setUpdateError(err instanceof Error ? err.message : String(err));
        return false;
      } finally {
        isUpdatingRef.current = false;
        setIsUpdatingTodoId(null);
      }
    },
    [currentUser?.idToken],
  );

  return {
    todos,
    isLoading,
    isCreating,
    isUpdatingTodoId,
    error,
    createError,
    updateError,
    refresh: fetchTodos,
    createTodo,
    updateTodo,
  } as const;
}
