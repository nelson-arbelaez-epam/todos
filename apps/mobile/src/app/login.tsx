import { Redirect } from 'expo-router';

import LoginScreen from '@/pages/LoginScreen';
import { useSessionStore } from '@/store/session-store';

export default function LoginRoute() {
  const currentUser = useSessionStore((state) => state.currentUser);

  if (currentUser) {
    return <Redirect href="/" />;
  }

  return <LoginScreen />;
}
