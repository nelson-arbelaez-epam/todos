import '../../global.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { createTodosQueryClient } from '@/query/query-client';

/**
 * Root layout – wraps all routes with a header-less Stack navigator.
 * Authentication guards live in each individual route (same pattern as web).
 */
export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}

const queryClient = createTodosQueryClient();
