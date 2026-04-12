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
    </ScreenLayout>
  );
}
