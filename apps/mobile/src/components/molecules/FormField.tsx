import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../tokens/colors';
import { fontSizes, spacing } from '../../tokens/spacing';
import { Input, type InputProps } from '../atoms/Input';

export interface FormFieldProps extends InputProps {
  label: string;
  errorMessage?: string;
}

/**
 * Molecule: Combines a label, an Input atom, and an optional error message
 * into a single form field unit.
 */
export function FormField({
  label,
  errorMessage,
  ...inputProps
}: FormFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Input {...inputProps} />
      {errorMessage ? (
        <Text style={styles.error} testID={`${inputProps.testID}-error`}>
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  error: {
    fontSize: fontSizes.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
