import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { beforeEach, describe, expect, it } from 'vitest';
import HomeScreen from './index';

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

describe('Home route', () => {
  beforeEach(() => {
    state.currentUser = null;
  });

  it('redirects to /login when there is no authenticated session', () => {
    render(<HomeScreen />);

    expect(screen.getByText('/login')).toBeTruthy();
  });

  it('renders signed-in content when session exists', () => {
    state.currentUser = { email: 'user@example.com' };

    render(<HomeScreen />);

    expect(screen.getByText('You are signed in')).toBeTruthy();
    expect(screen.getByText('Welcome, user@example.com.')).toBeTruthy();
  });
});
