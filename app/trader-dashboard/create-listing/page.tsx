'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TraderDashboardCreateListingPage() {
  const router = useRouter()

  useEffect(() => {
    // Traders cannot create listings - redirect to listings
    router.push('/listings')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#012d1d] mx-auto"></div>
        <p className="mt-2 text-gray-600">Traders cannot create listings. Redirecting...</p>
      </div>
    </div>
  )
}
