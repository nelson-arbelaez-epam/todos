import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/organisms/LoginForm/LoginForm';
import { useSessionStore } from '../store/session-store';

/**
 * Login page – container component that wires session-store state/actions to LoginForm.
 * Already-authenticated users are redirected to the home page.
 */
const Login = () => {
  const isLoading = useSessionStore((state) => state.isLoading);
  const error = useSessionStore((state) => state.error);
  const currentUser = useSessionStore((state) => state.currentUser);
  const login = useSessionStore((state) => state.login);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <LoginForm isLoading={isLoading} error={error} onSubmit={login} />
    </div>
  );
};

export default Login;
