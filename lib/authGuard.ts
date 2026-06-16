import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getCurrentUser } from './auth'
import { registrationService } from './registration'
import { useAppSelector } from '@/lib/store/hooks'
import { selectAuthHydrated, selectCurrentUser } from '@/lib/store/slices/authSlice'

/** Redirect authenticated users away from guest-only routes (login, register). */
export function useGuestGuard(): boolean {
  const router = useRouter()
  const isHydrated = useAppSelector(selectAuthHydrated)
  const currentUser = useAppSelector(selectCurrentUser)
  const [canRender, setCanRender] = useState(false)

  useEffect(() => {
    if (!isHydrated) return

    if (currentUser) {
      router.replace(registrationService.getDashboardUrl(currentUser.role))
      setCanRender(false)
      return
    }

    setCanRender(true)
  }, [isHydrated, currentUser, router])

  return canRender
}

export function useRoleGuard(requiredRole: string) {
  const router = useRouter()

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    const currentUser = getCurrentUser()
    
    // Check if user is logged in
    if (!currentUser) {
      router.push('/login')
      return
    }

    // Check if user has the required role
    if (currentUser.role !== requiredRole) {
      // Redirect to user's correct dashboard
      const correctDashboard = registrationService.getDashboardUrl(currentUser.role)
      router.push(correctDashboard)
      return
    }
  }, [router, requiredRole])
}

export function useAuthGuard() {
  const router = useRouter()

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    const currentUser = getCurrentUser()
    
    // Check if user is logged in
    if (!currentUser) {
      router.push('/login')
      return
    }
  }, [router])
}

export function checkRoleAccess(requiredRole: string): { authorized: boolean; redirectTo?: string } {
  // Only run on client side
  if (typeof window === 'undefined') return { authorized: true }

  const currentUser = getCurrentUser()
  
  // Check if user is logged in
  if (!currentUser) {
    return { authorized: false, redirectTo: '/login' }
  }

  // Check if user has the required role
  if (currentUser.role !== requiredRole) {
    const correctDashboard = registrationService.getDashboardUrl(currentUser.role)
    return { authorized: false, redirectTo: correctDashboard }
  }

  return { authorized: true }
}
