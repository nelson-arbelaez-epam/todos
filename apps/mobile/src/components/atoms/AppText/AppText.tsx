import { StyleSheet, Text, type TextProps } from 'react-native';
import { colors, typography } from '../../../theme';

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

/**
 * AppText – presentational atom for all text rendering.
 * Wraps React Native's `Text` with design-token-driven typography variants.
 * No side-effects, no store calls — accepts all data via props.
 */
export function AppText({
  variant = 'body',
  weight = 'regular',
  color,
  style,
  children,
  ...rest
}: AppTextProps) {
  return (
    <Text
      style={[
        styles.base,
        styles[variant],
        styles[`weight_${weight}`],
        color ? { color } : null,
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    color: colors.textPrimary,
  },
  display: {
    fontSize: typography.fontSizes['3xl'],
    lineHeight: typography.fontSizes['3xl'] * typography.lineHeights.tight,
    fontWeight: typography.fontWeights.bold,
  },
  heading: {
    fontSize: typography.fontSizes['2xl'],
    lineHeight: typography.fontSizes['2xl'] * typography.lineHeights.tight,
    fontWeight: typography.fontWeights.semibold,
  },
  subheading: {
    fontSize: typography.fontSizes.xl,
    lineHeight: typography.fontSizes.xl * typography.lineHeights.normal,
    fontWeight: typography.fontWeights.medium,
  },
  body: {
    fontSize: typography.fontSizes.base,
    lineHeight: typography.fontSizes.base * typography.lineHeights.normal,
    fontWeight: typography.fontWeights.regular,
  },
  caption: {
    fontSize: typography.fontSizes.sm,
    lineHeight: typography.fontSizes.sm * typography.lineHeights.normal,
    fontWeight: typography.fontWeights.regular,
    color: colors.textSecondary,
  },
  label: {
    fontSize: typography.fontSizes.sm,
    lineHeight: typography.fontSizes.sm * typography.lineHeights.normal,
    fontWeight: typography.fontWeights.medium,
  },
  weight_regular: { fontWeight: typography.fontWeights.regular },
  weight_medium: { fontWeight: typography.fontWeights.medium },
  weight_semibold: { fontWeight: typography.fontWeights.semibold },
  weight_bold: { fontWeight: typography.fontWeights.bold },
});
