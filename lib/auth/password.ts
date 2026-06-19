import { apiUrl } from '@/lib/api'

interface PasswordApiResponse {
  status?: string
  error?: string
  message?: string
}

async function parsePasswordResponse(
  response: Response,
  fallbackPath: string,
): Promise<PasswordApiResponse> {
  let body: PasswordApiResponse = {}
  try {
    body = await response.json()
  } catch {
    throw new Error(`Cannot reach API at ${apiUrl(fallbackPath)}. Is the backend running?`)
  }

  if (!response.ok) {
    throw new Error(body.error || body.message || 'Request failed')
  }

  return body
}

/** POST /auth/forgot-password — sends OTP if account exists (same response either way). */
export async function requestPasswordReset(email: string): Promise<string> {
  const response = await fetch(apiUrl('/auth/forgot-password'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email.trim(),
    }),
  })

  const body = await parsePasswordResponse(response, '/auth/forgot-password')
  return body.message || 'Verification code sent if an account exists for that email.'
}

/** POST /auth/reset-password — verifies OTP and sets a new password. */
export async function resetPasswordWithOtp(
  email: string,
  otp: string,
  newPassword: string,
  confirmPassword: string,
): Promise<string> {
  const response = await fetch(apiUrl('/auth/reset-password'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email.trim(),
      otp: otp.trim(),
      newPassword,
      confirmPassword,
    }),
  })

  const body = await parsePasswordResponse(response, '/auth/reset-password')
  return body.message || 'Password reset successfully.'
}

/** Resend reset OTP for an email already in the reset flow. */
export async function resendPasswordResetOtp(email: string): Promise<void> {
  await requestPasswordReset(email)
}
