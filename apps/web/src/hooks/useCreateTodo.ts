import { useQueryClient } from '@tanstack/react-query';
import type { TodoDto } from '@todos/core/http';
import { useCallback, useState } from 'react';
import { getTodosQueryKey } from '../query/query-client';
import { createTodo } from '../services/todos.service';
import type { CreateTodoFormValues } from '../types/todo-form';

export function useCreateTodo(idToken: string | undefined) {
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleCreateTodo = useCallback(
    async (values: CreateTodoFormValues): Promise<void> => {
      setIsCreating(true);
      setCreateError(null);
      try {
        const created = await createTodo(values, idToken);
        queryClient.setQueryData<TodoDto[]>(
          getTodosQueryKey(idToken),
          (previous) => (previous ? [created, ...previous] : [created]),
        );
      } catch (err) {
        setCreateError(
          err instanceof Error ? err.message : 'Failed to create todo',
        );
      } finally {
        setIsCreating(false);
      }
    },
    [idToken, queryClient],
  );

  return { createError, isCreating, handleCreateTodo };
}
