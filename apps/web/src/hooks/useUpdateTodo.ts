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
  // The guard is set in `onMutate` so it is enforced even if the mutation
  // is triggered directly rather than through `handleUpdateTodo`.
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [updateErrors, setUpdateErrors] = useState<
    Record<string, string | null>
  >({});
  const updatingRef = useRef<Record<string, boolean>>({});
  const queryClient = useQueryClient();

  const mutation = useMutation<
    TodoDto,
    Error,
    { id: string; payload: UpdateTodoDto }
  >({
    mutationFn: ({ id, payload }) => updateTodo(id, payload, idToken),
    onMutate: ({ id }) => {
      // Set the guard here so any caller path (including mutation.mutate) is protected.
      updatingRef.current[id] = true;
      setUpdating((u) => ({ ...u, [id]: true }));
    },
    onSuccess: (updated) => {
      setUpdateErrors((e) => {
        const copy = { ...e };
        delete copy[updated.id];
        return copy;
      });
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
    onError: (error, variables) => {
      const id = variables?.id;
      if (id) {
        setUpdateErrors((e) => ({ ...e, [id]: error.message }));
      }
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
    // Set the guard synchronously here for atomicity (single-threaded check-and-set),
    // AND it is also set in `onMutate` to cover any call paths that bypass this function.
    if (updatingRef.current[id]) return false;
    updatingRef.current[id] = true;
    try {
      await mutation.mutateAsync({ id, payload });
      return true;
    } catch {
      // `mutateAsync` re-throws on failure; the error is captured per-id in
      // `updateErrors` and exposed via the `updateErrors` return value.
      return false;
    }
  };

  const clearUpdateError = (id?: string) => {
    if (id) {
      setUpdateErrors((e) => {
        const copy = { ...e };
        delete copy[id];
        return copy;
      });
    } else {
      setUpdateErrors({});
    }
  };

  return {
    updating,
    updateErrors,
    isUpdating: mutation.isPending,
    handleUpdateTodo,
    clearUpdateError,
  };
}
