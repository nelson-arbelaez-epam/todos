import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RegisterForm } from '../components/organisms/RegisterForm';
import { useSessionStore } from '../store/session-store';
import { colors } from '../tokens/colors';
import { fontSizes, spacing } from '../tokens/spacing';

export interface RegisterScreenProps {
  onNavigateToLogin?: () => void;
}

/**
 * Page: Container component that wires the session store to the
 * RegisterForm organism. Handles post-registration UX (success state).
 */
export function RegisterScreen({ onNavigateToLogin }: RegisterScreenProps) {
  const isLoading = useSessionStore((state) => state.isLoading);
  const error = useSessionStore((state) => state.error);
  const currentUser = useSessionStore((state) => state.currentUser);
  const register = useSessionStore((state) => state.register);
  const clearCurrentUser = useSessionStore((state) => state.clearCurrentUser);

  if (currentUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.successTitle}>Registration successful!</Text>
        <Text style={styles.successBody}>
          Welcome, {currentUser.email}. Your account has been created.
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
            onPress={clearCurrentUser}
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
        onSubmit={(email, password) => register({ email, password })}
        isLoading={isLoading}
        errorMessage={error ?? undefined}
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
