import { Link } from 'expo-router';
import { View } from 'react-native';
import { AppText } from '../components/atoms';
import { LoginForm } from '../components/organisms/LoginForm';
import { ScreenLayout } from '../components/templates';
import { useSessionStore } from '../store/session-store';

/**
 * Page: Container component that wires the session store to the
 * LoginForm organism. Authenticated users are redirected by App route.
 */
export function LoginScreen() {
  const isLoading = useSessionStore((state) => state.isLoading);
  const error = useSessionStore((state) => state.error);
  const login = useSessionStore((state) => state.login);

  return (
    <ScreenLayout horizontalPadding={48} className="justify-center">
      <LoginForm
        onSubmit={(email, password) => login({ email, password })}
        isLoading={isLoading}
        errorMessage={error ?? undefined}
      />
      <View className="mt-6 items-center">
        <AppText variant="caption" className="mb-2">
          Don't have an account?
        </AppText>
        <Link href="/register">
          <AppText variant="body" className="text-blue-600">
            Create an account
          </AppText>
        </Link>
      </View>
    </ScreenLayout>
  );
}

export default LoginScreen;
