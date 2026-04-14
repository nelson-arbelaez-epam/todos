import type { CreateTodoDto } from '@todos/core/http';
import { useState } from 'react';
import { View } from 'react-native';
import { AppButton, AppText } from '@/components/atoms';
import { AppInput } from '@/components/molecules';

export interface CreateTodoFormProps {
  onSubmit: (payload: CreateTodoDto) => Promise<boolean> | boolean;
  isLoading: boolean;
  errorMessage?: string | null;
}

export function CreateTodoForm({
  onSubmit,
  isLoading,
  errorMessage,
}: CreateTodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [localError, setLocalError] = useState<string | undefined>();

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      setLocalError('Title is required.');
      return;
    }

    setLocalError(undefined);
    const created = await onSubmit({
      title: trimmedTitle,
      description: trimmedDescription || undefined,
    });

    if (created) {
      setTitle('');
      setDescription('');
    }
  };

  const displayError = localError ?? errorMessage ?? undefined;

  return (
    <View className="w-full">
      <AppText variant="heading" weight="bold" className="mb-4">
        Create todo
      </AppText>

      <View className="mb-3">
        <AppInput
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="What do you need to do?"
          editable={!isLoading}
          testID="create-todo-title"
          required
        />
      </View>

      <View className="mb-3">
        <AppInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Optional details"
          editable={!isLoading}
          testID="create-todo-description"
        />
      </View>

      {displayError ? (
        <AppText
          variant="caption"
          color="danger"
          className="mb-3"
          testID="create-todo-error"
        >
          {displayError}
        </AppText>
      ) : null}

      <AppButton
        title="Add todo"
        onPress={() => {
          void handleSubmit();
        }}
        loading={isLoading}
        disabled={isLoading}
        testID="create-todo-submit"
        fullWidth
      />
    </View>
  );
}
