import type { TodoDto, UpdateTodoDto } from '@todos/core/http';
import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { AppButton, AppText } from '@/components/atoms';
import { AppInput } from '@/components/molecules';

export interface TodoListProps {
  todos: TodoDto[];
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onToggleComplete?: (todo: TodoDto) => Promise<boolean> | boolean;
  onUpdateTodo?: (
    id: string,
    payload: UpdateTodoDto,
  ) => Promise<boolean> | boolean;
  isUpdatingTodoId?: string | null;
  updateError?: string | null;
}

export function TodoList({
  todos,
  isLoading,
  error,
  onRefresh,
  onToggleComplete,
  onUpdateTodo,
  isUpdatingTodoId,
  updateError,
}: TodoListProps) {
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [localEditError, setLocalEditError] = useState<string | null>(null);

  const startEditing = (todo: TodoDto) => {
    setEditingTodoId(todo.id);
    setEditTitle(todo.title);
    setEditDescription(todo.description ?? '');
    setLocalEditError(null);
  };

  const cancelEditing = () => {
    setEditingTodoId(null);
    setEditTitle('');
    setEditDescription('');
    setLocalEditError(null);
  };

  const submitEdit = async (id: string) => {
    const trimmedTitle = editTitle.trim();
    const trimmedDescription = editDescription.trim();

    if (!trimmedTitle) {
      setLocalEditError('Title is required.');
      return;
    }

    setLocalEditError(null);
    const updated = await onUpdateTodo?.(id, {
      title: trimmedTitle,
      description: trimmedDescription || undefined,
    });

    if (updated) {
      cancelEditing();
    }
  };

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
        onRefresh={onRefresh}
        refreshing={isLoading || false}
        renderItem={({ item }) => {
          const isEditing = editingTodoId === item.id;
          const isUpdating = isUpdatingTodoId === item.id;

          return (
            <View className="py-2 border-b border-border">
              {isEditing ? (
                <View className="gap-2">
                  <AppInput
                    label="Title"
                    value={editTitle}
                    onChangeText={setEditTitle}
                    editable={!isUpdating}
                    required
                    testID={`todo-edit-title-${item.id}`}
                  />
                  <AppInput
                    label="Description"
                    value={editDescription}
                    onChangeText={setEditDescription}
                    editable={!isUpdating}
                    testID={`todo-edit-description-${item.id}`}
                  />
                  {localEditError ? (
                    <AppText variant="caption" color="danger">
                      {localEditError}
                    </AppText>
                  ) : null}
                  <View className="flex-row gap-2">
                    <AppButton
                      title="Save"
                      onPress={() => {
                        void submitEdit(item.id);
                      }}
                      loading={isUpdating}
                      disabled={isUpdating}
                      size="sm"
                    />
                    <AppButton
                      title="Cancel"
                      onPress={cancelEditing}
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
                        void onToggleComplete?.(item);
                      }}
                      variant={item.completed ? 'secondary' : 'primary'}
                      size="sm"
                      loading={isUpdating}
                      disabled={isUpdating}
                    />
                    <AppButton
                      title="Edit"
                      onPress={() => {
                        startEditing(item);
                      }}
                      variant="ghost"
                      size="sm"
                      disabled={isUpdating}
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
