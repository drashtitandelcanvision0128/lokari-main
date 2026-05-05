'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface LayoutWrapperProps {
  children: ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  
  // Hide footer on dashboard and admin pages
  const shouldHideFooter = pathname.startsWith('/dashboard') || pathname.startsWith('/admin')
  
  return (
    <div className="min-h-screen flex flex-col">
      {children}
      {!shouldHideFooter && (
        <div className="mt-auto">
          {/* Footer will be rendered here */}
        </div>
      )}
    </div>
  )
}
