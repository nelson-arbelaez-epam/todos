import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  type ViewProps,
} from 'react-native';
import { colors, spacing } from '../../../theme';

export interface ScreenLayoutProps extends ViewProps {
  children: React.ReactNode;
  /** When true the layout wraps content in a ScrollView */
  scrollable?: boolean;
  /** Horizontal padding applied to the content area */
  horizontalPadding?: number;
}

/**
 * ScreenLayout – presentational template that provides a safe-area-aware
 * full-screen wrapper.  Contains no data-fetching or side-effect logic;
 * all composition decisions live in the screen/page layer.
 */
export function ScreenLayout({
  children,
  scrollable = false,
  horizontalPadding = spacing.base,
  style,
  ...rest
}: ScreenLayoutProps) {
  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        { paddingHorizontal: horizontalPadding },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[styles.content, { paddingHorizontal: horizontalPadding }, style]}
      {...rest}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: spacing.base,
  },
});
