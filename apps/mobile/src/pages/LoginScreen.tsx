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
    </ScreenLayout>
  );
}

export default LoginScreen;
