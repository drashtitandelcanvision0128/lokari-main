'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  if (pathname.startsWith('/admin')) {
    return <div className="flex-1">{children}</div>
  }

  return <div className="page-enter flex-1">{children}</div>
}
