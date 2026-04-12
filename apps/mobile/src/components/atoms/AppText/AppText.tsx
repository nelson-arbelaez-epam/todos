import { Text, type TextProps } from 'react-native';
import { colors } from '../../../theme';
import { cn } from '../../../utils/cn';

export type AppTextVariant =
  | 'display'
  | 'heading'
  | 'subheading'
  | 'body'
  | 'caption'
  | 'label';

export type AppTextWeight = 'regular' | 'medium' | 'semibold' | 'bold';

export interface AppTextProps extends TextProps {
  variant?: AppTextVariant;
  weight?: AppTextWeight;
  color?: string;
  children: React.ReactNode;
}

const colorClassNames: Record<string, string> = {
  [colors.primary]: 'text-primary',
  [colors.danger]: 'text-danger',
  [colors.textPrimary]: 'text-text-primary',
  [colors.textSecondary]: 'text-text-secondary',
  [colors.textDisabled]: 'text-text-disabled',
  [colors.textInverse]: 'text-text-inverse',
  [colors.white]: 'text-white',
};

const variantClassNames: Record<AppTextVariant, string> = {
  display: 'text-[34px] leading-[40.8px] text-text-primary',
  heading: 'text-[28px] leading-[33.6px] text-text-primary',
  subheading: 'text-2xl leading-9 text-text-primary',
  body: 'text-[15px] leading-[22.5px] text-text-primary',
  caption: 'text-[13px] leading-[19.5px] text-text-secondary',
  label: 'text-[13px] leading-[19.5px] text-text-primary',
};

const weightClassNames: Record<AppTextWeight, string> = {
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

/**
 * AppText – presentational atom for all text rendering.
 * Wraps React Native's `Text` with design-token-driven typography variants.
 * No side-effects, no store calls — accepts all data via props.
 */
export function AppText({
  variant = 'body',
  weight = 'regular',
  color,
  className,
  children,
  ...rest
}: AppTextProps) {
  return (
    <Text
      className={cn(
        variantClassNames[variant],
        weightClassNames[weight],
        color ? colorClassNames[color] : null,
        className,
      )}
      {...rest}
    >
      {children}
    </Text>
  );
}
