import type { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Accessible error message to display below the input */
  error?: string;
}

/**
 * Input atom — a fully presentational input primitive.
 *
 * Accepts all native `<input>` attributes plus an optional `error` string
 * that renders helper text and sets `aria-invalid` automatically.
 */
const Input = ({ error, className = '', id, ...rest }: InputProps) => {
  const errorId = error && id ? `${id}-error` : undefined;

  return (
    <div className="flex flex-col gap-1">
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={[
          'w-full rounded-md border px-3 py-2 text-sm text-text-h',
          'bg-bg placeholder:text-text',
          'border-border focus:border-accent focus:outline-none',
          'focus:ring-2 focus:ring-accent-border',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors',
          error ? 'border-red-500' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      />
      {error && (
        <span id={errorId} className="text-xs text-red-600" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
