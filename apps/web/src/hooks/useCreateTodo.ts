import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { TodoDto, TodoListDto } from '@todos/core/http';
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
  const queryClient = useQueryClient();

  const mutation = useMutation<TodoDto, Error, CreateTodoFormValues>({
    mutationFn: (values) => createTodo(values, idToken),
    onSuccess: (created) => {
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
    },
  });

  const handleCreateTodo = async (
    values: CreateTodoFormValues,
  ): Promise<void> => {
    try {
      await mutation.mutateAsync(values);
    } catch {
      // Error is captured in mutation.error; no rethrow needed
    }
  };

  return {
    createError: mutation.error?.message ?? null,
    isCreating: mutation.isPending,
    handleCreateTodo,
  };
}
