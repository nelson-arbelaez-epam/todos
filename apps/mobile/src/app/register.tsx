import { Redirect } from 'expo-router';

import { RegisterScreen } from '@/pages/RegisterScreen';
import { useSessionStore } from '@/store/session-store';

/**
 * Register route – public page that mirrors web's Register page behavior:
 * authenticated users are immediately redirected away to the home route.
 */
export default function RegisterRoute() {
  const currentUser = useSessionStore((state) => state.currentUser);

  if (currentUser) {
    return <Redirect href="/" />;
  }

  return <RegisterScreen />;
}
