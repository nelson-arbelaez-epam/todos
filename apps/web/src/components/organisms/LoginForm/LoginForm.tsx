import { type FormEvent, useState } from 'react';
import Button from '../../atoms/Button/Button';
import Text from '../../atoms/Text/Text';
import FormField from '../../molecules/FormField/FormField';

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface LoginFormProps {
  isLoading: boolean;
  error: string | null;
  onSubmit: (values: LoginFormValues) => void;
}

/**
 * Presentational login form component.
 * Accepts all data and callbacks via props – no side effects or API calls.
 * Composes atoms (Button, Text) and molecules (FormField) from the design system.
 */
export function LoginForm({ isLoading, error, onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <form
      className="mx-auto flex w-full max-w-sm flex-col gap-5 rounded-lg border border-border bg-bg p-8 shadow-md"
      onSubmit={handleSubmit}
      noValidate
    >
      <Text variant="heading-2" as="h1">
        Sign in
      </Text>

      {error && (
        <p
          role="alert"
          className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600"
        >
          {error}
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
        autoComplete="current-password"
        required
        disabled={isLoading}
      />

      <Button type="submit" loading={isLoading} className="w-full">
        {isLoading ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}
