import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import PaginationControls from '../components/molecules/PaginationControls/PaginationControls';
import CreateTodoForm from '../components/organisms/CreateTodoForm/CreateTodoForm';
import TodoList from '../components/organisms/TodoList/TodoList';
import { useCreateTodo } from '../hooks/useCreateTodo';
import { getTodosQueryKey } from '../query/query-client';
import { listTodos } from '../services/todos.service';
import { useSessionStore } from '../store/session-store';

const PAGE_LIMIT = 20;

const Todos = () => {
  const currentUser = useSessionStore((s) => s.currentUser);
  const [page, setPage] = useState(1);
  const { createError, isCreating, handleCreateTodo } = useCreateTodo({
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
      {!isLoading && !error && todos && <TodoList todos={todos} />}
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
