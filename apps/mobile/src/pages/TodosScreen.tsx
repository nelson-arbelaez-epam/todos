import { CreateTodoForm, TodoList } from '@/components/organisms';
import { ScreenLayout } from '@/components/templates';
import { useTodos } from '@/hooks/useTodos';

export function TodosScreen() {
  const { todos, isLoading, isCreating, error, createError, refresh, createTodo } =
    useTodos();

  return (
    <ScreenLayout scrollable>
      <CreateTodoForm
        onSubmit={createTodo}
        isLoading={isCreating}
        errorMessage={createError}
      />
      <TodoList
        todos={todos}
        isLoading={isLoading}
        error={error}
        onRefresh={refresh}
      />
    </ScreenLayout>
  );
}

export default TodosScreen;
