import { StyleSheet, View } from 'react-native';
import { RegisterForm } from '../components/organisms/RegisterForm';
import { useSessionStore } from '../store/session-store';
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';

/**
 * Page: Container component that wires the session store to the
 * RegisterForm organism. Authenticated users are redirected by App.tsx.
 */
export function RegisterScreen() {
  const isLoading = useSessionStore((state) => state.isLoading);
  const error = useSessionStore((state) => state.error);
  const register = useSessionStore((state) => state.register);

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
});
