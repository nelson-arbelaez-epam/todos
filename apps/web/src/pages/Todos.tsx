import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
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
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setPage((currentPage) => Math.max(1, currentPage - 1))
            }
            disabled={!canGoToPreviousPage}
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((currentPage) => currentPage + 1)}
            disabled={!canGoToNextPage}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Todos;
