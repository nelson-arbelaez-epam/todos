import { Redirect } from 'expo-router';

import { HomeScreen } from '@/pages/HomeScreen';
import { useSessionStore } from '@/store/session-store';

/**
 * Home route – requires an authenticated session.
 * Redirects to /register when no session is active (mirrors web Register redirect).
 */
export default function HomeRoute() {
  const currentUser = useSessionStore((state) => state.currentUser);

  if (!currentUser) {
    return <Redirect href="/register" />;
  }

  return <HomeScreen currentUserEmail={currentUser.email} />;
}
