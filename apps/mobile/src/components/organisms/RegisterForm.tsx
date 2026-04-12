import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../tokens/colors';
import { fontSizes, spacing } from '../../tokens/spacing';
import { Button } from '../atoms/Button';
import { FormField } from '../molecules/FormField';

export interface RegisterFormProps {
  onSubmit: (email: string, password: string) => void;
  isLoading: boolean;
  errorMessage?: string;
}

const MIN_PASSWORD_LENGTH = 6;

/**
 * Organism: Presentational register form.
 * Accepts all data and callbacks via props – no side effects.
 */
export function RegisterForm({
  onSubmit,
  isLoading,
  errorMessage,
}: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | undefined>();

  const handleSubmit = () => {
    if (!email.trim()) {
      setLocalError('Email is required.');
      return;
    }
    if (!password.trim() || password.length < MIN_PASSWORD_LENGTH) {
      setLocalError(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      );
      return;
    }
    setLocalError(undefined);
    onSubmit(email.trim(), password);
  };

  const displayError = localError ?? errorMessage;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create an account</Text>

      <FormField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isLoading}
        testID="register-email"
      />

      <FormField
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Min. 6 characters"
        secureTextEntry
        editable={!isLoading}
        testID="register-password"
      />

      {displayError ? (
        <Text style={styles.error} testID="register-error">
          {displayError}
        </Text>
      ) : null}

      <Button
        label="Register"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading}
        testID="register-submit"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  error: {
    fontSize: fontSizes.sm,
    color: colors.error,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
});
