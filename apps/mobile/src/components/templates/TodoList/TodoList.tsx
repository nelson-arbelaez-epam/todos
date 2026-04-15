import type { TodoDto, UpdateTodoDto } from '@todos/core/http';
import { FlatList, View } from 'react-native';
import { AppText } from '@/components/atoms';
import { TodoInlineForm } from '@/components/organisms/TodoInlineForm/TodoInlineForm';
import { TodoItem } from '@/components/organisms/TodoItem/TodoItem';

export interface TodoListProps {
  todos: TodoDto[];
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onToggleComplete?: (todo: TodoDto) => Promise<void>;
  updating?: Record<string, boolean>;
  updateError?: string | null;
  editingTodoId?: string | null;
  editTitle?: string;
  editDescription?: string;
  editError?: string | null;
  onStartEdit?: (todo: TodoDto) => void;
  onCancelEdit?: () => void;
  onChangeEditTitle?: (value: string) => void;
  onChangeEditDescription?: (value: string) => void;
  onSubmitEdit?: (id: string, payload: UpdateTodoDto) => Promise<void>;
}

export function TodoList({
  todos,
  isLoading,
  error,
  onRefresh,
  onToggleComplete,
  updating = {},
  updateError,
  editingTodoId,
  editTitle,
  editDescription,
  editError,
  onStartEdit,
  onCancelEdit,
  onChangeEditTitle,
  onChangeEditDescription,
  onSubmitEdit,
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
    <View>
      {updateError ? (
        <AppText variant="caption" color="danger" className="mb-2">
          {updateError}
        </AppText>
      ) : null}
      <FlatList
        data={todos}
        initialNumToRender={10}
        keyExtractor={(item) => item.id}
        {...(onRefresh ? { onRefresh, refreshing: isLoading || false } : {})}
        renderItem={({ item }) => {
          const isEditing = editingTodoId === item.id;
          const isUpdating = !!updating[item.id];

          return isEditing ? (
            <TodoInlineForm
              todo={item}
              isUpdating={isUpdating}
              editTitle={editTitle ?? ''}
              editDescription={editDescription ?? ''}
              editError={editError}
              onChangeEditTitle={onChangeEditTitle}
              onChangeEditDescription={onChangeEditDescription}
              onSubmitEdit={onSubmitEdit}
              onCancelEdit={onCancelEdit}
            />
          ) : (
            <TodoItem
              todo={item}
              isUpdating={isUpdating}
              onToggleComplete={onToggleComplete}
              onStartEdit={onStartEdit}
            />
          );
        }}
      />
    </View>
  );
}
