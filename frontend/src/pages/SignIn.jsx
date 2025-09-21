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

          <p className="text-center mt-6 text-sm text-gray-600">Don't have an account? <Link to="/signup" className="text-blue-500 hover:text-blue-600 font-medium hover:underline">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
}
