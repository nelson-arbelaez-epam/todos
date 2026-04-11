import { StyleSheet, View, type ViewProps } from 'react-native';
import { colors, type ElevationToken, elevation, radii } from '../../../theme';

export interface SurfaceProps extends ViewProps {
  elevationLevel?: ElevationToken;
  rounded?: boolean;
  children: React.ReactNode;
}

/**
 * Surface – presentational atom representing an elevated card-like container.
 * Applies background color, border radius, and platform-appropriate shadow
 * from the design token elevation scale.
 */
export function Surface({
  elevationLevel = 'md',
  rounded = true,
  style,
  children,
  ...rest
}: SurfaceProps) {
  return (
    <View
      style={[
        styles.base,
        elevation[elevationLevel],
        rounded && styles.rounded,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surfaceElevated,
  },
  rounded: {
    borderRadius: radii.lg,
  },
});
