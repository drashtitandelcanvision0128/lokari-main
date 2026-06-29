'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useMemo } from 'react'

/**
 * Hook to provide context-aware navigation for Post Listing functionality
 * 
 * Routes users to appropriate create-listing page based on their current location:
 * - From /listing → /listing/create-listing  
 * - From /{role}-dashboard → /{role}-dashboard/create-listing
 * - Fallback to /create-listing for other routes
 */
export function usePostListingNavigation() {
  const pathname = usePathname()
  const router = useRouter()

  const createListingPath = useMemo(() => {
    // Remove trailing slash for consistent matching
    const normalizedPath = pathname.replace(/\/$/, '')

    // Check if user is on /listing page
    if (normalizedPath === '/listings') {
      // return '/listings/create-listing'
      return '/create-listing'
    }

    // Check if user is on a role-based dashboard (e.g., /farmer-dashboard)
    const dashboardMatch = normalizedPath.match(/^\/([^\/]+)-dashboard$/)
    if (dashboardMatch) {
      const role = dashboardMatch[1]
      return `/${role}-dashboard/create-listing`
    }

    // Default fallback
    return '/create-listing'
  }, [pathname])

  const navigateToCreateListing = () => {
    router.push(createListingPath)
  }

  return {
    createListingPath,
    navigateToCreateListing
  }
}
