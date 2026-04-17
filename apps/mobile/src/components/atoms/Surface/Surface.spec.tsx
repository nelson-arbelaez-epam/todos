import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { describe, expect, it } from 'vitest';
import { Surface } from './Surface';

describe('Surface', () => {
  it('renders children', () => {
    const { getByText } = render(
      <Surface>
        <Text>Card content</Text>
      </Surface>,
    );
    expect(getByText('Card content')).toBeTruthy();
  });

  it('accepts an elevationLevel prop', () => {
    const { getByTestId } = render(
      <Surface testID="surface" elevationLevel="lg">
        <Text>Elevated</Text>
      </Surface>,
    );
    expect(getByTestId('surface')).toBeTruthy();
  });

  it('accepts elevationLevel none', () => {
    const { getByTestId } = render(
      <Surface testID="flat-surface" elevationLevel="none">
        <Text>Flat</Text>
      </Surface>,
    );
    expect(getByTestId('flat-surface')).toBeTruthy();
  });

  it('renders with rounded corners by default', () => {
    const { getByTestId } = render(
      <Surface testID="rounded-surface">
        <Text>Rounded</Text>
      </Surface>,
    );
    expect(getByTestId('rounded-surface')).toBeTruthy();
  });

  it('can disable rounded corners', () => {
    const { getByTestId } = render(
      <Surface testID="square-surface" rounded={false}>
        <Text>Square</Text>
      </Surface>,
    );
    expect(getByTestId('square-surface')).toBeTruthy();
  });
});
