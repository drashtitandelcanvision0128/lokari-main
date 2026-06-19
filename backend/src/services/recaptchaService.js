const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

export async function verifyRecaptchaToken(token) {
  const secret = process.env.RECAPTCHA_SECRET_KEY?.trim();

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      const err = new Error('reCAPTCHA is not configured on the server.');
      err.statusCode = 500;
      throw err;
    }
    console.warn('RECAPTCHA_SECRET_KEY not set — skipping reCAPTCHA verification (dev only)');
    return;
  }

  if (!token?.trim()) {
    const err = new Error('Please complete the reCAPTCHA challenge.');
    err.statusCode = 400;
    throw err;
  }

  const response = await fetch(RECAPTCHA_VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret,
      response: token.trim(),
    }),
  });

  let data;
  try {
    data = await response.json();
  } catch {
    const err = new Error('Unable to verify reCAPTCHA. Please try again.');
    err.statusCode = 502;
    throw err;
  }

  if (!data.success) {
    const err = new Error('reCAPTCHA verification failed. Please try again.');
    err.statusCode = 400;
    throw err;
  }
}
