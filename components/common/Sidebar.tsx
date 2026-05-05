'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  role: string
}

const Sidebar = ({ role }: SidebarProps) => {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  const getRoleSpecificLinks = () => {
    switch (role) {
      case 'farmer':
        return [
          { href: '/create-listing', label: 'Create Listing' },
          { href: '/transactions', label: 'My Transactions' },
        ]
      case 'trader':
        return [
          { href: '/transactions', label: 'My Bids' },
          { href: '/listings', label: 'Browse Listings' },
        ]
      case 'warehouse':
        return [
          { href: '/create-listing', label: 'Offer Storage' },
          { href: '/transactions', label: 'Storage Requests' },
        ]
      case 'transporter':
        return [
          { href: '/create-listing', label: 'Offer Transport' },
          { href: '/transactions', label: 'Transport Jobs' },
        ]
      default:
        return []
    }
  }

  const commonLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/listings', label: 'Listings' },
    { href: '/notifications', label: 'Notifications' },
  ]

  const roleSpecificLinks = getRoleSpecificLinks()

  return (
    <div className="w-64 bg-[#f9f9f7] shadow-sm border-r border-[#e0e0e0] min-h-screen">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-[#0b5d68] mb-6">
          {role.charAt(0).toUpperCase() + role.slice(1)} Portal
        </h2>
        
        <nav className="space-y-2">
          {commonLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive(link.href)
                  ? 'bg-[#2eb5c2] text-white'
                  : 'text-[#0b5d68] hover:bg-[#f0f0f0] hover:text-[#2eb5c2]'
              }`}
            >
              {link.label}
            </Link>
          ))}
          
          <div className="border-t border-[#e0e0e0] pt-4 mt-4">
            <p className="text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">
              {role.charAt(0).toUpperCase() + role.slice(1)} Actions
            </p>
            {roleSpecificLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(link.href)
                    ? 'bg-[#2eb5c2] text-white'
                    : 'text-[#0b5d68] hover:bg-[#f0f0f0] hover:text-[#2eb5c2]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}

export default Sidebar
