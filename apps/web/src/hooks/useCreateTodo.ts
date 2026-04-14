import { useQueryClient } from '@tanstack/react-query';
import type { TodoListDto } from '@todos/core/http';
import { useCallback, useState } from 'react';
import { getTodosQueryKey } from '../query/query-client';
import { createTodo } from '../services/todos.service';
import type { CreateTodoFormValues } from '../types/todo-form';

interface UseCreateTodoOptions {
  idToken?: string;
  ownerId?: string;
  page: number;
  limit: number;
}

export function useCreateTodo({
  idToken,
  ownerId,
  page,
  limit,
}: UseCreateTodoOptions) {
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleCreateTodo = useCallback(
    async (values: CreateTodoFormValues): Promise<void> => {
      setIsCreating(true);
      setCreateError(null);
      try {
        const created = await createTodo(values, idToken);
        queryClient.setQueryData<TodoListDto>(
          getTodosQueryKey(ownerId, page, limit),
          (previous) =>
            previous
              ? { ...previous, items: [created, ...previous.items] }
              : {
                  items: [created],
                  total: 1,
                  page,
                  limit,
                },
        );
      } catch (err) {
        setCreateError(
          err instanceof Error ? err.message : 'Failed to create todo',
        );
      } finally {
        setIsCreating(false);
      }
    },
    [idToken, limit, ownerId, page, queryClient],
  );

  return { createError, isCreating, handleCreateTodo };
}
