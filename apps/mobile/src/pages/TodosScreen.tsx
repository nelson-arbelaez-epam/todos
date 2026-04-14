import { CreateTodoForm, TodoList } from '@/components/organisms';
import { ScreenLayout } from '@/components/templates';
import { useTodos } from '@/hooks/useTodos';

export function TodosScreen() {
  const {
    todos,
    isLoading,
    isCreating,
    isUpdatingTodoId,
    error,
    createError,
    updateError,
    refresh,
    createTodo,
    updateTodo,
  } = useTodos();

  return (
    <ScreenLayout>
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
        isUpdatingTodoId={isUpdatingTodoId}
        updateError={updateError}
        onUpdateTodo={updateTodo}
        onToggleComplete={(todo) =>
          updateTodo(todo.id, { completed: !todo.completed })
        }
      />
    </ScreenLayout>
  );
}

export default TodosScreen;
