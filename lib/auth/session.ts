import { setAuthToken } from '@/lib/api'
import type { User, UserProfile } from '@/lib/registration'

const USER_KEY = 'currentUser'
const PROFILE_KEY = 'userProfile'

export function buildProfileFromUser(user: User): UserProfile {
  return {
    userId: user.id,
    kycStatus: user.status === 'active' ? 'verified' : 'not_started',
    verificationLevel: 'basic',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

export function persistUserSession(user: User, token: string): UserProfile {
  setAuthToken(token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  const profile = buildProfileFromUser(user)
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  return profile
}

export function clearUserSession(): void {
  setAuthToken(null)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(PROFILE_KEY)
}

export function getDashboardUrl(role: string): string {
  const routes: Record<string, string> = {
    farmer: '/farmer-dashboard',
    trader: '/trader-dashboard',
    warehouse: '/warehouse-dashboard',
    transporter: '/transporter-dashboard',
    admin: '/admin',
  }
  return routes[role] ?? '/dashboard'
}
