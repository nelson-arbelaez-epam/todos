import { Link } from 'expo-router';
import { View } from 'react-native';
import { AppText } from '../components/atoms';
import { RegisterForm } from '../components/organisms/RegisterForm';
import { ScreenLayout } from '../components/templates';
import { useSessionStore } from '../store/session-store';

/**
 * Page: Container component that wires the session store to the
 * RegisterForm organism. Authenticated users are redirected by App.tsx.
 */
export function RegisterScreen() {
  const isLoading = useSessionStore((state) => state.isLoading);
  const error = useSessionStore((state) => state.error);
  const register = useSessionStore((state) => state.register);

  return (
    <ScreenLayout horizontalPadding={48} className="justify-center">
      <RegisterForm
        onSubmit={(email, password) => register({ email, password })}
        isLoading={isLoading}
        errorMessage={error ?? undefined}
      />
      <View className="mt-6 items-center">
        <AppText variant="caption" className="mb-2">
          Already have an account?
        </AppText>
        <Link href="/login">
          <AppText variant="body" className="text-blue-600">
            Sign in
          </AppText>
        </Link>
      </View>
    </ScreenLayout>
  );
}
