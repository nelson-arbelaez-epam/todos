import { fireEvent, render } from '@testing-library/react-native';
import { describe, expect, it, vi } from 'vitest';
import { AppButton } from './AppButton';

describe('AppButton', () => {
  it('renders the title text', () => {
    const { getByText } = render(<AppButton title="Submit" />);
    expect(getByText('Submit')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = vi.fn();
    const { getByRole } = render(
      <AppButton title="Tap me" onPress={onPress} />,
    );
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('exposes disabled accessibilityState when the disabled prop is set', () => {
    const { getByRole } = render(<AppButton title="Disabled" disabled />);
    const button = getByRole('button');
    expect(button.props.accessibilityState.disabled).toBe(true);
  });

  it('shows an ActivityIndicator when loading', () => {
    const { queryByText, getByRole } = render(
      <AppButton title="Loading" loading />,
    );
    // Title text should be hidden while loading
    expect(queryByText('Loading')).toBeNull();
    // The button should still be present
    expect(getByRole('button')).toBeTruthy();
  });

  it('renders primary variant by default', () => {
    const { getByRole } = render(<AppButton title="Primary" />);
    expect(getByRole('button')).toBeTruthy();
  });

  it('renders secondary variant', () => {
    const { getByRole } = render(
      <AppButton title="Secondary" variant="secondary" />,
    );
    expect(getByRole('button')).toBeTruthy();
  });

  it('renders danger variant', () => {
    const { getByRole } = render(<AppButton title="Delete" variant="danger" />);
    expect(getByRole('button')).toBeTruthy();
  });

  it('renders ghost variant', () => {
    const { getByRole } = render(<AppButton title="Ghost" variant="ghost" />);
    expect(getByRole('button')).toBeTruthy();
  });

  it('has busy accessibility state when loading', () => {
    const { getByRole } = render(<AppButton title="Loading" loading />);
    const button = getByRole('button');
    expect(button.props.accessibilityState).toEqual({
      disabled: true,
      busy: true,
    });
  });
});
