import { type FormEvent, useState } from 'react';
import Button from '../../atoms/Button/Button';
import Text from '../../atoms/Text/Text';
import FormField from '../../molecules/FormField/FormField';

export interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterFormProps {
  isLoading: boolean;
  error: string | null;
  onSubmit: (values: Pick<RegisterFormValues, 'email' | 'password'>) => void;
}

/**
 * Presentational register form component.
 * Accepts all data and callbacks via props – no side effects or API calls.
 * Composes atoms (Button, Text) and molecules (FormField) from the design system.
 */
export function RegisterForm({
  isLoading,
  error,
  onSubmit,
}: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError(null);

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    onSubmit({ email, password });
  };

  const displayError = validationError ?? error;

  return (
    <form
      className="mx-auto flex w-full max-w-sm flex-col gap-5 rounded-lg border border-border bg-bg p-8 shadow-md"
      onSubmit={handleSubmit}
      noValidate
    >
      <Text variant="heading-2" as="h1">
        Create an account
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
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
        disabled={isLoading}
      />

      <FormField
        id="password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
        required
        disabled={isLoading}
        minLength={6}
      />

      <FormField
        id="confirmPassword"
        label="Confirm password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        autoComplete="new-password"
        required
        disabled={isLoading}
        minLength={6}
      />

      <Button type="submit" loading={isLoading} className="w-full">
        {isLoading ? 'Creating account…' : 'Register'}
      </Button>
    </form>
  );
}
