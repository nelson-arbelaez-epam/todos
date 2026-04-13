import { render, screen } from '@testing-library/react-native';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RegisterScreen } from './RegisterScreen';

const registerFormMock = vi.fn();
const registerActionMock = vi.fn();

const storeState = {
  isLoading: false,
  error: null as null | string,
  register: registerActionMock,
};

vi.mock('../store/session-store', () => ({
  useSessionStore: (selector: (state: typeof storeState) => unknown) =>
    selector(storeState),
}));

vi.mock('../components/organisms/RegisterForm', () => ({
  RegisterForm: (props: unknown) => {
    registerFormMock(props);
    return null;
  },
}));

describe('RegisterScreen', () => {
  beforeEach(() => {
    registerFormMock.mockReset();
    registerActionMock.mockReset();
    storeState.isLoading = false;
    storeState.error = null;
  });

  it('wires isLoading and error from store into RegisterForm props', () => {
    storeState.isLoading = true;
    storeState.error = 'Registration failed';

    render(<RegisterScreen />);

    expect(registerFormMock).toHaveBeenCalledOnce();
    expect(registerFormMock).toHaveBeenCalledWith(
      expect.objectContaining({
        isLoading: true,
        errorMessage: 'Registration failed',
        onSubmit: expect.any(Function),
      }),
    );
  });

  it('maps RegisterForm submit args to register payload object', () => {
    render(<RegisterScreen />);

    const props = registerFormMock.mock.calls[0]?.[0] as {
      onSubmit: (email: string, password: string) => void;
    };

    props.onSubmit('user@example.com', 'password123');

    expect(registerActionMock).toHaveBeenCalledOnce();
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
