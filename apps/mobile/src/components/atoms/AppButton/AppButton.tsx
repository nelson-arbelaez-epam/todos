import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
} from 'react-native';
import { AppText } from '@/components/atoms';
import { colors } from '@/theme';
import { cn } from '@/utils/cn';

export type AppButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type AppButtonSize = 'sm' | 'md' | 'lg';

export interface AppButtonProps extends PressableProps {
  title: string;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClassNames: Record<AppButtonVariant, string> = {
  primary: 'border border-primary bg-primary',
  secondary: 'border border-primary bg-white',
  ghost: 'border border-transparent bg-transparent',
  danger: 'border border-danger bg-danger',
};

const sizeClassNames: Record<AppButtonSize, string> = {
  sm: 'min-h-8 px-3 py-1',
  md: 'min-h-11 px-4 py-2',
  lg: 'min-h-[52px] px-6 py-3',
};

const labelVariantClassNames: Record<AppButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-primary',
  ghost: 'text-primary',
  danger: 'text-white',
};

const labelSizeClassNames: Record<AppButtonSize, string> = {
  sm: 'text-[13px]',
  md: 'text-[15px]',
  lg: 'text-[17px]',
};

/**
 * AppButton – presentational atom for interactive button controls.
 * Supports primary, secondary, ghost, and danger variants with
 * sm/md/lg size options. Fully controlled via props; no side effects.
 */
export function AppButton({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  className,
  ...rest
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      className={cn(
        'flex-row items-center justify-center rounded-md',
        variantClassNames[variant],
        sizeClassNames[size],
        fullWidth && 'w-full',
        isDisabled && 'opacity-50',
        className,
      )}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'primary' || variant === 'danger'
              ? colors.white
              : colors.primary
          }
        />
      ) : (
        <AppText
          className={cn(
            'text-center',
            labelVariantClassNames[variant],
            labelSizeClassNames[size],
          )}
          weight="semibold"
        >
          {title}
        </AppText>
      )}
    </Pressable>
  );
}
