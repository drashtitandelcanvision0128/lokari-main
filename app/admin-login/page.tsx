'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { loginWithCredentials } from '@/lib/auth/api';
import { persistUserSession } from '@/lib/auth/session';
import { buildProfileFromUser } from '@/lib/auth/session';
import { getDashboardUrl } from '@/lib/auth/session'
import { useAppDispatch } from '@/lib/store/hooks';
import { setUser, setProfile } from '@/lib/store/slices/authSlice';

export default function AdminLoginPage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [canShowPage, setCanShowPage] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const currentUser = getCurrentUser();
    console.log('Current User:', currentUser);
    // if (currentUser) {
    //   router.replace('/dashboard');
    //   return;
    // }
    if (currentUser) {
      router.replace(getDashboardUrl(currentUser.role))
      return
    }

    setCanShowPage(true);

    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    };

    checkTheme();
    const interval = setInterval(checkTheme, 100);
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Call real backend login
      const { user, token } = await loginWithCredentials({
        email: formData.email,
        password: formData.password
      });
      console.log('Logged in user:', user);
      console.log('Role:', user.role);

      // Check if user is admin
      if (user.role !== 'admin') {
        setError('Access denied. Admin account required.');
        setIsLoading(false);
        return;
      }

      // Store token and user session
      // persistUserSession(user, token);

      // Dispatch custom event to trigger navbar update
      // window.dispatchEvent(new Event('storage'));
      // window.dispatchEvent(new CustomEvent('adminSessionChanged'));

      // Redirect to admin dashboard
      // router.push('/admin');

      persistUserSession(user, token);

      const profile = buildProfileFromUser(user);

      dispatch(setUser(user));
      dispatch(setProfile(profile));

      router.replace('/admin');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!canShowPage) {
    return null;
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-[#f9f9f7]'} px-4`}>
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 text-xl font-bold font-headline mb-6">
            <img src="/AgriwareLogo.svg" alt="Lokhari Logo" className="w-8 h-8" />
            <span className={isDark ? 'text-white' : 'text-[#0b5d68]'}>Lokhari</span>
          </Link>
          <h1 className={`font-headline text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-[#0b5d68]'}`}>
            Admin Portal
          </h1>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-[#666666]'}`}>
            Sign in to access admin dashboard
          </p>
        </div>

        {/* Login Form */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-8`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-[#0b5d68]'}`}>
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-[#2eb5c2] focus:ring-2 focus:ring-[#2eb5c2]/20'
                    : 'bg-[#f9f9f7] border-gray-200 text-[#0b5d68] placeholder-[#666666] focus:border-[#0b5d68] focus:ring-2 focus:ring-[#0b5d68]/20'
                    } focus:outline-none`}
                  placeholder="admin@lokhari.com"
                />
                <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 material-symbols-outlined ${isDark ? 'text-gray-400' : 'text-[#666666]'
                  }`}>
                  email
                </span>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-[#0b5d68]'}`}>
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-[#2eb5c2] focus:ring-2 focus:ring-[#2eb5c2]/20'
                    : 'bg-[#f9f9f7] border-gray-200 text-[#0b5d68] placeholder-[#666666] focus:border-[#0b5d68] focus:ring-2 focus:ring-[#0b5d68]/20'
                    } focus:outline-none`}
                  placeholder="Enter your password"
                />
                <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 material-symbols-outlined ${isDark ? 'text-gray-400' : 'text-[#666666]'
                  }`}>
                  lock
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className={`p-3 rounded-lg text-sm ${isDark ? 'bg-red-900/50 text-red-200' : 'bg-red-50 text-red-600'}`}>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-xl font-headline font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${isLoading
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : isDark
                  ? 'bg-gradient-to-r from-[#0b5d68] to-[#2eb5c2] text-white hover:from-[#2eb5c2] hover:to-[#0b5d68] shadow-lg'
                  : 'bg-gradient-to-r from-[#0b5d68] to-[#2eb5c2] text-white hover:from-[#2eb5c2] hover:to-[#0b5d68] shadow-lg'
                }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In to Admin'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
            <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-[#0b5d68]'}`}>
              Demo Credentials:
            </p>
            <div className={`text-xs space-y-1 ${isDark ? 'text-gray-300' : 'text-[#666666]'}`}>
              <p><strong>Email:</strong> admin@lokhari.com</p>
              <p><strong>Password:</strong> admin123</p>
            </div>
          </div>
        </div>

        {/* Back to Main Site */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${isDark ? 'text-gray-300 hover:text-[#2eb5c2]' : 'text-[#666666] hover:text-[#0b5d68]'
              }`}
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Main Site
          </Link>
        </div>
      </div>
    </div>
  );
}