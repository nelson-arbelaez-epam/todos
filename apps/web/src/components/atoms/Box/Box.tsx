import type { ElementType, HTMLAttributes, ReactNode } from 'react';

export interface BoxProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  children?: ReactNode;
}

const Box = ({ as, className = '', children, ...rest }: BoxProps) => {
  const Tag = as ?? 'div';
  return (
    // eslint-disable-next-line react/jsx-pascal-case
    <Tag className={className} {...rest}>
      {children}
    </Tag>
  );
};

export default Box;
