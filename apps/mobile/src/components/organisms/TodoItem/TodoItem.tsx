import type { TodoDto } from '@todos/core/http';
import { View } from 'react-native';
import { AppButton, AppText } from '@/components/atoms';

export interface TodoItemProps {
  todo: TodoDto;
  isUpdating: boolean;
  onToggleComplete?: (todo: TodoDto) => Promise<void>;
  onStartEdit?: (todo: TodoDto) => void;
}

export function TodoItem({
  todo,
  isUpdating,
  onToggleComplete,
  onStartEdit,
}: TodoItemProps) {
  return (
    <View className="py-2 border-b border-border">
      <View>
        <AppText
          variant="body"
          weight={todo.completed ? 'regular' : 'medium'}
          className={todo.completed ? 'text-text-secondary' : undefined}
        >
          {todo.title}
        </AppText>
        {todo.description ? (
          <AppText variant="caption" className="text-text-secondary mt-1">
            {todo.description}
          </AppText>
        ) : null}
        <View className="mt-2 flex-row gap-2">
          <AppButton
            title={todo.completed ? 'Mark active' : 'Complete'}
            testID={`toggle-complete-${todo.id}`}
            onPress={() => {
              if (onToggleComplete) {
                void onToggleComplete(todo);
              }
            }}
            variant={todo.completed ? 'secondary' : 'primary'}
            size="sm"
            loading={isUpdating}
            disabled={isUpdating}
          />
          <AppButton
            title="Edit"
            testID={`edit-todo-${todo.id}`}
            onPress={() => {
              onStartEdit?.(todo);
            }}
            variant="ghost"
            size="sm"
            disabled={isUpdating}
          />
        </View>
      </View>
    </View>
  );
}
