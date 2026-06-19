import { apiUrl } from '@/lib/api'
import type { User } from '@/lib/registration'

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthPayload {
  user: User
  token: string
}

interface AuthApiResponse {
  status?: string
  error?: string
  message?: string
  data?: {
    user?: User
    token?: string
  }
}

async function loginAtPath(
  path: string,
  credentials: LoginCredentials,
): Promise<AuthPayload> {
  let response: Response
  try {
    response = await fetch(apiUrl(path), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: credentials.email.trim(),
        password: credentials.password,
      }),
    })
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Cannot reach API at ${apiUrl(path)}. Start backend: cd backend && npm run dev`,
      )
    }
    throw error
  }

  let body: AuthApiResponse = {}
  try {
    body = await response.json()
  } catch {
    throw new Error(`Cannot reach API at ${apiUrl(path)}. Is the backend running?`)
  }

  if (!response.ok) {
    throw new Error(body.error || body.message || 'Login failed')
  }

  const user = body.data?.user
  const token = body.data?.token

  if (!user || !token) {
    throw new Error('Invalid login response')
  }

  return { user, token }
}

/** POST /auth/login — throws with server error message on failure. */
export async function loginWithCredentials(
  credentials: LoginCredentials,
): Promise<AuthPayload> {
  return loginAtPath('/auth/login', credentials)
}

/** POST /auth/admin/login — admin portal only. */
export async function loginWithAdminCredentials(
  credentials: LoginCredentials,
): Promise<AuthPayload> {
  return loginAtPath('/auth/admin/login', credentials)
}

/** POST /auth/logout — best-effort; always clears client session separately. */
export async function logoutFromApi(): Promise<void> {
  try {
    await fetch(apiUrl('/auth/logout'), { method: 'POST', credentials: 'include' })
  } catch {
    // Ignore network errors during logout
  }
}
