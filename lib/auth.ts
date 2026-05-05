import { registrationService, type User } from './registration'

export function getCurrentUser(): User | null {
  // Only access localStorage on client side
  if (typeof window === 'undefined') return null
  
  try {
    return registrationService.getCurrentUser()
  } catch {
    return null
  }
}

export function getUserDisplayName(): string {
  // Return empty string initially to match server render
  if (typeof window === 'undefined') return ''
  
  const user = getCurrentUser()
  return user?.fullName || ''
}

export function getUserRole(): string {
  const user = getCurrentUser()
  return user?.role || 'unknown'
}

export function isUserVerified(): boolean {
  const profile = registrationService.getUserProfile()
  
  // Check if user is verified via profile
  if (profile?.kycStatus === 'verified') {
    console.log('✅ User verified via profile')
    return true
  }
  
  // Check development bypass in localStorage
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const user = registrationService.getCurrentUser()
    if (user) {
      const kycData = localStorage.getItem(`kyc_${user.id}`)
      console.log('🔍 KYC data from localStorage:', kycData)
      
      if (kycData) {
        try {
          const parsed = JSON.parse(kycData)
          console.log('📋 Parsed KYC data:', parsed)
          
          if (parsed.status === 'verified') {
            console.log('✅ User verified via KYC localStorage')
            return true
          }
        } catch (error) {
          console.log('❌ Error parsing KYC data:', error)
        }
      }
      
      // Check for development bypass
      const devBypass = localStorage.getItem(`dev_kyc_bypass_${user.id}`)
      console.log('🔧 Development bypass status:', devBypass)
      
      if (devBypass === 'true') {
        console.log('✅ User verified via development bypass')
        return true
      }
    }
  }
  
  console.log('❌ User not verified, returning false')
  return false
}

export function requireAuth() {
  if (typeof window !== 'undefined') {
    const user = getCurrentUser()
    if (!user) {
      window.location.href = '/login'
      return false
    }
    return true
  }
  return false
}
