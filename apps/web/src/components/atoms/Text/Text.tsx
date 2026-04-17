import type { ElementType, HTMLAttributes, ReactNode } from 'react';

export type TextVariant =
  | 'body'
  | 'body-sm'
  | 'caption'
  | 'label'
  | 'heading-1'
  | 'heading-2'
  | 'heading-3';

export interface TextProps extends HTMLAttributes<HTMLElement> {
  /** Typography variant that controls size and weight */
  variant?: TextVariant;
  /** Override the rendered HTML element */
  as?: ElementType;
  children: ReactNode;
}

const variantClasses: Record<TextVariant, string> = {
  'heading-1': 'font-heading text-4xl font-medium tracking-tight text-text-h',
  'heading-2': 'font-heading text-2xl font-medium tracking-tight text-text-h',
  'heading-3': 'font-heading text-xl font-medium text-text-h',
  body: 'font-sans text-base text-text',
  'body-sm': 'font-sans text-sm text-text',
  label: 'font-sans text-sm font-medium text-text-h',
  caption: 'font-sans text-xs text-text',
};

const defaultTag: Record<TextVariant, ElementType> = {
  'heading-1': 'h1',
  'heading-2': 'h2',
  'heading-3': 'h3',
  body: 'p',
  'body-sm': 'p',
  label: 'span',
  caption: 'span',
};

/**
 * Text atom — a fully presentational typography primitive.
 *
 * Renders the correct semantic HTML element by default but can be overridden
 * via the `as` prop. All visual styles are driven by Tailwind utility classes
 * referencing the design token custom properties.
 */
const Text = ({
  variant = 'body',
  as,
  className = '',
  children,
  ...rest
}: TextProps) => {
  const Tag = as ?? defaultTag[variant];

  return (
    <Tag
      className={[variantClasses[variant], className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Text;
