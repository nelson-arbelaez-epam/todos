import { useQuery } from '@tanstack/react-query';
import CreateTodoForm from '../components/organisms/CreateTodoForm/CreateTodoForm';
import TodoList from '../components/organisms/TodoList/TodoList';
import { useCreateTodo } from '../hooks/useCreateTodo';
import { getTodosQueryKey } from '../query/query-client';
import { listTodos } from '../services/todos.service';
import { useSessionStore } from '../store/session-store';

const Todos = () => {
  const currentUser = useSessionStore((s) => s.currentUser);
  const { createError, isCreating, handleCreateTodo } = useCreateTodo(
    currentUser?.idToken,
  );
  const {
    data: todos,
    isLoading,
    error,
  } = useQuery({
    queryKey: getTodosQueryKey(currentUser?.idToken),
    queryFn: () => listTodos(currentUser?.idToken),
  });

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
    </div>
  );
};

export default Todos;
