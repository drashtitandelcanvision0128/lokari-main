'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAppSelector } from '@/lib/store/hooks'
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectUserDisplayName,
  selectAuthHydrated,
} from '@/lib/store/slices/authSlice'
import { selectCartCount } from '@/lib/store/slices/cartSlice'
import { selectWishlistCount } from '@/lib/store/slices/wishlistSlice'
import ProfileDropdown from '@/components/ui/ProfileDropdown'
import NavbarAuthActions from '@/components/layout/NavbarAuthActions'
import { AdminHeaderNotifications } from '@/components/admin/AdminHeaderNotifications'
import { AdminHeaderSettings } from '@/components/admin/AdminHeaderSettings'
import { isAdminAuthenticated } from '@/lib/adminAuth'
import { useLogout } from '@/hooks/useLogout'

const Navbar = () => {
  const pathname = usePathname()
  const currentRole = "farmer" // Hardcoded role as specified
  const [isDark, setIsDark] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [kycBypassEnabled, setKycBypassEnabled] = useState(false)
  const [isAdminSession, setIsAdminSession] = useState(false)

  const isAuthHydrated = useAppSelector(selectAuthHydrated)
  const isLoggedIn = useAppSelector(selectIsAuthenticated)
  const currentUser = useAppSelector(selectCurrentUser)
  const userName = useAppSelector(selectUserDisplayName)
  const cartCount = useAppSelector(selectCartCount)
  const wishlistCount = useAppSelector(selectWishlistCount)
  const logout = useLogout()

  const checkAuthState = () => {
    const stored = localStorage.getItem('theme')
    const shouldBeDark = stored === 'dark'
    setIsDark(shouldBeDark)
    if (shouldBeDark) {
      document.documentElement.classList.add('dark')
    }

    if (typeof window !== 'undefined') {
      setIsAdminSession(isAdminAuthenticated())

      const user = currentUser
      if (user) {
        const bypassStatus = localStorage.getItem(`dev_kyc_bypass_${user.id}`)
        setKycBypassEnabled(bypassStatus === 'true')
      } else {
        setKycBypassEnabled(false)
      }
    }
  }

  useEffect(() => {
    if (!isAuthHydrated) return
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
      if (e.key === 'currentUser' || e.key === 'userProfile' || e.key === 'adminSession') {
        checkAuthState()
      }
    }

    // Add event listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleFocus)
      window.addEventListener('visibilitychange', handleVisibilityChange)
    }

    window.addEventListener('storage', handleStorageChange)

    // Cleanup event listeners
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', handleFocus)
        window.removeEventListener('visibilitychange', handleVisibilityChange)
      }
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [isAuthHydrated, currentUser])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
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
    if (isAdminSession) {
      localStorage.removeItem('adminSession')
      setIsAdminSession(false)
      window.location.href = '/'
    } else {
      logout()
      window.location.href = '/'
    }
  }

  const toggleLoginState = () => {
    const newState = !isLoggedIn
    localStorage.setItem('isLoggedIn', newState ? 'true' : 'false')
    console.log(`Login state toggled to: ${newState ? 'LOGGED IN' : 'LOGGED OUT'}`)

    if (!newState) {
      logout()
      const protectedPages = ['/notifications', '/dashboard']
      if (protectedPages.some(page => pathname.startsWith(page))) {
        window.location.href = '/'
      }
    }
  }

  const isActive = (path: string) => pathname === path
  const isAdminUser = currentUser?.role === 'admin'
  const isDashboardRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/farmer-dashboard') ||
    pathname.startsWith('/trader-dashboard') ||
    pathname.startsWith('/transporter-dashboard') ||
    pathname.startsWith('/warehouse-dashboard') ||
    pathname.startsWith('/admin')

  return (
    <nav className={`fixed top-0 z-50 h-16 w-full transition-all duration-300 ${isScrolled
      ? isDark ? 'bg-gray-900/80 backdrop-blur-md' : 'bg-[#ece8e1]/80 backdrop-blur-md'
      : isDark ? 'bg-gray-900' : 'bg-[#ece8e1]'
      }`}>
      <div className="flex h-full w-full min-w-0 items-center gap-2 px-3 sm:gap-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden sm:gap-8">
          <Link
            href="/"
            className={`flex shrink-0 items-center gap-2 text-lg font-bold font-headline sm:gap-3 sm:text-xl ${isDark ? 'text-white' : 'text-[#0b5d68]'}`}
          >
            <img src="/AgriwareLogo.svg" alt="Lokhari Logo" className="h-8 w-8 shrink-0" />
            <span className="hidden sm:inline">Lokhari</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 font-headline font-semibold tracking-tight">
            <Link
              href="/listings"
              className={`border-b-2 pb-1 transition-colors ${isActive('/listings')
                ? isDark ? 'text-[#2eb5c2] border-[#2eb5c2]' : 'text-[#2eb5c2] border-[#2eb5c2]'
                : isDark ? 'text-gray-300 border-transparent hover:text-white' : 'text-[#666666] border-transparent hover:text-[#0b5d68]'
                }`}
            >
              Marketplace
            </Link>
            {/* Hide Marketplace, Services, and Insights tabs on all dashboard and admin pages */}
            {!isDashboardRoute && (
                <>

                  <Link
                    href="/insights"
                    className={`border-b-2 pb-1 transition-colors ${isActive('/insights')
                      ? isDark ? 'text-[#2eb5c2] border-[#2eb5c2]' : 'text-[#2eb5c2] border-[#2eb5c2]'
                      : isDark ? 'text-gray-300 border-transparent hover:text-white' : 'text-[#666666] border-transparent hover:text-[#0b5d68]'
                      }`}
                  >
                    Insights
                  </Link>
                  <Link
                    href="/about"
                    className={`border-b-2 pb-1 transition-colors ${isActive('/about')
                      ? isDark ? 'text-[#2eb5c2] border-[#2eb5c2]' : 'text-[#2eb5c2] border-[#2eb5c2]'
                      : isDark ? 'text-gray-300 border-transparent hover:text-white' : 'text-[#666666] border-transparent hover:text-[#0b5d68]'
                      }`}
                  >
                    About Us
                  </Link>
                  <Link
                    href="/contact"
                    className={`border-b-2 pb-1 transition-colors ${isActive('/contact')
                      ? isDark ? 'text-[#2eb5c2] border-[#2eb5c2]' : 'text-[#2eb5c2] border-[#2eb5c2]'
                      : isDark ? 'text-gray-300 border-transparent hover:text-white' : 'text-[#666666] border-transparent hover:text-[#0b5d68]'
                      }`}
                  >
                    Contact Us
                  </Link>
                </>
              )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={toggleDark}
            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg p-0 sm:p-2 ${isDark ? 'text-white' : 'text-[#0b5d68]'}`}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
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
                className={`p-2 rounded-lg transition-colors ${kycBypassEnabled
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                title={`KYC Bypass: ${kycBypassEnabled ? 'Enabled' : 'Disabled'}`}
              >
                <span className="material-symbols-outlined text-sm">
                  {kycBypassEnabled ? 'verified_user' : 'gpp_maybe'}
                </span>
              </button>
              <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${kycBypassEnabled ? 'bg-green-500' : 'bg-gray-400'
                }`} />
            </div>
          )}

          <NavbarAuthActions
            isDark={isDark}
            isAuthHydrated={isAuthHydrated}
            isAdminSession={isAdminSession}
            isLoggedIn={isLoggedIn}
            onAdminLogout={handleLogout}
          >
            {isAdminUser ? (
              <>
                <AdminHeaderNotifications isDark={isDark} />
                <AdminHeaderSettings isDark={isDark} />
              </>
            ) : (
              <>
                <Link href="/notifications" className={`p-2 ${isDark ? 'text-gray-200' : 'text-[#0b5d68]'}`}>
                  <span className="material-symbols-outlined">notifications</span>
                </Link>
                <Link href="/wishlist" className={`p-2 relative ${isDark ? 'text-gray-200' : 'text-[#0b5d68]'}`}>
                  <span className="material-symbols-outlined">favorite</span>
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#d55b39] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                </Link>
                <Link href="/cart" className={`p-2 relative ${isDark ? 'text-gray-200' : 'text-[#0b5d68]'}`}>
                  <span className="material-symbols-outlined">shopping_cart</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#0b5d68] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}

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
            <ProfileDropdown userName={userName} userRole={currentUser?.role} />
          </NavbarAuthActions>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
