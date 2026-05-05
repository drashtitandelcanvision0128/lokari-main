'use client'

import { usePathname } from 'next/navigation'
import Footer from './Footer'

export default function ConditionalFooter() {
  const pathname = usePathname()
  
  // Hide footer on all dashboard and admin pages
  const shouldHideFooter = pathname.startsWith('/dashboard') || 
                           pathname.startsWith('/farmer-dashboard') || 
                           pathname.startsWith('/trader-dashboard') || 
                           pathname.startsWith('/transporter-dashboard') || 
                           pathname.startsWith('/warehouse-dashboard') || 
                           pathname.startsWith('/admin')

  if (shouldHideFooter) {
    return null
  }

  return <Footer />
}
