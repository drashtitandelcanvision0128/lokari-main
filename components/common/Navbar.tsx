'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getCurrentUser, getUserDisplayName } from '@/lib/auth'
import { registrationService } from '@/lib/registration'
import { WishlistService } from '@/lib/wishlist'
import { useCartContext } from '@/contexts/CartContext'
import ProfileDropdown from '@/components/ui/ProfileDropdown'

const Navbar = () => {
  const pathname = usePathname()
  const currentRole = "farmer" // Hardcoded role as specified
  const [isDark, setIsDark] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userName, setUserName] = useState('')
  const [kycBypassEnabled, setKycBypassEnabled] = useState(false)
  const [wishlistCount, setWishlistCount] = useState(0)
  const { count: cartCount } = useCartContext()

  useEffect(() => {
    const checkAuthState = () => {
      const stored = localStorage.getItem('theme')
      // Default to light mode, only use dark if explicitly set
      const shouldBeDark = stored === 'dark'
      setIsDark(shouldBeDark)
      if (shouldBeDark) {
        document.documentElement.classList.add('dark')
      }

      // Check authentication state from registration service
      if (typeof window !== 'undefined') {
        const user = getCurrentUser()
        if (user) {
          setIsLoggedIn(true)
          setCurrentUser(user)
          setUserName(getUserDisplayName())
          
          // Check KYC bypass status
          const bypassStatus = localStorage.getItem(`dev_kyc_bypass_${user.id}`)
          setKycBypassEnabled(bypassStatus === 'true')
          
          // Load wishlist count
          setWishlistCount(WishlistService.getWishlistCount())
          // Cart count is now handled by context
        } else {
          setIsLoggedIn(false)
          setCurrentUser(null)
          setUserName('')
          setWishlistCount(0)
          // Cart count is now handled by context
        }
      }
    }

    checkAuthState()

    // Re-check auth state when window gets focus (handles back navigation)
    const handleFocus = () => {
      checkAuthState()
    }

    // Re-check auth state when page becomes visible (handles back navigation)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAuthState()
      }
    }

    // Listen for storage changes that might affect auth
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentUser' || e.key === 'userProfile') {
        checkAuthState()
      }
    }

    window.addEventListener('focus', handleFocus)
    window.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Listen for wishlist changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lokhari_wishlist') {
        setWishlistCount(WishlistService.getWishlistCount())
      }
      // Cart count is now handled by context automatically
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const toggleDark = () => {
    const newTheme = isDark ? 'light' : 'dark'
    setIsDark(!isDark)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark')
  }

  const toggleKycBypass = () => {
    if (!currentUser) return
    
    const newStatus = !kycBypassEnabled
    setKycBypassEnabled(newStatus)
    
    if (newStatus) {
      // Enable KYC bypass
      localStorage.setItem(`dev_kyc_bypass_${currentUser.id}`, 'true')
      localStorage.setItem(`kyc_${currentUser.id}`, JSON.stringify({
        aadhaarNumber: '000000000000',
        otp: '000000',
        documentUrl: '/mock-document.pdf',
        status: 'verified'
      }))
      console.log('KYC bypass ENABLED for demonstration')
    } else {
      // Disable KYC bypass
      localStorage.removeItem(`dev_kyc_bypass_${currentUser.id}`)
      localStorage.removeItem(`kyc_${currentUser.id}`)
      console.log('KYC bypass DISABLED - real KYC verification required')
    }
    
    // Force page refresh to re-evaluate verification status
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }

  const handleLogout = () => {
    // Clear current user session only
    localStorage.removeItem('currentUser')
    localStorage.removeItem('userProfile')
    localStorage.removeItem('otpSession')
    setIsLoggedIn(false)
    setCurrentUser(null)
    setUserName('')
    window.location.href = '/'
  }

  const toggleLoginState = () => {
    const newState = !isLoggedIn
    setIsLoggedIn(newState)
    localStorage.setItem('isLoggedIn', newState ? 'true' : 'false')
    console.log(`Login state toggled to: ${newState ? 'LOGGED IN' : 'LOGGED OUT'}`)
    
    // If logging out and on a protected page, redirect to landing page
    if (!newState) {
      const protectedPages = ['/notifications', '/profile', '/dashboard']
      if (protectedPages.some(page => pathname.startsWith(page))) {
        window.location.href = '/'
      }
    }
  }

  const isActive = (path: string) => pathname === path

  return (
    <nav className={`fixed top-0 w-full z-50 h-16 transition-all duration-300 ${
      isScrolled 
        ? isDark ? 'bg-gray-900/80 backdrop-blur-md' : 'bg-[#f9f9f7]/80 backdrop-blur-md'
        : isDark ? 'bg-gray-900' : 'bg-[#f9f9f7]'
    }`}>
      <div className="flex justify-between items-center w-full px-8 h-full max-w-full">
        <div className="flex items-center gap-8">
          <Link href="/" className={`flex items-center gap-3 text-xl font-bold font-headline ${
            isDark ? 'text-white' : 'text-[#0b5d68]'
          }`}>
            <img src="/AgriwareLogo.svg" alt="Lokhari Logo" className="w-8 h-8" />
            Lokhari
          </Link>
          <div className="hidden md:flex items-center gap-6 font-headline font-semibold tracking-tight">
            {/* Hide Marketplace, Services, and Insights tabs on all dashboard and admin pages */}
            {!pathname.startsWith('/dashboard') && 
             !pathname.startsWith('/farmer-dashboard') && 
             !pathname.startsWith('/trader-dashboard') && 
             !pathname.startsWith('/transporter-dashboard') && 
             !pathname.startsWith('/warehouse-dashboard') && 
             !pathname.startsWith('/admin') && (
              <>
                <Link
                  href="/listings"
                  className={`border-b-2 pb-1 transition-colors ${
                    isActive('/listings')
                      ? isDark ? 'text-[#2eb5c2] border-[#2eb5c2]' : 'text-[#2eb5c2] border-[#2eb5c2]'
                      : isDark ? 'text-gray-300 border-transparent hover:text-white' : 'text-[#666666] border-transparent hover:text-[#0b5d68]'
                  }`}
                >
                  Marketplace
                </Link>
                <Link
                  href="/services"
                  className={`border-b-2 pb-1 transition-colors ${
                    isActive('/services')
                      ? isDark ? 'text-[#2eb5c2] border-[#2eb5c2]' : 'text-[#2eb5c2] border-[#2eb5c2]'
                      : isDark ? 'text-gray-300 border-transparent hover:text-white' : 'text-[#666666] border-transparent hover:text-[#0b5d68]'
                  }`}
                >
                  Services
                </Link>
                <Link
                  href="/insights"
                  className={`border-b-2 pb-1 transition-colors ${
                    isActive('/insights')
                      ? isDark ? 'text-[#2eb5c2] border-[#2eb5c2]' : 'text-[#2eb5c2] border-[#2eb5c2]'
                      : isDark ? 'text-gray-300 border-transparent hover:text-white' : 'text-[#666666] border-transparent hover:text-[#0b5d68]'
                  }`}
                >
                  Insights
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleDark}
            className={`p-2 ${isDark ? 'text-white' : 'text-[#0b5d68]'}`}
          >
            <span className="material-symbols-outlined">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          
          {/* KYC Bypass Toggle - Development Only */}
          {process.env.NODE_ENV === 'development' && isLoggedIn && (
            <div className="relative">
              <button 
                onClick={toggleKycBypass}
                className={`p-2 rounded-lg transition-colors ${
                  kycBypassEnabled 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={`KYC Bypass: ${kycBypassEnabled ? 'Enabled' : 'Disabled'}`}
              >
                <span className="material-symbols-outlined text-sm">
                  {kycBypassEnabled ? 'verified_user' : 'gpp_maybe'}
                </span>
              </button>
              <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                kycBypassEnabled ? 'bg-green-500' : 'bg-gray-400'
              }`} />
            </div>
          )}
          
          {isLoggedIn ? (
            <>
              <Link href="/admin" className="p-2 text-[#0b5d68]">
                <span className="material-symbols-outlined">admin_panel_settings</span>
              </Link>
              <Link href="/notifications" className="p-2 text-[#0b5d68]">
                <span className="material-symbols-outlined">notifications</span>
              </Link>
              <Link href="/wishlist" className="p-2 text-[#0b5d68] relative">
                <span className="material-symbols-outlined">favorite</span>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#d55b39] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>
              <Link href="/cart" className="p-2 text-[#0b5d68] relative">
                <span className="material-symbols-outlined">shopping_cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#0b5d68] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
              <ProfileDropdown userName={userName} userRole={currentUser?.role} />
              <div className="hidden md:flex items-center gap-2 ml-4">
                <span className="text-sm text-on-surface-variant">Welcome,</span>
                <span className="text-sm font-medium text-[#2eb5c2] font-headline">
                  {userName || 'User'}
                </span>
                {currentUser?.role && (
                  <>
                    <span className="text-sm text-on-surface-variant">•</span>
                    <span className="text-sm font-medium text-[#e89151] capitalize font-headline">
                      {currentUser.role}
                    </span>
                  </>
                )}
              </div>
              <button 
                onClick={handleLogout}
                className={`hidden md:flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                  isDark ? 'text-white bg-[#e89151] hover:bg-[#d67a3a]' : 'text-white bg-[#e89151] hover:bg-[#d67a3a]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={`hidden md:flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                isDark ? 'text-white bg-[#e89151] hover:bg-[#d67a3a]' : 'text-white bg-[#e89151] hover:bg-[#d67a3a]'
              }`}>
                <span className="material-symbols-outlined text-sm">login</span>
                <span>Login</span>
              </Link>
              <Link href="/register" className={`hidden md:flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                isDark ? 'text-white bg-[#d55b39] hover:bg-[#c44928]' : 'text-white bg-[#d55b39] hover:bg-[#c44928]'
              }`}>
                <span className="material-symbols-outlined text-sm">person_add</span>
                <span>Register</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
