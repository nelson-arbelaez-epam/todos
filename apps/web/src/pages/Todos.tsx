import type { TodoDto } from '@todos/core/http';
import { useEffect, useState } from 'react';
import CreateTodoForm, {
  type CreateTodoFormValues,
} from '../components/organisms/CreateTodoForm/CreateTodoForm';
import TodoList from '../components/organisms/TodoList/TodoList';
import { createTodo, listTodos } from '../services/todos.service';
import { useSessionStore } from '../store/session-store';

const Todos = () => {
  const currentUser = useSessionStore((s) => s.currentUser);
  const [todos, setTodos] = useState<TodoDto[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError(null);
    listTodos(currentUser?.idToken)
      .then((items) => {
        if (mounted) setTodos(items);
      })
      .catch((err) => {
        if (mounted)
          setError(err instanceof Error ? err.message : 'Failed to load todos');
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [currentUser?.idToken]);

  const handleCreateTodo = async (values: CreateTodoFormValues) => {
    setIsCreating(true);
    setCreateError(null);
    try {
      const created = await createTodo(values, currentUser?.idToken);
      setTodos((previous) => [created, ...(previous ?? [])]);
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : 'Failed to create todo',
      );
    } finally {
      setIsCreating(false);
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
      {error && <div role="alert">Error: {error}</div>}
      {!isLoading && !error && todos !== null && <TodoList todos={todos} />}
    </div>
  );
};

export default Todos;
