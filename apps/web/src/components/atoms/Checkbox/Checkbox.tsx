import type { InputHTMLAttributes } from 'react';

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {}

const Checkbox = ({ className = '', id, ...rest }: CheckboxProps) => {
  return (
    <input
      id={id}
      type="checkbox"
      className={[
        'h-4 w-4 mt-1 rounded border-border text-accent',
        'focus:ring-2 focus:ring-accent-border',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    />
  );
};

export default Checkbox;
