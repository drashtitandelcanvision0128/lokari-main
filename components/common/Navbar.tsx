'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks'
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectUserDisplayName,
  selectAuthHydrated,
  selectAvatarUrl,
  setUser as setReduxUser,
} from '@/lib/store/slices/authSlice'
import ProfileDropdown from '@/components/ui/ProfileDropdown'
import NavbarAuthActions from '@/components/layout/NavbarAuthActions'
import { AdminHeaderNotifications } from '@/components/admin/AdminHeaderNotifications'
import { AdminHeaderSettings } from '@/components/admin/AdminHeaderSettings'
import { isAdminAuthenticated } from '@/lib/adminAuth'
import { useLogout } from '@/hooks/useLogout'

const NAV_LINKS = [
  { href: '/listings', label: 'Marketplace' },
  { href: '/insights',  label: 'Insights'    },
  { href: '/about',     label: 'About'       },
  { href: '/contact',   label: 'Contact'     },
]

const DASHBOARD_PREFIXES = [
  '/dashboard', '/farmer-dashboard', '/trader-dashboard',
  '/transporter-dashboard', '/warehouse-dashboard', '/admin',
]

const Navbar = () => {
  const pathname = usePathname()
  const [isDark, setIsDark] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isAdminSession, setIsAdminSession] = useState(false)

  const dispatch       = useAppDispatch()
  const isAuthHydrated = useAppSelector(selectAuthHydrated)
  const isLoggedIn     = useAppSelector(selectIsAuthenticated)
  const currentUser    = useAppSelector(selectCurrentUser)
  const userName       = useAppSelector(selectUserDisplayName)
  const avatarUrl      = useAppSelector(selectAvatarUrl)
  const logout         = useLogout()

  const isDashboardRoute = DASHBOARD_PREFIXES.some(p => pathname.startsWith(p))
  const isActive = (path: string) => pathname === path

  // ── theme + auth state ──────────────────────────────────────────────────────
  const checkAuthState = () => {
    const stored = localStorage.getItem('theme')
    const dark   = stored === 'dark'
    setIsDark(dark)
    document.documentElement.classList.toggle('dark', dark)

    if (typeof window !== 'undefined') {
      setIsAdminSession(isAdminAuthenticated())
    }
  }

  useEffect(() => {
    if (!isAuthHydrated) return
    checkAuthState()
    const onFocus      = () => checkAuthState()
    const onVisible    = () => { if (document.visibilityState === 'visible') checkAuthState() }
    const onStorage    = (e: StorageEvent) => {
      if (['currentUser', 'userProfile', 'adminSession'].includes(e.key ?? '')) checkAuthState()
    }
    window.addEventListener('focus', onFocus)
    window.addEventListener('visibilitychange', onVisible)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('storage', onStorage)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthHydrated, currentUser])

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Fetch avatar from DB once after auth hydration so Navbar always shows it
  useEffect(() => {
    if (!isAuthHydrated || !isLoggedIn || !currentUser) return
    import('@/lib/profile').then(({ fetchMyProfile }) => {
      fetchMyProfile().then((profile) => {
        if (profile?.avatarUrl) {
          localStorage.setItem('lokhari_profile_avatar', profile.avatarUrl)
          dispatch(setReduxUser({ ...currentUser, avatar: profile.avatarUrl }))
        }
      })
    })
  // Run once when auth is ready — currentUser intentionally omitted to avoid re-fetching on every Redux update
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthHydrated, isLoggedIn])

  // ── handlers ────────────────────────────────────────────────────────────────
  const toggleDark = () => {
    const next = !isDark
    setIsDark(next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', next)
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

  // ── styles ──────────────────────────────────────────────────────────────────
  const navBg = isScrolled
    ? isDark
      ? 'bg-gray-900/90 backdrop-blur-lg shadow-lg shadow-black/20 border-b border-white/5'
      : 'bg-[#ece8e1]/90 backdrop-blur-lg shadow-md shadow-black/5 border-b border-[#d6d2cb]/60'
    : isDark
      ? 'bg-gray-900 border-b border-white/5'
      : 'bg-[#ece8e1] border-b border-[#d6d2cb]/40'

  const linkBase = 'relative px-3 py-1.5 text-sm font-semibold font-headline rounded-full transition-all duration-200'
  const linkActive = isDark
    ? 'bg-[#2eb5c2]/15 text-[#2eb5c2]'
    : 'bg-[#0b5d68]/10 text-[#0b5d68]'
  const linkInactive = isDark
    ? 'text-gray-400 hover:text-white hover:bg-white/5'
    : 'text-gray-500 hover:text-[#0b5d68] hover:bg-gray-100'

  const iconBtn = `relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
    isDark ? 'text-gray-300 hover:bg-white/10 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-[#0b5d68]'
  }`

  return (
    <nav className={`fixed top-0 z-50 h-16 w-full transition-all duration-300 ${navBg}`}>
      <div className="flex h-full w-full min-w-0 items-center gap-2 px-3 sm:px-5 lg:px-8">

        {/* ── Logo ──────────────────────────────────────────────────── */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-90"
        >
          <img src="/AgriwareLogo.svg" alt="Lokhari Logo" className="h-8 w-8 shrink-0" />
          <span className={`hidden font-headline text-lg font-bold sm:inline ${isDark ? 'text-white' : 'text-[#0b5d68]'}`}>
            Lokhari
          </span>
        </Link>

        {/* ── Desktop nav links ──────────────────────────────────────── */}
        <div className="hidden flex-1 items-center gap-1 px-4 md:flex">
          <Link href="/listings" className={`${linkBase} ${isActive('/listings') ? linkActive : linkInactive}`}>
            Marketplace
          </Link>
          <Link href="/insights" className={`${linkBase} ${isActive('/insights') ? linkActive : linkInactive}`}>
            Insights
          </Link>
          <Link href="/about" className={`${linkBase} ${isActive('/about') ? linkActive : linkInactive}`}>
            About
          </Link>
          <Link href="/contact" className={`${linkBase} ${isActive('/contact') ? linkActive : linkInactive}`}>
            Contact
          </Link>

          {isLoggedIn && (
            <Link
              href={`/${currentUser?.role || 'farmer'}-dashboard`}
              className={`${linkBase} ${isDashboardRoute ? linkActive : linkInactive}`}
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Spacer on mobile so actions stay right-aligned */}
        <div className="flex-1 md:hidden" />

        {/* ── Right actions ─────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">

          {/* Dark mode toggle */}
          <button
            type="button"
            onClick={toggleDark}
            className={iconBtn}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <span className="material-symbols-outlined text-[1.2rem]">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>


          {/* Authenticated actions */}
          <NavbarAuthActions
            isDark={isDark}
            isAuthHydrated={isAuthHydrated}
            isAdminSession={isAdminSession}
            isLoggedIn={isLoggedIn}
            onAdminLogout={handleLogout}
          >
            {currentUser?.role === 'admin' ? (
              <>
                <AdminHeaderNotifications isDark={isDark} />
                <AdminHeaderSettings isDark={isDark} />
              </>
            ) : (
              <Link href="/notifications" className={iconBtn} aria-label="Notifications">
                <span className="material-symbols-outlined text-[1.2rem]">notifications</span>
              </Link>
            )}

            {/* Welcome chip — md+ */}
            <div className={`ml-1 hidden items-center gap-1.5 rounded-full border px-3 py-1 md:flex ${
              isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.7)]" />
              <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {userName || 'User'}
              </span>
              {currentUser?.role && (
                <span className="rounded-full bg-[#0b5d68]/10 px-1.5 py-0.5 text-[10px] font-semibold capitalize text-[#0b5d68]">
                  {currentUser.role}
                </span>
              )}
            </div>

            <ProfileDropdown userName={userName} userRole={currentUser?.role} avatarUrl={avatarUrl ?? undefined} />
          </NavbarAuthActions>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
