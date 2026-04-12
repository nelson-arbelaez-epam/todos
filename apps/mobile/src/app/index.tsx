import { Redirect } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { useSessionStore } from '@/store/session-store';
import { colors } from '@/tokens/colors';
import { fontSizes, spacing } from '@/tokens/spacing';

/**
 * Home route – requires an authenticated session.
 * Redirects to /register when no session is active (mirrors web Register redirect).
 */
export default function HomeScreen() {
  const currentUser = useSessionStore((state) => state.currentUser);

  if (!currentUser) {
    return <Redirect href="/register" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>You are signed in</Text>
      <Text style={styles.body}>Welcome, {currentUser.email}.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xxl,
    backgroundColor: colors.backgroundScreen,
  },
  title: {
    marginBottom: spacing.md,
    color: colors.textPrimary,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    textAlign: 'center',
  },
  body: {
    color: colors.textSecondary,
    fontSize: fontSizes.md,
    textAlign: 'center',
  },
});
