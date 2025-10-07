import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signIn, clearError } from '../features/auth/authSlice';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function SignIn() {
  const dispatch = useDispatch();
  const { token, loading, error } = useSelector((s) => s.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({ username: false, password: false });
  const [touched, setTouched] = useState({ username: false, password: false });

  // If redirected from SignUp due to 409, prefill the username
  useEffect(() => {
    const prefill = location.state?.prefillUsername;
    if (prefill) {
      setForm((prev) => ({ ...prev, username: prefill }));
      setTouched((prev) => ({ ...prev, username: true }));
    }
  }, [location.state]);

  // Navigate to app when authenticated, avoiding early return to keep hooks consistent
  useEffect(() => {
    if (token) {
      navigate('/app', { replace: true });
    }
  }, [token, navigate]);

  const validateForm = () => {
    const newErrors = {
      username: !form.username.trim(),
      password: !form.password.trim()
    };
    setErrors(newErrors);
    setTouched({ username: true, password: true });
    return !newErrors.username && !newErrors.password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    
    if (validateForm()) {
      try {
        const result = await dispatch(signIn(form)).unwrap();
        console.log('SignIn successful:', result);
      } catch (error) {
        console.error('SignIn error:', error);
      }
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'username') {
      setErrors(prev => ({ ...prev, username: !form.username.trim() }));
    } else if (field === 'password') {
      setErrors(prev => ({ ...prev, password: !form.password.trim() }));
    }
  };

  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye h-4 w-4" aria-hidden="true">
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const handleGoogleSignIn = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg px-8 py-12 border border-gray-200">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-600 text-sm">Enter your credentials to access your account</p>
          </div>

          {/* Redirect Notice from SignUp */}
          {location.state?.notice && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
              {location.state.notice}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900 mb-2" htmlFor="username">Username</label>
              <input
                type="text"
                className={`flex h-11 w-full rounded-xl border ${errors.username && touched.username ? 'border-red-300' : 'border-gray-300'} bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 ${errors.username && touched.username ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-blue-500 focus:border-blue-500'} disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200`}
                id="username"
                placeholder="Enter your username"
                value={form.username}
                onChange={(e) => {
                  dispatch(clearError());
                  setForm({ ...form, username: e.target.value });
                }}
                onBlur={() => handleBlur('username')}
              />
              {errors.username && touched.username && (
                <p className="text-sm text-red-600">Username is required</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900 mb-2" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  className={`flex h-11 w-full rounded-xl border ${errors.password && touched.password ? 'border-red-300' : 'border-gray-300'} bg-white px-4 py-2 pr-10 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 ${errors.password && touched.password ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-blue-500 focus:border-blue-500'} disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200`}
                  id="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => {
                    dispatch(clearError());
                    setForm({ ...form, password: e.target.value });
                  }}
                  onBlur={() => handleBlur('password')}
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200">
                  <EyeIcon />
                </button>
              </div>
              {errors.password && touched.password && (
                <p className="text-sm text-red-600">Password is required</p>
              )}
            </div>

            <button disabled={loading} type="submit" className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 shadow-sm hover:shadow-md mt-6">
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button 
            onClick={handleGoogleSignIn}
            type="button"
            className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>

          <p className="text-center mt-6 text-sm text-gray-600">Don't have an account? <Link to="/signup" className="text-blue-500 hover:text-blue-600 font-medium hover:underline">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
}
