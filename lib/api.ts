/** Backend base URL — set NEXT_PUBLIC_API_URL on Render at build time. */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')
  if (fromEnv) return fromEnv

  // Browser: match frontend hostname (localhost vs 127.0.0.1) to avoid CORS mismatches
  if (typeof window !== 'undefined') {
    const port = process.env.NEXT_PUBLIC_API_PORT || '5000'
    return `http://${window.location.hostname}:${port}`
  }

  return 'http://localhost:5000'
}

/** @deprecated Use getApiBaseUrl() — kept for existing imports */
export const API_URL = getApiBaseUrl()

/**
 * Build full API URL for a path.
 * - If NEXT_PUBLIC_API_URL ends with /api → https://host.com/api + /auth/login
 * - Otherwise → https://host.com + /auth/login (legacy, works on current Render)
 */
export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const base = getApiBaseUrl().replace(/\/$/, '')

  if (base.endsWith('/api')) {
    return `${base}${normalizedPath}`
  }
  return `${base}/api${normalizedPath}`
}

const AUTH_TOKEN_KEY = 'authToken'

/** Persist JWT from login/register responses. */
export function setAuthToken(token: string | null): void {
  if (typeof window === 'undefined') return
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY)
  }
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

/** Headers for authenticated API requests (Bearer token). */
export function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra,
  }
  const token = getAuthToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}
