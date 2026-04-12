import { render } from '@testing-library/react-native';
import { describe, expect, it } from 'vitest';
import { AppInput } from './AppInput';

describe('AppInput', () => {
  it('renders without a label', () => {
    const { getByPlaceholderText } = render(
      <AppInput placeholder="Enter text" />,
    );
    expect(getByPlaceholderText('Enter text')).toBeTruthy();
  });

  it('renders with a label', () => {
    const { getByText } = render(<AppInput label="Email" />);
    expect(getByText('Email')).toBeTruthy();
  });

  it('shows an asterisk on the label when required', () => {
    const { getByText } = render(<AppInput label="Password" required />);
    expect(getByText('Password *')).toBeTruthy();
  });

  it('renders an error message when error prop is set', () => {
    const { getByText } = render(<AppInput error="This field is required" />);
    expect(getByText('This field is required')).toBeTruthy();
  });

  it('renders a hint when hint prop is set', () => {
    const { getByText } = render(<AppInput hint="Enter your email address" />);
    expect(getByText('Enter your email address')).toBeTruthy();
  });

  it('prefers error over hint when both are provided', () => {
    const { getByText, queryByText } = render(
      <AppInput error="Required" hint="Enter email" />,
    );
    expect(getByText('Required')).toBeTruthy();
    expect(queryByText('Enter email')).toBeNull();
  });

  it('renders the accessibility label from the label prop', () => {
    const { getByLabelText } = render(<AppInput label="Username" />);
    expect(getByLabelText('Username')).toBeTruthy();
  });
});
