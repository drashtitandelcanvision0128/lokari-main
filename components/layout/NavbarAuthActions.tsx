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

const loginButtonClass = (isDark: boolean) =>
  `inline-flex shrink-0 items-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] font-medium leading-none transition-colors sm:gap-2 sm:px-4 sm:py-2 sm:text-sm ${
    isDark
      ? 'border-accent-turquoise text-accent-turquoise bg-accent-turquoise-hover'
      : 'border-primary-dark text-primary-dark bg-primary-dark-hover'
  }`

const registerButtonClass =
  'inline-flex shrink-0 items-center gap-1 rounded-lg border border-cta-orange bg-transparent px-2 py-1.5 text-[11px] font-medium leading-none text-cta-orange transition-colors bg-cta-orange-hover sm:gap-2 sm:px-4 sm:py-2 sm:text-sm'

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
        className="flex shrink-0 items-center gap-1.5 sm:gap-2"
        aria-hidden="true"
      >
        <div className="h-9 w-9 rounded-lg bg-black/5 dark:bg-white/10 sm:h-9 sm:w-24" />
        <div className="h-9 w-9 rounded-lg bg-black/5 dark:bg-white/10 sm:h-9 sm:w-28" />
      </div>
    )
  }

  if (isAdminSession) {
    return (
      <button
        type="button"
        onClick={onAdminLogout}
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#d55b39] px-2.5 py-1.5 text-xs text-white transition-colors hover:bg-[#c44928] sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
      >
        <span className="material-symbols-outlined text-base sm:text-sm">logout</span>
        <span className="hidden sm:inline">Logout</span>
      </button>
    )
  }

  if (isLoggedIn) {
    return <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">{children}</div>
  }

  return (
    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
      <Link href="/login" aria-label="Login" className={loginButtonClass(isDark)}>
        <span className="material-symbols-outlined text-base leading-none sm:text-sm">login</span>
        <span>Login</span>
      </Link>
      <Link href="/register" aria-label="Register" className={registerButtonClass}>
        <span className="material-symbols-outlined text-base leading-none sm:text-sm">person_add</span>
        <span>Register</span>
      </Link>
    </div>
  )
}
