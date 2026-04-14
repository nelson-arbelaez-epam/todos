import { useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateTodoDto,
  TodoListDto,
  UpdateTodoDto,
} from '@todos/core/http';
import { useCallback, useRef, useState } from 'react';
import { getTodosQueryKey } from '@/query/query-client';
import {
  createTodo as createTodoRequest,
  listTodos,
  updateTodo as updateTodoRequest,
} from '@/services/todos.service';
import { useSessionStore } from '@/store/session-store';

const PAGE_LIMIT = 20;

export function useTodos() {
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const updatingRef = useRef<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const currentUser = useSessionStore((s) => s.currentUser);
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: getTodosQueryKey(currentUser?.uid, page, PAGE_LIMIT),
    queryFn: () =>
      listTodos(currentUser?.idToken, {
        page,
        limit: PAGE_LIMIT,
      }),
  });
  const todos = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_LIMIT));

  const createTodo = useCallback(
    async (payload: CreateTodoDto): Promise<boolean> => {
      setIsCreating(true);
      setCreateError(null);
      try {
        const created = await createTodoRequest(payload, currentUser?.idToken);
        queryClient.setQueryData<TodoListDto>(
          getTodosQueryKey(currentUser?.uid, page, PAGE_LIMIT),
          (prev) =>
            prev
              ? { ...prev, items: [created, ...prev.items] }
              : {
                  items: [created],
                  total: 1,
                  page,
                  limit: PAGE_LIMIT,
                },
        );
        return true;
      } catch (err: unknown) {
        setCreateError(err instanceof Error ? err.message : String(err));
        return false;
      } finally {
        setIsCreating(false);
      }
    },
    [currentUser?.idToken, currentUser?.uid, page, queryClient],
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
        queryClient.setQueryData<TodoListDto>(
          getTodosQueryKey(currentUser?.uid, page, PAGE_LIMIT),
          (prev) =>
            prev
              ? {
                  ...prev,
                  items: prev.items.map((t) =>
                    t.id === id ? { ...t, ...updated } : t,
                  ),
                }
              : { items: [updated], total: 1, page, limit: PAGE_LIMIT },
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
    [currentUser?.idToken, currentUser?.uid, page, queryClient],
  );

  return {
    todos,
    page,
    totalPages,
    canGoToPreviousPage: page > 1,
    canGoToNextPage: page < totalPages,
    nextPage: () => {
      if (page < totalPages) {
        setPage((currentPage) => currentPage + 1);
      }
    },
    previousPage: () => {
      setPage((currentPage) => Math.max(1, currentPage - 1));
    },
    isLoading,
    isCreating,
    updating,
    updateError,
    clearUpdateError: () => setUpdateError(null),
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
