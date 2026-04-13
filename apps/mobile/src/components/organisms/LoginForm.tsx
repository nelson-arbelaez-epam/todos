import { useState } from 'react';
import { View } from 'react-native';
import { AppButton, AppInput, AppText } from '../atoms';

export interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  isLoading: boolean;
  errorMessage?: string | null;
}

const MIN_PASSWORD_LENGTH = 6;

export function LoginForm({
  onSubmit,
  isLoading,
  errorMessage,
}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | undefined>();

  const handleSubmit = () => {
    if (!email.trim()) {
      setLocalError('Email is required.');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setLocalError('Please enter a valid email address.');
      return;
    }
    if (!password.trim()) {
      setLocalError('Password is required.');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setLocalError(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      );
      return;
    }

    setLocalError(undefined);
    onSubmit(email.trim(), password);
  };

  const displayError = localError ?? errorMessage ?? undefined;

  return (
    <View className="w-full">
      <AppText variant="heading" weight="bold" className="mb-12 text-center">
        Sign in
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
          testID="login-email"
          required
        />
      </View>

      <View className="mb-8">
        <AppInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Your password"
          secureTextEntry
          editable={!isLoading}
          testID="login-password"
          required
        />
      </View>

      {displayError ? (
        <AppText
          variant="caption"
          color="danger"
          className="mb-3 text-center"
          testID="login-error"
        >
          {displayError}
        </AppText>
      ) : null}

      <AppButton
        title="Sign in"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading}
        testID="login-submit"
        fullWidth
      />
    </View>
  );
}
