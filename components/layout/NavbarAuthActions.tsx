'use client'

import Link from 'next/link'

interface NavbarAuthActionsProps {
  isDark: boolean
  isAuthHydrated: boolean
  isAdminSession: boolean
  isLoggedIn: boolean
  onAdminLogout: () => void
  children: React.ReactNode
}

/** Keeps header width stable while auth hydrates and between login/logged-in states. */
export default function NavbarAuthActions({
  isDark,
  isAuthHydrated,
  isAdminSession,
  isLoggedIn,
  onAdminLogout,
  children,
}: NavbarAuthActionsProps) {
  if (!isAuthHydrated) {
    return (
      <div
        className="hidden md:flex items-center gap-4 min-w-[220px] justify-end"
        aria-hidden="true"
      >
        <div className="h-9 w-24 rounded-lg bg-black/5 dark:bg-white/10" />
        <div className="h-9 w-28 rounded-lg bg-black/5 dark:bg-white/10" />
      </div>
    )
  }

  if (isAdminSession) {
    return (
      <button
        onClick={onAdminLogout}
        className="hidden md:flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors text-white bg-[#d55b39] hover:bg-[#c44928]"
      >
        <span className="material-symbols-outlined text-sm">logout</span>
        <span>Admin Logout</span>
      </button>
    )
  }

  if (isLoggedIn) {
    return <>{children}</>
  }

  return (
    <>
      <Link
        href="/login"
        className={`hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-transparent ${
          isDark
            ? 'border border-accent-turquoise text-accent-turquoise bg-accent-turquoise-hover'
            : 'border border-primary-dark text-primary-dark bg-primary-dark-hover'
        }`}
      >
        <span className="material-symbols-outlined text-sm">login</span>
        <span>Login</span>
      </Link>
      <Link
        href="/register"
        className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-transparent border border-cta-orange text-cta-orange bg-cta-orange-hover"
      >
        <span className="material-symbols-outlined text-sm">person_add</span>
        <span>Register</span>
      </Link>
    </>
  )
}
