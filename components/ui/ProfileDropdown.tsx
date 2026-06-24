'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLogout } from '@/hooks/useLogout'

interface ProfileDropdownProps {
  userName?: string
  userRole?: string
  avatarUrl?: string
}

const ROLE_COLORS: Record<string, string> = {
  farmer:      'bg-emerald-100 text-emerald-700',
  trader:      'bg-blue-100 text-blue-700',
  transporter: 'bg-amber-100 text-amber-700',
  warehouse:   'bg-purple-100 text-purple-700',
  admin:       'bg-rose-100 text-rose-700',
}

const ProfileDropdown = ({ userName, userRole, avatarUrl }: ProfileDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const logout = useLogout()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/')
    setIsOpen(false)
  }

  const initial = (userName || 'U').charAt(0).toUpperCase()
  const roleColor = ROLE_COLORS[userRole?.toLowerCase() ?? ''] ?? 'bg-gray-100 text-gray-600'

  const navItems = [
    { icon: 'person',       label: 'Profile',   href: `/${userRole || 'farmer'}-dashboard?tab=settings&section=profile` },
    { icon: 'dashboard',    label: 'Dashboard', href: `/${userRole || 'farmer'}-dashboard` },
    { icon: 'shopping_bag', label: 'Orders',    href: `/${userRole || 'farmer'}-dashboard?tab=orders` },
    { icon: 'tune',         label: 'Settings',  href: `/${userRole || 'farmer'}-dashboard?tab=settings` },
  ]

  return (
    <div className="relative" ref={dropdownRef}>

      {/* ── Avatar button ──────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Profile menu"
        aria-expanded={isOpen}
        className={`
          relative ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full
          overflow-hidden shadow-sm ring-2 ring-transparent transition-all duration-200
          hover:scale-105 hover:ring-[#2eb5c2]/40 focus:outline-none
          ${isOpen ? 'ring-[#2eb5c2]/50 scale-105' : ''}
        `}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={userName || 'User'} className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2] text-sm font-bold text-white">
            {initial}
          </span>
        )}
      </button>

      {/* ── Dropdown ───────────────────────────────────────────────── */}
      <div
        className={`
          absolute right-0 mt-2.5 w-56 origin-top-right overflow-hidden
          rounded-2xl border border-gray-100 bg-white
          shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm
          transition-all duration-200 ease-out
          ${isOpen ? 'pointer-events-auto translate-y-0 opacity-100 scale-100' : 'pointer-events-none -translate-y-2 opacity-0 scale-95'}
        `}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="relative overflow-hidden px-5 pb-4 pt-5">
          {/* background gradient blobs */}
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#2eb5c2]/10" />
          <div className="pointer-events-none absolute -left-4 bottom-0 h-16 w-16 rounded-full bg-[#0b5d68]/8" />

          <div className="relative flex items-center gap-3">
            {/* Large avatar */}
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl shadow-md">
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName || 'User'} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2] text-lg font-bold text-white">
                  {initial}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-headline text-[15px] font-bold text-gray-800">
                {userName || 'User'}
              </p>
              <span className={`mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${roleColor}`}>
                {userRole || 'farmer'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Nav items ──────────────────────────────────────────── */}
        <div className="border-t border-gray-100 py-1.5">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-gray-50"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-colors group-hover:bg-[#0b5d68]/10 group-hover:text-[#0b5d68]">
                <span className="material-symbols-outlined text-[1rem]">{item.icon}</span>
              </span>
              <span className="flex-1 text-[13px] font-medium text-gray-700 group-hover:text-gray-900">
                {item.label}
              </span>
              <span className="material-symbols-outlined translate-x-0 text-[0.9rem] text-gray-300 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100">
                chevron_right
              </span>
            </Link>
          ))}
        </div>

        {/* ── Logout ─────────────────────────────────────────────── */}
        <div className="border-t border-gray-100 px-3 py-2">
          <button
            type="button"
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-red-50"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500 transition-colors group-hover:bg-red-100">
              <span className="material-symbols-outlined text-[1rem]">logout</span>
            </span>
            <span className="flex-1 text-left text-[13px] font-medium text-red-600">
              Sign out
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfileDropdown
