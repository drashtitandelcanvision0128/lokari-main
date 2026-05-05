import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { getCurrentUser, getUserRole } from './auth'
import { registrationService } from './registration'

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
