import { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signUp, clearError } from '../features/auth/authSlice';
import { Link, useNavigate } from 'react-router-dom';

export default function SignUp() {
  const dispatch = useDispatch();
  const { token, loading, error } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', confirm: '' });
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [errors, setErrors] = useState({ username: false, password: false, confirm: false });
  const [touched, setTouched] = useState({ username: false, password: false, confirm: false });

  // When the user edits the username, clear any server 409 error and local username error
  useEffect(() => {
    if (error?.status === 409) {
      dispatch(clearError());
    }
    if (errors.username) {
      setErrors((prev) => ({ ...prev, username: false }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.username]);

  // Password validation
  const passwordValidation = useMemo(() => ({
    minLength: form.password.length >= 8,
    hasUppercase: /[A-Z]/.test(form.password),
    hasLowercase: /[a-z]/.test(form.password),
    hasNumber: /\d/.test(form.password)
  }), [form.password]);

  // Navigate to app when authenticated, avoiding early return to keep hooks consistent
  useEffect(() => {
    if (token) {
      navigate('/app', { replace: true });
    }
  }, [token, navigate]);

  const validateForm = () => {
    const newErrors = {
      username: !form.username.trim(),
      password: !form.password.trim(),
      confirm: !form.confirm.trim() || form.password !== form.confirm
    };
    setErrors(newErrors);
    setTouched({ username: true, password: true, confirm: true });
    return !newErrors.username && !newErrors.password && !newErrors.confirm;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    
    if (validateForm()) {
      try {
        const result = await dispatch(signUp({ username: form.username, password: form.password })).unwrap();
        console.log('SignUp successful:', result);
      } catch (error) {
        if (error.status === 409) {
          setErrors(prev => ({ ...prev, username: true }));
          // Redirect to Sign In with prefilled username and a helpful notice
          navigate('/signin', {
            state: {
              prefillUsername: form.username,
              notice: 'An account with this username already exists. Please sign in.'
            }
          });
          return;
        }
        // Optionally log other errors in dev
      }
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'username') {
      setErrors(prev => ({ ...prev, username: !form.username.trim() }));
    } else if (field === 'password') {
      setErrors(prev => ({ ...prev, password: !form.password.trim() }));
    } else if (field === 'confirm') {
      setErrors(prev => ({ ...prev, confirm: !form.confirm.trim() || form.password !== form.confirm }));
    }
  };

  const ValidationIcon = ({ isValid }) => (
    <div className="flex-shrink-0 w-4 h-4">
      {isValid ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check h-3 w-3 text-green-500" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x h-3 w-3 text-gray-400" aria-hidden="true">
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      )}
    </div>
  );

  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye h-4 w-4" aria-hidden="true">
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-off h-4 w-4" aria-hidden="true">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg px-8 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Sign Up</h2>
            <p className="text-gray-600 text-sm">Create an account to get started</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error.status === 409 ? 'Username already exists. Please choose a different username.' : error.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50" htmlFor="username">Username</label>
              <input
                type="text"
                className={`flex h-11 w-full rounded-xl border ${(errors.username || error?.status === 409) && touched.username ? 'border-red-300' : 'border-gray-200'} bg-white px-4 py-2 text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 ${(errors.username || error?.status === 409) && touched.username ? 'focus-visible:ring-red-500 focus-visible:border-red-500' : 'focus-visible:ring-blue-500 focus-visible:border-blue-500'} focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 shadow-inner pr-10`}
                id="username"
                placeholder="Choose a username"
                value={form.username}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm({ ...form, username: value });
                  if (errors.username) setErrors((prev) => ({ ...prev, username: false }));
                  if (error) dispatch(clearError());
                }}
                onBlur={() => handleBlur('username')}
              />
              {touched.username && (errors.username || error?.status === 409) && (
                <p className="text-sm text-red-600">
                  {error?.status === 409 ? 'Username already exists. Please choose a different username.' : 'Username is required'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50" htmlFor="password">Password</label>
              <div className="relative">
                <input type={show1 ? "text" : "password"} className={`flex h-11 w-full rounded-xl border ${errors.password && touched.password ? 'border-red-300' : 'border-gray-200'} bg-white px-4 py-2 text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 ${errors.password && touched.password ? 'focus-visible:ring-red-500 focus-visible:border-red-500' : 'focus-visible:ring-blue-500 focus-visible:border-blue-500'} focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 shadow-inner pr-10`} id="password" placeholder="Create a password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} onBlur={() => handleBlur('password')} />
                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white hover:text-gray-600 active:scale-[0.98] rounded-lg text-xs absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400" type="button" onClick={() => setShow1(!show1)}>
                  {show1 ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              {/* Password Requirements */}
              {form.password && (
                <div className="space-y-1 mt-3">
                  <div className="flex items-center gap-2 text-sm">
                    <ValidationIcon isValid={passwordValidation.minLength} />
                    <span className={passwordValidation.minLength ? 'text-green-500' : 'text-gray-500'}>At least 8 characters</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ValidationIcon isValid={passwordValidation.hasUppercase} />
                    <span className={passwordValidation.hasUppercase ? 'text-green-500' : 'text-gray-500'}>One uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ValidationIcon isValid={passwordValidation.hasLowercase} />
                    <span className={passwordValidation.hasLowercase ? 'text-green-500' : 'text-gray-500'}>One lowercase letter</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ValidationIcon isValid={passwordValidation.hasNumber} />
                    <span className={passwordValidation.hasNumber ? 'text-green-500' : 'text-gray-500'}>One number</span>
                  </div>
                </div>
              )}

              {errors.password && touched.password && (
                <p className="text-sm text-red-600">Password is required</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50" htmlFor="confirmPassword">Confirm Password</label>
              <div className="relative">
                <input type={show2 ? "text" : "password"} className={`flex h-11 w-full rounded-xl border ${errors.confirm && touched.confirm ? 'border-red-300' : 'border-gray-200'} bg-white px-4 py-2 text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 ${errors.confirm && touched.confirm ? 'focus-visible:ring-red-500 focus-visible:border-red-500' : 'focus-visible:ring-blue-500 focus-visible:border-blue-500'} focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 shadow-inner pr-10`} id="confirmPassword" placeholder="Confirm your password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} onBlur={() => handleBlur('confirm')} />
                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white hover:text-gray-600 active:scale-[0.98] rounded-lg text-xs absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400" type="button" onClick={() => setShow2(!show2)}>
                  {show2 ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.confirm && touched.confirm && (
                <p className="text-sm text-red-600">
                  {!form.confirm.trim() ? 'Please confirm your password' : 'Passwords do not match'}
                </p>
              )}
            </div>

            <button disabled={loading} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white bg-blue-500 text-white shadow-md hover:shadow-lg hover:shadow-blue-500/20 hover:bg-blue-600 active:scale-[0.98] h-10 px-6 py-2 w-full" type="submit">
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-600">Already have an account? <Link to="/signin" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-blue-500 underline-offset-4 hover:underline p-0 h-auto">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
