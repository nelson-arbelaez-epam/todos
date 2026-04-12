import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { beforeEach, describe, expect, it } from 'vitest';
import RegisterRoute from './register';

const state = {
  currentUser: null as null | { email: string },
};

vi.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => (
    <Text testID="redirect">{href}</Text>
  ),
}));

vi.mock('@/store/session-store', () => ({
  useSessionStore: (selector: (store: typeof state) => unknown) =>
    selector(state),
}));

vi.mock('@/pages/RegisterScreen', () => ({
  RegisterScreen: () => <Text testID="register-screen">register screen</Text>,
}));

describe('Register route', () => {
  beforeEach(() => {
    state.currentUser = null;
  });

  it('renders RegisterScreen when user is signed out', () => {
    render(<RegisterRoute />);

    expect(screen.getByTestId('register-screen')).toBeTruthy();
  });

  it('redirects to / when user is already authenticated', () => {
    state.currentUser = { email: 'user@example.com' };

    render(<RegisterRoute />);

    expect(screen.getByText('/')).toBeTruthy();
  });
});
