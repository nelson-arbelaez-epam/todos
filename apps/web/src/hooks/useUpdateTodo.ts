import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { TodoDto, TodoListDto, UpdateTodoDto } from '@todos/core/http';
import { useRef, useState } from 'react';
import { getTodosQueryKey } from '../query/query-client';
import { updateTodo } from '../services/todos.service';

interface UseUpdateTodoOptions {
  idToken?: string;
  ownerId?: string;
  page: number;
  limit: number;
}

export function useUpdateTodo({
  idToken,
  ownerId,
  page,
  limit,
}: UseUpdateTodoOptions) {
  // `updating` drives per-item loading indicators in the UI.
  // `updatingRef` is the synchronous concurrency guard — blocks a second
  // update for the same id while the first is still in flight.
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const updatingRef = useRef<Record<string, boolean>>({});
  const queryClient = useQueryClient();

  const mutation = useMutation<
    TodoDto,
    Error,
    { id: string; payload: UpdateTodoDto }
  >({
    mutationFn: ({ id, payload }) => updateTodo(id, payload, idToken),
    onMutate: ({ id }) => {
      setUpdating((u) => ({ ...u, [id]: true }));
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<TodoListDto>(
        getTodosQueryKey(ownerId, page, limit),
        (previous) =>
          previous
            ? {
                ...previous,
                items: previous.items.map((t) =>
                  t.id === updated.id ? updated : t,
                ),
              }
            : previous,
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

  const handleUpdateTodo = async (
    id: string,
    payload: UpdateTodoDto,
  ): Promise<boolean> => {
    // In JavaScript's single-threaded model, the check-and-set below is atomic
    // within one synchronous turn, preventing concurrent updates for the same id.
    if (updatingRef.current[id]) return false;
    updatingRef.current[id] = true;
    try {
      await mutation.mutateAsync({ id, payload });
      return true;
    } catch {
      // `mutateAsync` re-throws on failure; the error is already captured in
      // `mutation.error` and exposed via the `updateError` return value.
      return false;
    }
  };

  const clearUpdateError = () => mutation.reset();

  return {
    updating,
    updateError: mutation.error?.message ?? null,
    isUpdating: mutation.isPending,
    handleUpdateTodo,
    clearUpdateError,
  };
}
