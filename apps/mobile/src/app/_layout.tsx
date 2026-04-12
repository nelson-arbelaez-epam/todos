import '../../global.css';
import { Stack } from 'expo-router';

/**
 * Root layout – wraps all routes with a header-less Stack navigator.
 * Authentication guards live in each individual route (same pattern as web).
 */
export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
