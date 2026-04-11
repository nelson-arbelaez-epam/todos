import { View } from 'react-native';
import { AppButton, AppText, Surface } from '../components/atoms';
import { ScreenLayout } from '../components/templates';
import { spacing } from '../theme';

/**
 * HomeScreen – container screen wiring presentational atoms and templates.
 * Keeps JSX thin; data/logic belongs in dedicated hooks when needed.
 */
export function HomeScreen() {
  return (
    <ScreenLayout scrollable>
      <View style={{ alignItems: 'center', paddingTop: spacing.xl }}>
        <AppText variant="display" weight="bold">
          Todos
        </AppText>
        <AppText
          variant="body"
          color="#6B7280"
          style={{ marginTop: spacing.sm, textAlign: 'center' }}
        >
          Your mobile task manager
        </AppText>
      </View>

      <Surface
        elevationLevel="md"
        style={{ marginTop: spacing.xl, padding: spacing.base }}
      >
        <AppText variant="subheading" weight="semibold">
          Welcome to the design system
        </AppText>
        <AppText
          variant="body"
          style={{ marginTop: spacing.sm }}
          color="#6B7280"
        >
          Foundational atoms, tokens, and layout templates are ready to use.
        </AppText>
      </Surface>

      <View style={{ marginTop: spacing.xl, gap: spacing.sm }}>
        <AppButton title="Primary Action" variant="primary" fullWidth />
        <AppButton title="Secondary Action" variant="secondary" fullWidth />
        <AppButton title="Ghost Action" variant="ghost" fullWidth />
      </View>
    </ScreenLayout>
  );
}
