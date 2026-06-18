'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLogout } from '@/hooks/useLogout'

interface ProfileDropdownProps {
  userName?: string
  userRole?: string
}

const ProfileDropdown = ({ userName, userRole }: ProfileDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const logout = useLogout()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  const menuItems = [
    {
      icon: 'person',
      label: 'Profile',
      // href: '/profile',
      href: `/${userRole || 'farmer'}-dashboard?tab=settings&section=profile`,
      description: 'View and edit your profile'
    },
    {
      icon: 'dashboard',
      label: 'Dashboard',
      href: `/${userRole || 'farmer'}-dashboard`,
      description: 'Overview and analytics'
    },
    {
      icon: 'shopping_bag',
      label: 'Orders',
      href: `/${userRole || 'farmer'}-dashboard?tab=orders`,
      description: 'View your order history'
    },
    {
      icon: 'settings',
      label: 'Settings',
      href: `/${userRole || 'farmer'}-dashboard?tab=settings`,
      description: 'Account preferences'
    },
    {
      icon: 'logout',
      label: 'Logout',
      action: handleLogout,
      description: 'Sign out of your account',
      isDanger: true
    }
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 rounded-full overflow-hidden bg-surface-container ml-2 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#0b5d68]/20"
        aria-label="Profile menu"
        aria-expanded={isOpen}
      >
        <div className="h-full w-full bg-[#a5dce4] flex items-center justify-center">
          <span className="material-symbols-outlined text-[#0b5d68] text-sm">person</span>
        </div>
      </button>

      {/* Dropdown Menu */}
      <div className={`
        absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl border border-[#e5e2de] bg-white overflow-hidden
        transform transition-all duration-300 ease-out origin-top-right
        ${isOpen
          ? 'opacity-100 scale-100 translate-y-0'
          : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        }
      `}>
        {/* User Info Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#f9f9f7] to-[#f5f5f5] border-b border-[#e5e2de]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#a5dce4] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#0b5d68]">person</span>
            </div>
            <div>
              <p className="font-semibold text-[#0b5d68] font-['Manrope']">
                {userName || 'User'}
              </p>
              <p className="text-xs text-[#717973] capitalize">
                {userRole || 'farmer'}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          {menuItems.map((item, index) => (
            <div key={index}>
              {item.href ? (
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-4 px-6 py-3 transition-all duration-200
                    hover:bg-[#f9f9f7] group
                    ${item.isDanger ? 'hover:bg-red-50' : ''}
                  `}
                >
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center transition-colors
                    ${item.isDanger
                      ? 'bg-red-100 text-red-600 group-hover:bg-red-200'
                      : 'bg-[#f0ede9] text-[#0b5d68] group-hover:bg-[#e5e2de]'
                    }
                  `}>
                    <span className="material-symbols-outlined text-lg">
                      {item.icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className={`
                      font-medium font-['Manrope']
                      ${item.isDanger ? 'text-red-600' : 'text-[#0b5d68]'}
                    `}>
                      {item.label}
                    </p>
                    <p className="text-xs text-[#717973] mt-0.5">
                      {item.description}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[#717973] text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    chevron_right
                  </span>
                </Link>
              ) : (
                <button
                  onClick={item.action}
                  className={`
                    w-full flex items-center gap-4 px-6 py-3 transition-all duration-200
                    hover:bg-red-50 group text-left
                  `}
                >
                  <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center transition-colors group-hover:bg-red-200">
                    <span className="material-symbols-outlined text-lg">
                      {item.icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-red-600 font-['Manrope']">
                      {item.label}
                    </p>
                    <p className="text-xs text-[#717973] mt-0.5">
                      {item.description}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-red-600 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    chevron_right
                  </span>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#f9f9f7] border-t border-[#e5e2de]">
          <p className="text-xs text-[#717973] text-center">
            Lokhari Agricultural Exchange
          </p>
        </div>
      </div>
    </div>
  )
}

export default ProfileDropdown
