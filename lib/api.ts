/** Backend base URL — set NEXT_PUBLIC_API_URL on Render/Vercel at build time. */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:5000'

/** Join API_URL with a path segment (handles leading slashes). */
export function apiUrl(path: string): string {
  return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`
}
