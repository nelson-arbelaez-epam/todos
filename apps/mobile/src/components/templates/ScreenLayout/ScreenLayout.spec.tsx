import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { describe, expect, it } from 'vitest';
import { ScreenLayout } from './ScreenLayout';

describe('ScreenLayout', () => {
  it('renders children', () => {
    const { getByText } = render(
      <ScreenLayout>
        <Text>Screen content</Text>
      </ScreenLayout>,
    );
    expect(getByText('Screen content')).toBeTruthy();
  });

  it('renders children in scrollable mode', () => {
    const { getByText } = render(
      <ScreenLayout scrollable>
        <Text>Scrollable content</Text>
      </ScreenLayout>,
    );
    expect(getByText('Scrollable content')).toBeTruthy();
  });

  it('accepts a custom horizontalPadding', () => {
    const { getByText } = render(
      <ScreenLayout horizontalPadding={24}>
        <Text>Padded content</Text>
      </ScreenLayout>,
    );
    expect(getByText('Padded content')).toBeTruthy();
  });
});
