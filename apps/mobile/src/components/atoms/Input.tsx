import { StyleSheet, TextInput } from 'react-native';
import { colors } from '../../tokens/colors';
import { fontSizes, radii, spacing } from '../../tokens/spacing';

export interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address';
  editable?: boolean;
  testID?: string;
  accessibilityLabel?: string;
}

/**
 * Atom: Reusable, fully presentational text input component.
 */
export function Input({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  autoCapitalize = 'none',
  keyboardType = 'default',
  editable = true,
  testID,
  accessibilityLabel,
}: InputProps) {
  return (
    <TextInput
      style={[styles.input, !editable && styles.disabled]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      secureTextEntry={secureTextEntry}
      autoCapitalize={autoCapitalize}
      keyboardType={keyboardType}
      editable={editable}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    backgroundColor: colors.backgroundInput,
  },
  disabled: {
    backgroundColor: colors.backgroundDisabledInput,
  },
});
