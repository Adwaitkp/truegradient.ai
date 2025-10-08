import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchCurrentUser } from '../features/auth/authSlice';
import { setDefaultOrganization } from '../features/organizations/organizationsSlice';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      // Handle OAuth error
      navigate('/signin', { 
        state: { 
          error: 'Authentication failed. Please try again.' 
        } 
      });
      return;
    }

    if (token) {
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Fetch user data using the auth thunk
      const loadUser = async () => {
        try {
          const result = await dispatch(fetchCurrentUser()).unwrap();
          
          // Set organization if available
          if (result.organization) {
            dispatch(setDefaultOrganization(result.organization));
          }

          // Navigate to app
          navigate('/app', { replace: true });
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Clear invalid token
          localStorage.removeItem('token');
          navigate('/signin', { 
            state: { 
              error: 'Authentication failed. Please try again.' 
            } 
          });
        }
      };

      loadUser();
    } else {
      // No token or error, redirect to signin
      navigate('/signin');
    }
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Authenticating...</p>
      </div>
    </div>
  );
}
