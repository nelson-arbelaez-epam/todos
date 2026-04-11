import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size preset */
  size?: ButtonSize;
  /** Whether the button is in a loading state */
  loading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-white border border-transparent hover:opacity-90 focus-visible:outline-accent',
  secondary:
    'bg-transparent text-accent border border-accent hover:bg-accent-bg focus-visible:outline-accent',
  ghost:
    'bg-transparent text-text border border-transparent hover:bg-accent-bg focus-visible:outline-accent',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-4 py-2 text-base rounded-md',
  lg: 'px-5 py-2.5 text-lg rounded-lg',
};

/**
 * Button atom — a fully presentational, accessible button primitive.
 *
 * Accepts all native `<button>` attributes in addition to the custom props
 * documented above. Styling is driven exclusively by CSS custom properties
 * via Tailwind utility classes.
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) => {
  const isDisabled = disabled ?? loading;

  return (
    <button
      type="button"
      disabled={isDisabled}
      aria-busy={loading}
      className={[
        'inline-flex items-center justify-center gap-2',
        'font-sans font-medium transition-opacity',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
