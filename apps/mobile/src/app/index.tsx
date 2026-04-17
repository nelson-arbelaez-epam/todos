import { Redirect } from 'expo-router';

import TodosScreen from '@/pages/TodosScreen';
import { useSessionStore } from '@/store/session-store';

/**
 * Root authenticated route.
 * Redirects to /login when no session is active.
 */
export default function HomeRoute() {
  const currentUser = useSessionStore((state) => state.currentUser);

  if (!currentUser) {
    return <Redirect href="/login" />;
  }

  return <TodosScreen />;
}
