import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { TodoDto, TodoListDto } from '@todos/core/http';
import { useRef, useState } from 'react';
import { getTodosQueryKey } from '../query/query-client';
import { archiveTodo } from '../services/todos.service';

interface UseArchiveTodoOptions {
  idToken?: string;
  ownerId?: string;
  page: number;
  limit: number;
}

export function useArchiveTodo({
  idToken,
  ownerId,
  page,
  limit,
}: UseArchiveTodoOptions) {
  const [archiving, setArchiving] = useState<Record<string, boolean>>({});
  const [archiveErrors, setArchiveErrors] = useState<
    Record<string, string | null>
  >({});
  const archivingRef = useRef<Record<string, boolean>>({});
  const queryClient = useQueryClient();

  const mutation = useMutation<TodoDto, Error, { id: string }>({
    mutationFn: ({ id }) => archiveTodo(id, idToken),
    onMutate: ({ id }) => {
      // Canonical location for the concurrency guard — set synchronously before
      // the async work starts so any call path (including direct mutation.mutate)
      // is protected.
      archivingRef.current[id] = true;
      setArchiving((a) => ({ ...a, [id]: true }));
    },
    onSuccess: (archived) => {
      setArchiveErrors((e) => {
        const copy = { ...e };
        delete copy[archived.id];
        return copy;
      });
      // Update the current page immediately for instant UI feedback.
      queryClient.setQueryData<TodoListDto>(
        getTodosQueryKey(ownerId, page, limit),
        (previous) =>
          previous
            ? {
                ...previous,
                items: previous.items.filter((t) => t.id !== archived.id),
                total: Math.max(0, previous.total - 1),
              }
            : previous,
      );
      // Invalidate this page and all later pages so pagination totals stay
      // consistent across the cache after the item count changes.
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey as unknown[];
          return (
            key[0] === 'todos' &&
            key[1] === (ownerId ?? null) &&
            typeof key[2] === 'number' &&
            (key[2] as number) >= page
          );
        },
      });
    },
    onError: (error, variables) => {
      const id = variables?.id;
      if (id) {
        setArchiveErrors((e) => ({ ...e, [id]: error.message }));
      }
    },
    onSettled: (_data, _error, variables) => {
      const id = variables?.id;
      if (id) {
        delete archivingRef.current[id];
        setArchiving((a) => {
          const copy = { ...a };
          delete copy[id];
          return copy;
        });
      }
    },
  });

  const handleArchiveTodo = async (id: string): Promise<boolean> => {
    // Guard checked here; the ref is set in onMutate which fires synchronously
    // inside mutateAsync before any async work begins.
    if (archivingRef.current[id]) return false;
    try {
      await mutation.mutateAsync({ id });
      return true;
    } catch {
      return false;
    }
  };

  return {
    archiving,
    archiveErrors,
    handleArchiveTodo,
  };
}
