import { fireEvent, render, screen } from '@testing-library/react-native';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RegisterScreen } from './RegisterScreen';

const registerActionMock = vi.fn();
const storeState = {
  isLoading: false,
  error: null as null | string,
  register: registerActionMock,
};

vi.mock('@/store/session-store', () => ({
  useSessionStore: (selector: (state: typeof storeState) => unknown) =>
    selector(storeState),
}));

describe('RegisterScreen', () => {
  beforeEach(() => {
    registerActionMock.mockReset();
    storeState.isLoading = false;
    storeState.error = null;
  });

  it('shows loading and error state in RegisterForm', () => {
    storeState.isLoading = true;
    storeState.error = 'Registration failed';
    render(<RegisterScreen />);
    expect(screen.getByText('Create an account')).toBeTruthy();
    expect(screen.getByText('Registration failed')).toBeTruthy();
  });

  it('submits the form via user input and button press', () => {
    render(<RegisterScreen />);
    fireEvent.changeText(
      screen.getByTestId('register-email'),
      'user@example.com',
    );
    fireEvent.changeText(
      screen.getByTestId('register-password'),
      'password123',
    );
    fireEvent.press(screen.getByTestId('register-submit'));
    // fallback: try to find the button by text if AppButton is not available
    // expect(screen.getByText('Sign up')).toBeTruthy(); // If button text is 'Sign up'
    expect(registerActionMock).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
  });

  it('renders a Sign in link for existing users', () => {
    render(<RegisterScreen />);
    expect(screen.getByText('Sign in')).toBeTruthy();
  });
});
