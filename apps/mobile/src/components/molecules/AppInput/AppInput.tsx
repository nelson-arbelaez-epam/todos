import { TextInput, type TextInputProps, View } from 'react-native';
import { AppLabel, AppText } from '@/components/atoms';
import { colors } from '@/theme';
import { cn } from '@/utils/cn';

export interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

/**
 * AppInput – presentational molecule for text input controls.
 * Supports optional label, error message, and hint text.
 * All state is controlled externally; no internal side-effects.
 */
export function AppInput({
  label,
  error,
  hint,
  required,
  className,
  editable = true,
  ...rest
}: AppInputProps) {
  const hasError = Boolean(error);

  return (
    <View className="w-full">
      {label ? (
        <AppLabel required={required} className="mb-1">
          {label}
        </AppLabel>
      ) : null}

      <TextInput
        className={cn(
          'min-h-11 rounded-md border border-border bg-white px-3 py-2 text-[15px] text-text-primary',
          hasError && 'border-danger',
          !editable && 'bg-surface text-text-disabled',
          className,
        )}
        editable={editable}
        placeholderTextColor={colors.textDisabled}
        accessibilityLabel={label}
        accessibilityHint={hint}
        {...rest}
      />

      {hasError ? (
        <AppText variant="caption" color="danger" className="mt-1">
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" className="mt-1">
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}
