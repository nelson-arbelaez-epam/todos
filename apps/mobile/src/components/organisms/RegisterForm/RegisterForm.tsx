import { useState } from 'react';
import { View } from 'react-native';
import { AppButton, AppText } from '@/components/atoms';
import { AppInput } from '@/components/molecules';

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
    <View className="w-full">
      <AppText variant="heading" weight="bold" className="mb-12 text-center">
        Create an account
      </AppText>

      <View className="mb-8">
        <AppInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
          testID="register-email"
          required
        />
      </View>

      <View className="mb-8">
        <AppInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Min. 6 characters"
          secureTextEntry
          editable={!isLoading}
          testID="register-password"
          required
        />
      </View>

      {displayError ? (
        <AppText
          variant="caption"
          color="danger"
          className="mb-3 text-center"
          testID="register-error"
        >
          {displayError}
        </AppText>
      ) : null}

      <AppButton
        title="Register"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading}
        testID="register-submit"
        fullWidth
      />
    </View>
  );
}
