import { render } from '@testing-library/react-native';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginScreen } from './LoginScreen';

const loginFormMock = vi.fn();
const loginActionMock = vi.fn();

const storeState = {
  isLoading: false,
  error: null as null | string,
  login: loginActionMock,
};

vi.mock('../store/session-store', () => ({
  useSessionStore: (selector: (state: typeof storeState) => unknown) =>
    selector(storeState),
}));

vi.mock('../components/organisms/LoginForm', () => ({
  LoginForm: (props: unknown) => {
    loginFormMock(props);
    return null;
  },
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    loginFormMock.mockReset();
    loginActionMock.mockReset();
    storeState.isLoading = false;
    storeState.error = null;
  });

  it('wires isLoading and error from store into LoginForm props', () => {
    storeState.isLoading = true;
    storeState.error = 'Login failed';

    render(<LoginScreen />);

    expect(loginFormMock).toHaveBeenCalledOnce();
    expect(loginFormMock).toHaveBeenCalledWith(
      expect.objectContaining({
        isLoading: true,
        errorMessage: 'Login failed',
        onSubmit: expect.any(Function),
      }),
    );
  });

  it('maps LoginForm submit args to login payload object', () => {
    render(<LoginScreen />);

    const props = loginFormMock.mock.calls[0]?.[0] as {
      onSubmit: (email: string, password: string) => void;
    };

    props.onSubmit('user@example.com', 'password123');

    expect(loginActionMock).toHaveBeenCalledOnce();
    expect(loginActionMock).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
  });
});
