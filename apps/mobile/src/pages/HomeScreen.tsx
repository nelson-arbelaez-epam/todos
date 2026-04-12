import { View } from 'react-native';

import { AppButton, AppText, Surface } from '../components/atoms';
import { ScreenLayout } from '../components/templates';

export interface HomeScreenProps {
  currentUserEmail: string;
}

/**
 * HomeScreen – page-level composition for the authenticated home route.
 * Receives route-resolved data via props and delegates UI to presentational atoms/templates.
 */
export function HomeScreen({ currentUserEmail }: HomeScreenProps) {
  return (
    <ScreenLayout scrollable>
      <View className="items-center pt-8">
        <AppText variant="display" weight="bold">
          You are signed in
        </AppText>
        <AppText
          variant="body"
          className="mt-2 text-center text-text-secondary"
        >
          Welcome, {currentUserEmail}.
        </AppText>
      </View>

      <Surface elevationLevel="md" className="mt-8 p-4">
        <AppText variant="subheading" weight="semibold">
          Welcome to the design system
        </AppText>
        <AppText variant="body" className="mt-2 text-text-secondary">
          Foundational atoms, tokens, and layout templates are ready to use.
        </AppText>
      </Surface>

      <View className="mt-8 gap-2">
        <AppButton title="Primary Action" variant="primary" fullWidth />
        <AppButton title="Secondary Action" variant="secondary" fullWidth />
        <AppButton title="Ghost Action" variant="ghost" fullWidth />
      </View>
    </ScreenLayout>
  );
}
