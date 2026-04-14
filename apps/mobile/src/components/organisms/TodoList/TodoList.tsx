import type { TodoDto } from '@todos/core/http';
import { FlatList, RefreshControl, View } from 'react-native';
import { AppText } from '@/components/atoms';

export interface TodoListProps {
  todos: TodoDto[];
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export function TodoList({
  todos,
  isLoading,
  error,
  onRefresh,
}: TodoListProps) {
  if (isLoading) {
    return (
      <View>
        <AppText variant="body">Loading todos…</AppText>
      </View>
    );
  }

  if (error) {
    return (
      <View>
        <AppText variant="body" color="danger">
          {error}
        </AppText>
      </View>
    );
  }

  if (!todos || todos.length === 0) {
    return (
      <View>
        <AppText variant="body" className="text-text-secondary">
          No todos yet
        </AppText>
      </View>
    );
  }

  return (
    <FlatList
      data={todos}
      initialNumToRender={10}
      keyExtractor={(item) => item.id}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isLoading || false}
            onRefresh={onRefresh}
          />
        ) : undefined
      }
      renderItem={({ item }) => (
        <View className="py-2 border-b border-border">
          <AppText
            variant="body"
            weight={item.completed ? 'regular' : 'medium'}
          >
            {item.title}
          </AppText>
          {item.description ? (
            <AppText variant="caption" className="text-text-secondary mt-1">
              {item.description}
            </AppText>
          ) : null}
        </View>
      )}
    />
  );
}
