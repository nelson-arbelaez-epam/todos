import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native';
import { colors, radii, spacing, typography } from '../../../theme';
import { AppLabel } from '../AppLabel/AppLabel';
import { AppText } from '../AppText/AppText';

export interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

/**
 * AppInput – presentational atom for text input controls.
 * Supports optional label, error message, and hint text.
 * All state is controlled externally; no internal side-effects.
 */
export function AppInput({
  label,
  error,
  hint,
  required,
  style,
  editable = true,
  ...rest
}: AppInputProps) {
  const hasError = Boolean(error);

  return (
    <View style={styles.container}>
      {label ? (
        <AppLabel required={required} style={styles.labelSpacing}>
          {label}
        </AppLabel>
      ) : null}

      <TextInput
        style={[
          styles.input,
          hasError && styles.inputError,
          !editable && styles.inputDisabled,
          style,
        ]}
        editable={editable}
        placeholderTextColor={colors.textDisabled}
        accessibilityLabel={label}
        accessibilityHint={hint}
        {...rest}
      />

      {hasError ? (
        <AppText variant="caption" color={colors.danger} style={styles.message}>
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" style={styles.message}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelSpacing: {
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSizes.base,
    color: colors.textPrimary,
    backgroundColor: colors.white,
    minHeight: 44,
  },
  inputError: {
    borderColor: colors.danger,
  },
  inputDisabled: {
    backgroundColor: colors.gray100,
    color: colors.textDisabled,
  },
  message: {
    marginTop: spacing.xs,
  },
});
