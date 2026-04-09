import { type FormEvent, useState } from 'react';
import styles from './RegisterForm.module.css';

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
 */
export function RegisterForm({ isLoading, error, onSubmit }: RegisterFormProps) {
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
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h1 className={styles.title}>Create an account</h1>

      {displayError && (
        <p role="alert" className={styles.error}>
          {displayError}
        </p>
      )}

      <div className={styles.field}>
        <label htmlFor="email" className={styles.label}>
          Email
        </label>
        <input
          id="email"
          type="email"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          disabled={isLoading}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="password" className={styles.label}>
          Password
        </label>
        <input
          id="password"
          type="password"
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
          disabled={isLoading}
          minLength={6}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="confirmPassword" className={styles.label}>
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          className={styles.input}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          required
          disabled={isLoading}
          minLength={6}
        />
      </div>

      <button
        type="submit"
        className={styles.button}
        disabled={isLoading}
        aria-busy={isLoading}
      >
        {isLoading ? 'Creating account…' : 'Register'}
      </button>
    </form>
  );
}
