'use client';

import ReCAPTCHA from 'react-google-recaptcha';
import { getRecaptchaSiteKey, isRecaptchaConfigured, RECAPTCHA_REQUIRED_MSG } from '@/lib/recaptcha';

interface ReCaptchaFieldProps {
  onChange: (token: string | null) => void;
  error?: string;
  resetKey?: number;
}

export default function ReCaptchaField({ onChange, error, resetKey = 0 }: ReCaptchaFieldProps) {
  const siteKey = getRecaptchaSiteKey();

  if (!isRecaptchaConfigured()) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          reCAPTCHA is not configured. Set NEXT_PUBLIC_RECAPTCHA_SITE_KEY and RECAPTCHA_SECRET_KEY
          to enable the &quot;I&apos;m not a robot&quot; checkbox on the contact form.
        </p>
      );
    }
    return null;
  }

  return (
    <div className="space-y-1">
      <div className="overflow-x-auto">
        <ReCAPTCHA
          key={resetKey}
          sitekey={siteKey}
          onChange={onChange}
          onExpired={() => onChange(null)}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error || RECAPTCHA_REQUIRED_MSG}</p>}
    </div>
  );
}

export { RECAPTCHA_REQUIRED_MSG };
