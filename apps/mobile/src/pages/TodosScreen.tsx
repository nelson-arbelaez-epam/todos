import { TodoList } from '@/components/organisms';
import { ScreenLayout } from '@/components/templates';
import { useTodos } from '@/hooks/useTodos';

export function TodosScreen() {
  const { todos, isLoading, error, refresh } = useTodos();

  return (
    <ScreenLayout>
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
