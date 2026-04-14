import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateTodoDto, TodoDto, UpdateTodoDto } from '@todos/core/http';
import { useCallback, useRef, useState } from 'react';
import { getTodosQueryKey } from '@/query/query-client';
import {
  createTodo as createTodoRequest,
  listTodos,
  updateTodo as updateTodoRequest,
} from '@/services/todos.service';
import { useSessionStore } from '@/store/session-store';

export function useTodos() {
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const updatingRef = useRef<Record<string, boolean>>({});
  const currentUser = useSessionStore((s) => s.currentUser);
  const queryClient = useQueryClient();
  const {
    data: todos = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: getTodosQueryKey(currentUser?.idToken),
    queryFn: () => listTodos(currentUser?.idToken),
  });

  const createTodo = useCallback(
    async (payload: CreateTodoDto): Promise<boolean> => {
      setIsCreating(true);
      setCreateError(null);
      try {
        const created = await createTodoRequest(payload, currentUser?.idToken);
        queryClient.setQueryData<TodoDto[]>(
          getTodosQueryKey(currentUser?.idToken),
          (prev) => (prev ? [created, ...prev] : [created]),
        );
        return true;
      } catch (err: unknown) {
        setCreateError(err instanceof Error ? err.message : String(err));
        return false;
      } finally {
        setIsCreating(false);
      }
    },
    [currentUser?.idToken, queryClient],
  );

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
        queryClient.setQueryData<TodoDto[]>(
          getTodosQueryKey(currentUser?.idToken),
          (prev) =>
            prev
              ? prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
              : [updated],
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
    [currentUser?.idToken, queryClient],
  );

  return {
    todos,
    isLoading,
    isCreating,
    updating,
    updateError,
    error:
      error instanceof Error ? error.message : error ? String(error) : null,
    createError,
    refresh: () => {
      void refetch();
    },
    createTodo,
    updateTodo,
  } as const;
}
