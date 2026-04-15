import type { TodoDto, UpdateTodoDto } from '@todos/core/http';
import { View } from 'react-native';
import { AppButton, AppText } from '@/components/atoms';
import { AppInput } from '@/components/molecules';

export interface TodoInlineFormProps {
  todo: TodoDto;
  isUpdating: boolean;
  editTitle: string;
  editDescription: string;
  editError?: string | null;
  onChangeEditTitle?: (value: string) => void;
  onChangeEditDescription?: (value: string) => void;
  onSubmitEdit?: (id: string, payload: UpdateTodoDto) => Promise<void>;
  onCancelEdit?: () => void;
}

export function TodoInlineForm({
  todo,
  isUpdating,
  editTitle,
  editDescription,
  editError,
  onChangeEditTitle,
  onChangeEditDescription,
  onSubmitEdit,
  onCancelEdit,
}: TodoInlineFormProps) {
  return (
    <View className="gap-2">
      <AppInput
        label="Title"
        value={editTitle}
        onChangeText={onChangeEditTitle}
        editable={!isUpdating}
        required
        testID={`todo-edit-title-${todo.id}`}
      />
      <AppInput
        label="Description"
        value={editDescription}
        onChangeText={onChangeEditDescription}
        editable={!isUpdating}
        testID={`todo-edit-description-${todo.id}`}
      />
      {editError ? (
        <AppText variant="caption" color="danger">
          {editError}
        </AppText>
      ) : null}
      <View className="flex-row gap-2">
        <AppButton
          title="Save"
          testID={`todo-submit-edit-${todo.id}`}
          onPress={() => {
            void onSubmitEdit?.(todo.id, {
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
          testID={`todo-cancel-edit-${todo.id}`}
          onPress={onCancelEdit}
          variant="secondary"
          size="sm"
          disabled={isUpdating}
        />
      </View>
    </View>
  );
}
