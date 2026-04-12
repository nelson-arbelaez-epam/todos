import { View, type ViewProps } from 'react-native';
import { type ElevationToken } from '../../../theme';
import { cn } from '../../../utils/cn';

export interface SurfaceProps extends ViewProps {
  elevationLevel?: ElevationToken;
  rounded?: boolean;
  children: React.ReactNode;
}

const elevationClassNames: Record<ElevationToken, string> = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
};

/**
 * Surface – presentational atom representing an elevated card-like container.
 * Applies background color, border radius, and platform-appropriate shadow
 * from the design token elevation scale.
 */
export function Surface({
  elevationLevel = 'md',
  rounded = true,
  className,
  children,
  ...rest
}: SurfaceProps) {
  return (
    <View
      className={cn(
        'bg-surface-elevated',
        rounded && 'rounded-xl',
        elevationClassNames[elevationLevel],
        className,
      )}
      {...rest}
    >
      {children}
    </View>
  );
}
