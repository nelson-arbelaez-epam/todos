import type { LabelHTMLAttributes } from 'react';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Marks the associated field as required with a visual indicator */
  required?: boolean;
}

/**
 * Label atom — a fully presentational label primitive tied to a form control
 * via the `htmlFor` prop. Renders a visual asterisk when `required` is true.
 */
const Label = ({
  required = false,
  htmlFor,
  className = '',
  children,
  ...rest
}: LabelProps) => (
  <label
    htmlFor={htmlFor}
    className={['inline-block text-sm font-medium text-text-h', className]
      .filter(Boolean)
      .join(' ')}
    {...rest}
  >
    {children}
    {required && (
      <span className="ml-0.5 text-accent" aria-hidden="true">
        *
      </span>
    )}
  </label>
);

export default Label;
