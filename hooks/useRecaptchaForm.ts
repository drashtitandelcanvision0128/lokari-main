'use client';

import { useCallback, useState } from 'react';
import { isRecaptchaConfigured, RECAPTCHA_REQUIRED_MSG } from '@/lib/recaptcha';

/** Client-side reCAPTCHA state for forms. */
export function useRecaptchaForm() {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [resetKey, setResetKey] = useState(0);

  const validate = useCallback((): boolean => {
    if (!isRecaptchaConfigured()) {
      setError('');
      return true;
    }
    if (!token) {
      setError(RECAPTCHA_REQUIRED_MSG);
      return false;
    }
    setError('');
    return true;
  }, [token]);

  const reset = useCallback(() => {
    setToken(null);
    setError('');
    setResetKey((key) => key + 1);
  }, []);

  return {
    token,
    setToken,
    error,
    resetKey,
    validate,
    reset,
    configured: isRecaptchaConfigured(),
  };
}
