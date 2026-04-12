import { render } from '@testing-library/react-native';
import { describe, expect, it } from 'vitest';
import { AppLabel } from './AppLabel';

describe('AppLabel', () => {
  it('renders children correctly', () => {
    const { getByText } = render(<AppLabel>Email</AppLabel>);
    expect(getByText('Email')).toBeTruthy();
  });

  it('appends an asterisk when required is true', () => {
    const { getByText } = render(<AppLabel required>Password</AppLabel>);
    expect(getByText('Password *')).toBeTruthy();
  });

  it('does not append an asterisk when required is false', () => {
    const { getByText } = render(<AppLabel required={false}>Name</AppLabel>);
    expect(getByText('Name')).toBeTruthy();
  });

  it('passes testID through to the underlying element', () => {
    const { getByTestId } = render(
      <AppLabel testID="form-label">Username</AppLabel>,
    );
    expect(getByTestId('form-label')).toBeTruthy();
  });
});
