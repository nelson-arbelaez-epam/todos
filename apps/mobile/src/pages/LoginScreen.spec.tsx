import { fireEvent, render, screen } from '@testing-library/react-native';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginScreen } from './LoginScreen';

const loginActionMock = vi.fn();
const storeState = {
  isLoading: false,
  error: null as null | string,
  login: loginActionMock,
};

vi.mock('@/store/session-store', () => ({
  useSessionStore: (selector: (state: typeof storeState) => unknown) =>
    selector(storeState),
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    loginActionMock.mockReset();
    storeState.isLoading = false;
    storeState.error = null;
  });

  it('shows loading and error state in LoginForm', () => {
    storeState.isLoading = true;
    storeState.error = 'Login failed';
    render(<LoginScreen />);
    expect(screen.getByText('Sign in')).toBeTruthy();
    expect(screen.getByText('Login failed')).toBeTruthy();
  });

  it('submits the form via user input and button press', () => {
    render(<LoginScreen />);
    fireEvent.changeText(screen.getByTestId('login-email'), 'user@example.com');
    fireEvent.changeText(screen.getByTestId('login-password'), 'password123');
    fireEvent.press(screen.getByTestId('login-submit'));
    expect(loginActionMock).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
  });
});
