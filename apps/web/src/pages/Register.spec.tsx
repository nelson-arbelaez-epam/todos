import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  resetSessionStoreForTests,
  useSessionStore,
} from '../store/session-store';
import Register from './Register';

const navigateMock = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}));

vi.mock('../components/organisms/RegisterForm/RegisterForm', () => ({
  RegisterForm: () => <div>register form</div>,
}));

describe('Register page', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    resetSessionStoreForTests();
  });

  it('redirects authenticated users away from the register page', async () => {
    useSessionStore.setState({
      currentUser: {
        uid: 'uid123',
        email: 'user@example.com',
        idToken: 'token-123',
        expiresIn: '3600',
      },
    });

    render(<Register />);

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
    });
  });
});
