import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterForm } from '../components/organisms/RegisterForm/RegisterForm';
import { useSessionStore } from '../store/session-store';

/**
 * Register page – container component that wires session-store state/actions to RegisterForm.
 * On successful registration, redirects to the app home.
 */
const Register = () => {
  const isLoading = useSessionStore((state) => state.isLoading);
  const error = useSessionStore((state) => state.error);
  const currentUser = useSessionStore((state) => state.currentUser);
  const register = useSessionStore((state) => state.register);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  return (
    <div style={{ padding: '48px 16px' }}>
      <RegisterForm isLoading={isLoading} error={error} onSubmit={register} />
    </div>
  );
};

export default Register;
