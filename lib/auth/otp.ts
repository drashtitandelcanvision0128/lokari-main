import { apiUrl } from '@/lib/api'

export type OtpPurpose = 'register' | 'login' | 'reset_password'

interface OtpApiResponse {
  status?: string
  error?: string
  message?: string
  data?: {
    email?: string
    purpose?: OtpPurpose
    expiresIn?: number
  }
}

/** POST /auth/otp/send — sends a 6-digit code to the user's email. */
export async function sendEmailOtp(
  email: string,
  purpose: OtpPurpose = 'register',
): Promise<void> {
  const response = await fetch(apiUrl('/auth/otp/send'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), purpose }),
  })

  let body: OtpApiResponse = {}
  try {
    body = await response.json()
  } catch {
    throw new Error(
      `Cannot reach API at ${apiUrl('/auth/otp/send')}. Is the backend running on the correct port?`,
    )
  }

  if (!response.ok) {
    throw new Error(body.error || body.message || 'Failed to send OTP')
  }
}

/** POST /auth/otp/verify — validates the email OTP. */
export async function verifyEmailOtp(
  email: string,
  otp: string,
  purpose: OtpPurpose = 'register',
): Promise<void> {
  const response = await fetch(apiUrl('/auth/otp/verify'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email.trim(),
      otp: otp.trim(),
      purpose,
    }),
  })

  let body: OtpApiResponse = {}
  try {
    body = await response.json()
  } catch {
    throw new Error('Invalid response from server')
  }

  if (!response.ok) {
    throw new Error(body.error || body.message || 'OTP verification failed')
  }
}
