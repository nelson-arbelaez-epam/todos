import { type FormEvent, useState } from 'react';
import Button from '../../atoms/Button/Button';
import Text from '../../atoms/Text/Text';
import FormField from '../../molecules/FormField/FormField';

export interface CreateTodoFormValues {
  title: string;
  description?: string;
}

export interface CreateTodoFormProps {
  isLoading: boolean;
  error: string | null;
  onSubmit: (values: CreateTodoFormValues) => void;
}

export default function CreateTodoForm({
  isLoading,
  error,
  onSubmit,
}: CreateTodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError(null);

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      setValidationError('Title is required');
      return;
    }

    onSubmit({
      title: trimmedTitle,
      description: trimmedDescription || undefined,
    });
    setTitle('');
    setDescription('');
  };

  const displayError = validationError ?? error;

  return (
    <form
      className="mb-6 flex flex-col gap-4 rounded-lg border border-border bg-bg p-5 shadow-sm"
      onSubmit={handleSubmit}
      noValidate
    >
      <Text variant="heading-3" as="h2">
        Create Todo
      </Text>

      {displayError && (
        <p
          role="alert"
          className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600"
        >
          {displayError}
        </p>
      )}

      <FormField
        id="todoTitle"
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        disabled={isLoading}
      />

      <FormField
        id="todoDescription"
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={isLoading}
      />

      <Button type="submit" loading={isLoading} className="self-start">
        {isLoading ? 'Creating…' : 'Create Todo'}
      </Button>
    </form>
  );
}
