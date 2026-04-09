import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterForm } from '../components/organisms/RegisterForm/RegisterForm';
import { useRegister } from '../hooks/useRegister';

/**
 * Register page – container component that wires useRegister hook to RegisterForm.
 * On successful registration, redirects to the login page.
 */
const Register = () => {
  const { isLoading, error, registeredUser, register } = useRegister();
  const navigate = useNavigate();

  useEffect(() => {
    if (registeredUser) {
      navigate('/login?registered=true', { replace: true });
    }
  }, [registeredUser, navigate]);

  return (
    <div style={{ padding: '48px 16px' }}>
      <RegisterForm isLoading={isLoading} error={error} onSubmit={register} />
    </div>
  );
};

export default Register;
