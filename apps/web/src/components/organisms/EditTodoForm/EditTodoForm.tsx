import { type FormEvent, useState } from 'react';
import type { TodoDto, UpdateTodoDto } from '@todos/core/http';
import Button from '../../atoms/Button/Button';
import FormField from '../../molecules/FormField/FormField';

export interface EditTodoFormProps {
  todo: TodoDto;
  isUpdating: boolean;
  updateError?: string | null;
  onSubmit: (id: string, payload: UpdateTodoDto) => Promise<void>;
  onCancel: () => void;
}

export default function EditTodoForm({
  todo,
  isUpdating,
  updateError,
  onSubmit,
  onCancel,
}: EditTodoFormProps) {
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description ?? '');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError(null);

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      setValidationError('Title is required');
      return;
    }

    await onSubmit(todo.id, {
      title: trimmedTitle,
      description: trimmedDescription || undefined,
    });
  };

  const displayError = validationError ?? updateError;

  return (
    <form
      className="flex flex-col gap-3 p-3 border-b bg-accent-bg"
      onSubmit={handleSubmit}
      noValidate
    >
      {displayError && (
        <p
          role="alert"
          className="rounded-md border border-[var(--error-border)] bg-[var(--error-bg)] px-3 py-2 text-sm text-[var(--error)]"
        >
          {displayError}
        </p>
      )}

      <FormField
        id={`editTodoTitle-${todo.id}`}
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        disabled={isUpdating}
      />

      <FormField
        id={`editTodoDescription-${todo.id}`}
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={isUpdating}
      />

      <div className="flex gap-2">
        <Button type="submit" size="sm" loading={isUpdating}>
          {isUpdating ? 'Saving…' : 'Save'}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={onCancel}
          disabled={isUpdating}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
