import type { TodoDto } from '@todos/core/http';
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useState,
} from 'react';
import { createTodo } from '../services/todos.service';
import type { CreateTodoFormValues } from '../types/todo-form';

export function useCreateTodo(
  idToken: string | undefined,
  setTodos: Dispatch<SetStateAction<TodoDto[] | null>>,
) {
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreateTodo = useCallback(
    async (values: CreateTodoFormValues): Promise<void> => {
      setIsCreating(true);
      setCreateError(null);
      try {
        const created = await createTodo(values, idToken);
        setTodos((previous) => [created, ...(previous ?? [])]);
      } catch (err) {
        setCreateError(
          err instanceof Error ? err.message : 'Failed to create todo',
        );
      } finally {
        setIsCreating(false);
      }
    },
    [idToken, setTodos],
  );

  return { createError, isCreating, handleCreateTodo };
}
