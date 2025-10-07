import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';

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
      // Store token
      localStorage.setItem('token', token);
      
      // Fetch user data and update Redux state
      const fetchUserData = async () => {
        try {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const response = await fetch(`${apiUrl}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            
            // Update auth state
            dispatch({ 
              type: 'auth/signIn/fulfilled', 
              payload: { 
                token, 
                user: data.user,
                organization: data.organization
              } 
            });

            // Set organization if available
            if (data.organization) {
              dispatch({
                type: 'organizations/setDefaultOrganization',
                payload: data.organization
              });
            }

            // Navigate to app
            navigate('/app', { replace: true });
          } else {
            throw new Error('Failed to fetch user data');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          navigate('/signin', { 
            state: { 
              error: 'Authentication failed. Please try again.' 
            } 
          });
        }
      };

      fetchUserData();
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
