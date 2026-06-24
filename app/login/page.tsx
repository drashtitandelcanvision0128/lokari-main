'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { registrationService } from '@/lib/registration';
import { buildProfileFromUser, clearUserSession } from '@/lib/auth/session';
import { useAppDispatch } from '@/lib/store/hooks';
import { setUser, setProfile } from '@/lib/store/slices/authSlice';
import { useGuestGuard } from '@/lib/authGuard';
import GuestPageShell from '@/components/layout/GuestPageShell';
import Button from '@/components/common/Button';
import OtpInput from '@/components/common/OtpInput';
import {
  requestPasswordReset,
  resetPasswordWithOtp,
  resendPasswordResetOtp,
} from '@/lib/auth/password';

const inputClass = (err?: boolean) =>
  `w-full rounded-[0.3125rem] border bg-white py-3 pl-12 pr-4 text-[0.875rem] text-[#0b5d68] placeholder:text-gray-500 transition-all focus:outline-none focus:ring-2 ${
    err
      ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20'
      : 'border-[#2eb5c2] focus:border-[#2eb5c2] focus:ring-[#2eb5c2]/30'
  }`;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type AuthView = 'login' | 'forgot-email' | 'forgot-reset' | 'forgot-success';

function viewFromSearchParams(mode: string | null, emailParam: string | null): AuthView {
  if (mode === 'forgot') return 'forgot-email';
  if (mode === 'reset') return emailParam?.trim() ? 'forgot-reset' : 'forgot-email';
  if (mode === 'success') return 'forgot-success';
  return 'login';
}

function buildLoginPath(view: AuthView, emailValue = ''): string {
  switch (view) {
    case 'forgot-email':
      return '/login?mode=forgot';
    case 'forgot-reset':
      return `/login?mode=reset&email=${encodeURIComponent(emailValue.trim())}`;
    case 'forgot-success':
      return '/login?mode=success';
    default:
      return '/login';
  }
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const guestStatus = useGuestGuard();

  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Ensure server & first client render are identical, then show real content
  useEffect(() => { setMounted(true); }, []);

  const resetForgotForm = () => {
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setFieldErrors({});
    setError('');
  };

  useEffect(() => {
    const mode = searchParams.get('mode');
    const emailParam = searchParams.get('email');
    const nextView = viewFromSearchParams(mode, emailParam);

    setView(nextView);
    if (emailParam?.trim()) {
      setEmail(emailParam.trim());
    }
    if (nextView === 'login') {
      resetForgotForm();
    }
  }, [searchParams]);

  const navigateAuth = (
    nextView: AuthView,
    options?: { email?: string; clearForgot?: boolean },
  ) => {
    if (options?.clearForgot) {
      resetForgotForm();
    }
    const emailForUrl = options?.email ?? email;
    if (options?.email !== undefined) {
      setEmail(options.email);
    }
    setView(nextView);
    setError('');
    router.replace(buildLoginPath(nextView, emailForUrl));
  };

  const showLogin = view === 'login';
  const showForgot = view.startsWith('forgot');

  const goToLogin = () => {
    navigateAuth('login', { clearForgot: true });
  };

  const goToForgot = () => {
    navigateAuth('forgot-email', { email });
  };

  const validateLogin = (): boolean => {
    const errs: Record<string, string> = {};
    const trimEmail = email.trim();
    if (!trimEmail) {
      errs.email = 'Email is required.';
    } else if (!EMAIL_RE.test(trimEmail)) {
      errs.email = 'Enter a valid email address.';
    }
    if (!password) {
      errs.password = 'Password is required.';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateForgotEmail = (): boolean => {
    const errs: Record<string, string> = {};
    const trimEmail = email.trim();
    if (!trimEmail) {
      errs.email = 'Email is required.';
    } else if (!EMAIL_RE.test(trimEmail)) {
      errs.email = 'Enter a valid email address.';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateLogin()) return;

    setIsLoading(true);

    try {
      const user = await registrationService.authenticateUser(email, password);

      if (!user) {
        setError('Invalid email or password');
        return;
      }

      if (user.role === 'admin') {
        clearUserSession();
        setError('Admin accounts must sign in at the admin login page.');
        return;
      }

      const profile = buildProfileFromUser(user);
      dispatch(setUser(user));
      dispatch(setProfile(profile));

      router.push(registrationService.getDashboardUrl(user.role));
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateForgotEmail()) return;

    setIsLoading(true);

    try {
      await requestPasswordReset(email);
      navigateAuth('forgot-reset', { email });
      setOtp('');
      setFieldErrors({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');

    setIsResending(true);

    try {
      await resendPasswordResetOtp(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  const validateResetForm = () => {
    const errors: Record<string, string> = {};

    if (otp.trim().length !== 6) {
      errors.otp = 'Enter the 6-digit code sent to your email.';
    }
    if (!newPassword) {
      errors.newPassword = 'New password is required.';
    } else if (newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters.';
    } else if (!/[A-Z]/.test(newPassword)) {
      errors.newPassword = 'Include at least one uppercase letter.';
    } else if (!/[0-9]/.test(newPassword)) {
      errors.newPassword = 'Include at least one number.';
    }
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password.';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateResetForm()) return;

    setIsLoading(true);

    try {
      await resetPasswordWithOtp(email, otp, newPassword, confirmPassword);
      setPassword('');
      resetForgotForm();
      navigateAuth('forgot-success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  // Before client mounts, always show the shell so server & client HTML match
  if (!mounted || guestStatus !== 'allowed') return <GuestPageShell />;

  const headerTitle =
    view === 'login'
      ? 'Welcome Back'
      : view === 'forgot-email'
        ? 'Forgot Password'
        : view === 'forgot-reset'
          ? 'Reset Password'
          : 'Password Reset Complete';

  const headerSubtitle =
    view === 'login'
      ? 'Sign in to your Lokhari account'
      : view === 'forgot-email'
        ? "Enter your email and we'll send you a verification code."
        : view === 'forgot-reset'
          ? `Enter the code sent to ${email} and choose a new password.`
          : 'Your password has been updated. You can sign in with your new password.';

  return (
    <div className="min-h-screen bg-[#f9f9f7] flex pt-16">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 text-center text-white max-w-md">
          <div className="mb-8">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl">agriculture</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">Lokhari</h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Connecting farmers, traders, and logistics providers in a transparent agricultural
              marketplace
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold mb-1">10K+</div>
              <div className="text-sm text-white/80">Active Users</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold mb-1">50K+</div>
              <div className="text-sm text-white/80">Transactions</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold mb-1">24/7</div>
              <div className="text-sm text-white/80">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login / Forgot Password */}
      <div className="flex-1 lg:flex-none lg:w-1/2 bg-[#f9f9f7] flex items-start lg:items-center justify-center p-8 py-10 overflow-y-auto">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="lg:hidden w-16 h-16 bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-3xl text-white">
                {showForgot ? 'lock_reset' : 'agriculture'}
              </span>
            </div>
            <h1 className="font-headline text-3xl font-bold text-[#0b5d68] mb-2">{headerTitle}</h1>
            <p className="text-[0.875rem] text-gray-600 font-body">{headerSubtitle}</p>
          </div>

          {view === 'forgot-success' ? (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-green-600 text-3xl">
                  check_circle
                </span>
              </div>
              <Button
                type="button"
                variant="primary"
                size="lg"
                className="w-full"
                onClick={goToLogin}
              >
                Sign In
              </Button>
            </div>
          ) : showLogin ? (
            <form onSubmit={handleLogin} noValidate className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-[0.875rem] font-medium text-[#0b5d68]"
                >
                  Email
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <span className={`material-symbols-outlined text-lg ${fieldErrors.email ? 'text-red-400' : 'text-[#2eb5c2]'}`}>email</span>
                  </div>
                  <input
                    id="email"
                    type="text"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors(p => ({ ...p, email: '' })); }}
                    className={inputClass(!!fieldErrors.email)}
                    placeholder="Enter your email"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                    <span className="material-symbols-outlined text-[0.85rem]">error</span>
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-[0.875rem] font-medium text-[#0b5d68]"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <span className={`material-symbols-outlined text-lg ${fieldErrors.password ? 'text-red-400' : 'text-[#2eb5c2]'}`}>lock</span>
                  </div>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors(p => ({ ...p, password: '' })); }}
                    className={inputClass(!!fieldErrors.password)}
                    placeholder="Enter your password"
                  />
                </div>
                {fieldErrors.password && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                    <span className="material-symbols-outlined text-[0.85rem]">error</span>
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <span className="material-symbols-outlined text-base text-red-500">error</span>
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>

              <div className="text-center -mt-2">
                <button
                  type="button"
                  onClick={goToForgot}
                  className="text-sm text-[#2eb5c2] hover:text-[#0b5d68] font-medium transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          ) : view === 'forgot-email' ? (
            <form onSubmit={handleSendCode} noValidate className="space-y-5">
              <div>
                <label
                  htmlFor="reset-email"
                  className="mb-2 block text-[0.875rem] font-medium text-[#0b5d68]"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <span className={`material-symbols-outlined text-lg ${fieldErrors.email ? 'text-red-400' : 'text-[#2eb5c2]'}`}>email</span>
                  </div>
                  <input
                    id="reset-email"
                    type="text"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors(p => ({ ...p, email: '' })); }}
                    className={inputClass(!!fieldErrors.email)}
                    placeholder="Enter your registered email"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                    <span className="material-symbols-outlined text-[0.85rem]">error</span>
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <span className="material-symbols-outlined text-base text-red-500">error</span>
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Sending...' : 'Send Verification Code'}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={goToLogin}
                  className="text-sm text-[#2eb5c2] hover:text-[#0b5d68] font-medium transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} noValidate className="space-y-5">
              <div>
                <label className="mb-2 block text-[0.875rem] font-medium text-[#0b5d68] text-center">
                  Verification Code
                </label>
                <OtpInput value={otp} onChange={setOtp} error={fieldErrors.otp} size="lg" />
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="mb-2 block text-[0.875rem] font-medium text-[#0b5d68]"
                >
                  New Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <span className={`material-symbols-outlined text-lg ${fieldErrors.newPassword ? 'text-red-400' : 'text-[#2eb5c2]'}`}>lock</span>
                  </div>
                  <input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (fieldErrors.newPassword) setFieldErrors((prev) => ({ ...prev, newPassword: '' }));
                    }}
                    className={inputClass(!!fieldErrors.newPassword)}
                    placeholder="At least 8 characters"
                  />
                </div>
                {fieldErrors.newPassword && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                    <span className="material-symbols-outlined text-[0.85rem]">error</span>
                    {fieldErrors.newPassword}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-[0.875rem] font-medium text-[#0b5d68]"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <span className={`material-symbols-outlined text-lg ${fieldErrors.confirmPassword ? 'text-red-400' : 'text-[#2eb5c2]'}`}>lock</span>
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    }}
                    className={inputClass(!!fieldErrors.confirmPassword)}
                    placeholder="Re-enter new password"
                  />
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                    <span className="material-symbols-outlined text-[0.85rem]">error</span>
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <span className="material-symbols-outlined text-base text-red-500">error</span>
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>

              <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
                <button
                  type="button"
                  onClick={() => navigateAuth('forgot-email', { email })}
                  className="shrink-0 text-[#2eb5c2] hover:text-[#0b5d68] font-medium transition-colors whitespace-nowrap"
                >
                  Change email
                </button>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="shrink-0 text-[#2eb5c2] hover:text-[#0b5d68] font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {isResending ? 'Sending...' : 'Resend code'}
                </button>
                <button
                  type="button"
                  onClick={goToLogin}
                  className="shrink-0 text-[#2eb5c2] hover:text-[#0b5d68] font-medium transition-colors whitespace-nowrap"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {view === 'login' && (
            <div className="text-center mt-8">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link
                  href="/register"
                  className="text-[#2eb5c2] font-semibold hover:text-[#0b5d68] transition-colors"
                >
                  Choose your role to get started
                </Link>
              </p>
            </div>
          )}

          <div className="text-center mt-4">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">home</span>
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<GuestPageShell />}>
      <LoginPageContent />
    </Suspense>
  );
}
