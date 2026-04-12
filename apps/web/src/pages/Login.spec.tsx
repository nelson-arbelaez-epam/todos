import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  resetSessionStoreForTests,
  useSessionStore,
} from '../store/session-store';
import Login from './Login';

const navigateMock = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}));

vi.mock('../components/organisms/LoginForm/LoginForm', () => ({
  LoginForm: () => <div>login form</div>,
}));

describe('Login page', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    resetSessionStoreForTests();
  });

  it('redirects authenticated users away from the login page', async () => {
    useSessionStore.setState({
      currentUser: {
        uid: 'uid123',
        email: 'user@example.com',
        idToken: 'token-123',
        expiresIn: '3600',
      },
    });

    render(<Login />);

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('renders the login form when not authenticated', () => {
    const { getByText } = render(<Login />);
    expect(getByText('login form')).toBeInTheDocument();
  });
});
