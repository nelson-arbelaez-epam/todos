import type { ReactNode } from 'react';
import Input, { type InputProps } from '../../atoms/Input/Input';
import Label from '../../atoms/Label/Label';

export interface FormFieldProps extends InputProps {
  /** Label text displayed above the input */
  label: ReactNode;
  /** Whether the field is required — forwards to Label and Input */
  required?: boolean;
}

/**
 * FormField molecule — combines a Label atom and an Input atom into a
 * single, co-located accessible form control. Accepts all Input props
 * plus a `label` and optional `required` flag.
 *
 * Fully presentational: no side effects, store calls, or API fetches.
 */
const FormField = ({
  label,
  required = false,
  id,
  ...inputProps
}: FormFieldProps) => (
  <div className="flex flex-col gap-1">
    <Label htmlFor={id} required={required}>
      {label}
    </Label>
    <Input id={id} {...inputProps} />
  </div>
);

export default FormField;
