import type { TodoDto, UpdateTodoDto } from '@todos/core/http';
import { FlatList, View } from 'react-native';
import { AppButton, AppText } from '@/components/atoms';
import { AppInput } from '@/components/molecules';

export interface TodoListProps {
  todos: TodoDto[];
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onToggleComplete?: (todo: TodoDto) => Promise<void>;
  isUpdatingTodoId?: string | null;
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
  isUpdatingTodoId,
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
        {...(onRefresh
          ? { onRefresh, refreshing: isLoading || false }
          : {})}
        renderItem={({ item }) => {
          const isEditing = editingTodoId === item.id;
          const isUpdating = isUpdatingTodoId === item.id;
          const hasPendingUpdate = Boolean(isUpdatingTodoId);

          return (
            <View className="py-2 border-b border-border">
              {isEditing ? (
                <View className="gap-2">
                  <AppInput
                    label="Title"
                    value={editTitle ?? ''}
                    onChangeText={onChangeEditTitle}
                    editable={!isUpdating}
                    required
                    testID={`todo-edit-title-${item.id}`}
                  />
                  <AppInput
                    label="Description"
                    value={editDescription ?? ''}
                    onChangeText={onChangeEditDescription}
                    editable={!isUpdating}
                    testID={`todo-edit-description-${item.id}`}
                  />
                  {editError ? (
                    <AppText variant="caption" color="danger">
                      {editError}
                    </AppText>
                  ) : null}
                  <View className="flex-row gap-2">
                    <AppButton
                      title="Save"
                      onPress={() => {
                        void onSubmitEdit?.(item.id, {
                          title: editTitle,
                          description: editDescription || undefined,
                        });
                      }}
                      loading={isUpdating}
                      disabled={isUpdating}
                      size="sm"
                    />
                    <AppButton
                      title="Cancel"
                      onPress={onCancelEdit}
                      variant="secondary"
                      size="sm"
                      disabled={isUpdating}
                    />
                  </View>
                </View>
              ) : (
                <View>
                  <AppText
                    variant="body"
                    weight={item.completed ? 'regular' : 'medium'}
                    className={item.completed ? 'text-text-secondary' : undefined}
                  >
                    {item.title}
                  </AppText>
                  {item.description ? (
                    <AppText variant="caption" className="text-text-secondary mt-1">
                      {item.description}
                    </AppText>
                  ) : null}
                  <View className="mt-2 flex-row gap-2">
                    <AppButton
                      title={item.completed ? 'Mark active' : 'Complete'}
                      onPress={() => {
                        if (onToggleComplete) {
                          void onToggleComplete(item);
                        }
                      }}
                      variant={item.completed ? 'secondary' : 'primary'}
                      size="sm"
                      loading={isUpdating}
                      disabled={hasPendingUpdate}
                    />
                    <AppButton
                      title="Edit"
                      onPress={() => {
                        onStartEdit?.(item);
                      }}
                      variant="ghost"
                      size="sm"
                      disabled={hasPendingUpdate}
                    />
                  </View>
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}
