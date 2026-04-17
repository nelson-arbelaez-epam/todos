import type { TextProps } from 'react-native';
import { AppText } from '@/components/atoms/AppText/AppText';

export interface AppLabelProps extends Omit<TextProps, 'children'> {
  children: React.ReactNode;
  required?: boolean;
}

/**
 * AppLabel – presentational atom for form labels and descriptive text.
 * Built on top of AppText with `label` variant.
 */
export function AppLabel({ children, required, ...rest }: AppLabelProps) {
  return (
    <AppText variant="label" {...rest}>
      {children}
      {required ? ' *' : null}
    </AppText>
  );
}
