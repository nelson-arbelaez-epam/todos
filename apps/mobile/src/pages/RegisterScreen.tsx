import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RegisterForm } from '../components/organisms/RegisterForm';
import { useRegister } from '../hooks/use-register';
import { colors } from '../tokens/colors';
import { fontSizes, spacing } from '../tokens/spacing';

export interface RegisterScreenProps {
  onNavigateToLogin?: () => void;
}

/**
 * Page: Container component that wires the useRegister hook to the
 * RegisterForm organism. Handles post-registration UX (success state).
 */
export function RegisterScreen({ onNavigateToLogin }: RegisterScreenProps) {
  const { register, isLoading, error, result, reset } = useRegister();

  if (result) {
    return (
      <View style={styles.container}>
        <Text style={styles.successTitle}>Registration successful!</Text>
        <Text style={styles.successBody}>
          Welcome, {result.email}. Your account has been created.
        </Text>
        {onNavigateToLogin ? (
          <TouchableOpacity
            onPress={onNavigateToLogin}
            testID="go-to-login"
            accessibilityRole="button"
          >
            <Text style={styles.link}>Go to Login</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={reset}
            testID="register-another"
            accessibilityRole="button"
          >
            <Text style={styles.link}>Register another account</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RegisterForm
        onSubmit={register}
        isLoading={isLoading}
        errorMessage={error?.message}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xxl,
    justifyContent: 'center',
    backgroundColor: colors.backgroundScreen,
  },
  successTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.success,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  successBody: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  link: {
    fontSize: fontSizes.md,
    color: colors.primary,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
