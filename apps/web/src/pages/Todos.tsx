import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import type { TodoDto, UpdateTodoDto } from '@todos/core/http';
import PaginationControls from '../components/molecules/PaginationControls/PaginationControls';
import CreateTodoForm from '../components/organisms/CreateTodoForm/CreateTodoForm';
import TodoList from '../components/organisms/TodoList/TodoList';
import { useCreateTodo } from '../hooks/useCreateTodo';
import { useUpdateTodo } from '../hooks/useUpdateTodo';
import { getTodosQueryKey } from '../query/query-client';
import { listTodos } from '../services/todos.service';
import { useSessionStore } from '../store/session-store';

const PAGE_LIMIT = 20;

const Todos = () => {
  const currentUser = useSessionStore((s) => s.currentUser);
  const [page, setPage] = useState(1);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);

  const { createError, isCreating, handleCreateTodo } = useCreateTodo({
    idToken: currentUser?.idToken,
    ownerId: currentUser?.uid,
    page,
    limit: PAGE_LIMIT,
  });

  const { updating, updateError, handleUpdateTodo, clearUpdateError } =
    useUpdateTodo({
      idToken: currentUser?.idToken,
      ownerId: currentUser?.uid,
      page,
      limit: PAGE_LIMIT,
    });

  const { data, isLoading, error } = useQuery({
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
  const canGoToPreviousPage = page > 1;
  const canGoToNextPage = page < totalPages;

  const handleToggleComplete = (todo: TodoDto) => {
    void handleUpdateTodo(todo.id, { completed: !todo.completed });
  };

  const handleStartEdit = (todo: TodoDto) => {
    clearUpdateError();
    setEditingTodoId(todo.id);
  };

  const handleCancelEdit = () => {
    setEditingTodoId(null);
  };

  const handleSubmitEdit = async (
    id: string,
    payload: UpdateTodoDto,
  ): Promise<void> => {
    const success = await handleUpdateTodo(id, payload);
    if (success) {
      setEditingTodoId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Todos</h1>
      <CreateTodoForm
        isLoading={isCreating}
        error={createError}
        onSubmit={handleCreateTodo}
      />
      {isLoading && <div>Loading...</div>}
      {error && (
        <div role="alert">
          Error:{' '}
          {error instanceof Error ? error.message : 'Failed to load todos'}
        </div>
      )}
      {updateError && !editingTodoId && (
        <div role="alert">{updateError}</div>
      )}
      {!isLoading && !error && todos && (
        <TodoList
          todos={todos}
          updating={updating}
          updateError={updateError}
          editingTodoId={editingTodoId}
          onToggleComplete={handleToggleComplete}
          onStartEdit={handleStartEdit}
          onCancelEdit={handleCancelEdit}
          onSubmitEdit={handleSubmitEdit}
        />
      )}
      {!isLoading && !error && (
        <PaginationControls
          page={page}
          totalPages={totalPages}
          canGoToPreviousPage={canGoToPreviousPage}
          canGoToNextPage={canGoToNextPage}
          onPreviousPage={() =>
            setPage((currentPage) => Math.max(1, currentPage - 1))
          }
          onNextPage={() => setPage((currentPage) => currentPage + 1)}
        />
      )}
    </div>
  );
};

export default Todos;
