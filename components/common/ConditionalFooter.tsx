'use client'

import { usePathname } from 'next/navigation'
import Footer from './Footer'

export default function ConditionalFooter() {
  const pathname = usePathname()

  const shouldHideFooter =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/farmer-dashboard') ||
    pathname.startsWith('/trader-dashboard') ||
    pathname.startsWith('/transporter-dashboard') ||
    pathname.startsWith('/warehouse-dashboard') ||
    pathname.startsWith('/admin')

  return (
    <div
      className={`transition-opacity duration-200 ${shouldHideFooter ? 'h-0 overflow-hidden opacity-0 pointer-events-none' : 'opacity-100'}`}
      aria-hidden={shouldHideFooter}
    >
      <Footer />
    </div>
  )
}
