import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AuthEventWrapper({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleUnauthorized = () => {
      // Avoid redirect loops or redirecting if already on login/register pages
      if (location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/') {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      }
    };

    window.addEventListener('auth_unauthorized', handleUnauthorized);
    
    return () => {
      window.removeEventListener('auth_unauthorized', handleUnauthorized);
    };
  }, [navigate, location.pathname]);

  return children;
}
