import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateTodoDto,
  TodoDto,
  TodoListDto,
  UpdateTodoDto,
} from '@todos/core/http';
import { useRef, useState } from 'react';
import { getTodosQueryKey } from '@/query/query-client';
import {
  archiveTodo as archiveTodoRequest,
  createTodo as createTodoRequest,
  listTodos,
  updateTodo as updateTodoRequest,
} from '@/services/todos.service';
import { useSessionStore } from '@/store/session-store';

const PAGE_LIMIT = 20;

export function useTodos() {
  const [page, setPage] = useState(1);
  // `updating` (state) drives the UI loading indicator per todo item.
  // `updatingRef` (ref) is the synchronous concurrency guard inside updateTodo —
  // it blocks a second update for the same id while the first is in flight.
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const updatingRef = useRef<Record<string, boolean>>({});
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
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  const createMutation = useMutation<TodoDto, Error, CreateTodoDto>({
    mutationFn: (payload) => createTodoRequest(payload, currentUser?.idToken),
    onSuccess: (created) => {
      queryClient.setQueryData<TodoListDto>(
        getTodosQueryKey(currentUser?.uid, page, PAGE_LIMIT),
        (prev) =>
          prev
            ? { ...prev, items: [created, ...prev.items] }
            : { items: [created], total: 1, page, limit: PAGE_LIMIT },
      );
    },
  });

  const updateMutation = useMutation<
    TodoDto,
    Error,
    { id: string; payload: UpdateTodoDto }
  >({
    mutationFn: ({ id, payload }) =>
      updateTodoRequest(id, payload, currentUser?.idToken),
    onMutate: ({ id }) => {
      setUpdating((u) => ({ ...u, [id]: true }));
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<TodoListDto>(
        getTodosQueryKey(currentUser?.uid, page, PAGE_LIMIT),
        (prev) =>
          prev
            ? {
                ...prev,
                items: prev.items.map((t) =>
                  t.id === updated.id ? updated : t,
                ),
              }
            : prev,
      );
    },
    onSettled: (_data, _error, variables) => {
      const id = variables?.id;
      if (id) {
        delete updatingRef.current[id];
        setUpdating((u) => {
          const copy = { ...u };
          delete copy[id];
          return copy;
        });
      }
    },
  });

  const createTodo = async (payload: CreateTodoDto): Promise<boolean> => {
    try {
      await createMutation.mutateAsync(payload);
      return true;
    } catch {
      return false;
    }
  };

  const updateTodo = async (
    id: string,
    payload: UpdateTodoDto,
  ): Promise<boolean> => {
    // In JavaScript's single-threaded model, the check-and-set below is atomic
    // within one synchronous turn, so concurrent calls issued by the same event
    // loop tick are safely blocked. Calls from separate user interactions
    // (e.g., two rapid taps) are sequential and the ref is set before the first
    // await yields control.
    if (updatingRef.current[id]) return false;
    updatingRef.current[id] = true;
    try {
      await updateMutation.mutateAsync({ id, payload });
      return true;
    } catch {
      return false;
    }
  };

  const clearUpdateError = () => updateMutation.reset();

  const archiveMutation = useMutation<TodoDto, Error, string>({
    mutationFn: (id) => archiveTodoRequest(id, currentUser?.idToken),
    onSuccess: (_archived, id) => {
      queryClient.setQueryData<TodoListDto>(
        getTodosQueryKey(currentUser?.uid, page, PAGE_LIMIT),
        (prev) =>
          prev
            ? { ...prev, items: prev.items.filter((t) => t.id !== id), total: Math.max(0, prev.total - 1) }
            : prev,
      );
    },
  });

  const archiveTodo = async (id: string): Promise<boolean> => {
    try {
      await archiveMutation.mutateAsync(id);
      return true;
    } catch {
      return false;
    }
  };

  return {
    todos,
    page,
    total,
    totalPages,
    canGoToPreviousPage: page > 1,
    canGoToNextPage: page < totalPages,
    nextPage: () => {
      setPage((currentPage) => Math.min(totalPages, currentPage + 1));
    },
    previousPage: () => {
      setPage((currentPage) => Math.max(1, currentPage - 1));
    },
    isLoading,
    isCreating: createMutation.isPending,
    updating,
    error:
      error instanceof Error ? error.message : error ? String(error) : null,
    createError: createMutation.error?.message ?? null,
    updateError: updateMutation.error?.message ?? null,
    clearUpdateError,
    refresh: () => {
      void refetch();
    },
    createTodo,
    updateTodo,
    archiveTodo,
  } as const;
}
