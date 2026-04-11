import { render } from '@testing-library/react-native';
import { describe, expect, it } from 'vitest';
import { AppText } from './AppText';

describe('AppText', () => {
  it('renders children correctly', () => {
    const { getByText } = render(<AppText>Hello world</AppText>);
    expect(getByText('Hello world')).toBeTruthy();
  });

  it('applies the body variant by default', () => {
    const { getByText } = render(<AppText>Body text</AppText>);
    const element = getByText('Body text');
    expect(element).toBeTruthy();
  });

  it('renders heading variant', () => {
    const { getByText } = render(
      <AppText variant="heading">Heading text</AppText>,
    );
    expect(getByText('Heading text')).toBeTruthy();
  });

  it('renders display variant', () => {
    const { getByText } = render(
      <AppText variant="display">Display text</AppText>,
    );
    expect(getByText('Display text')).toBeTruthy();
  });

  it('renders caption variant', () => {
    const { getByText } = render(
      <AppText variant="caption">Caption text</AppText>,
    );
    expect(getByText('Caption text')).toBeTruthy();
  });

  it('renders label variant', () => {
    const { getByText } = render(<AppText variant="label">Label text</AppText>);
    expect(getByText('Label text')).toBeTruthy();
  });

  it('accepts a custom color prop', () => {
    const { getByText } = render(<AppText color="#FF0000">Red text</AppText>);
    expect(getByText('Red text')).toBeTruthy();
  });

  it('accepts a weight prop', () => {
    const { getByText } = render(<AppText weight="bold">Bold text</AppText>);
    expect(getByText('Bold text')).toBeTruthy();
  });

  it('passes testID through to the underlying Text', () => {
    const { getByTestId } = render(
      <AppText testID="app-text">Accessible</AppText>,
    );
    expect(getByTestId('app-text')).toBeTruthy();
  });
});
