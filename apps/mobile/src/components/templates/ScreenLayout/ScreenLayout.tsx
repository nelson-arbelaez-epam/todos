import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  type ViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing } from '@/theme';
import { cn } from '@/utils/cn';

export interface ScreenLayoutProps extends ViewProps {
  children: React.ReactNode;
  /** When true the layout wraps content in a ScrollView */
  scrollable?: boolean;
  /** Horizontal padding applied to the content area */
  horizontalPadding?: number;
}

function horizontalPaddingClassName(horizontalPadding: number) {
  switch (horizontalPadding) {
    case spacing.xs:
      return 'px-1';
    case spacing.sm:
      return 'px-2';
    case spacing.md:
      return 'px-3';
    case spacing.base:
      return 'px-4';
    case spacing.lg:
      return 'px-6';
    case spacing.xl:
      return 'px-8';
    case spacing['2xl']:
      return 'px-12';
    case spacing['3xl']:
      return 'px-16';
    default:
      return 'px-4';
  }
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
  className,
  ...rest
}: ScreenLayoutProps) {
  const paddingClassName = horizontalPaddingClassName(horizontalPadding);

  const content = scrollable ? (
    <ScrollView
      className="flex-1"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View className={cn('grow py-4', paddingClassName, className)} {...rest}>
        {children}
      </View>
    </ScrollView>
  ) : (
    <View className={cn('flex-1', paddingClassName, className)} {...rest}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
