'use client'

import { useState, useEffect, useCallback } from 'react'
import { WishlistService, WishlistItem } from '@/lib/wishlist'
import { Listing } from '@/lib/dummyData'

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
    // Load wishlist on mount
    const loadWishlist = () => {
      setWishlist(WishlistService.getWishlist())
      setIsLoading(false)
    }

    loadWishlist()

    // Listen for storage changes (cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lokhari_wishlist') {
        loadWishlist()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const addToWishlist = useCallback((listing: Listing) => {
    const success = WishlistService.addToWishlist(listing)
    if (success) {
      setWishlist(WishlistService.getWishlist())
    }
    return success
  }, [])

  const removeFromWishlist = useCallback((listingId: string) => {
    const success = WishlistService.removeFromWishlist(listingId)
    if (success) {
      setWishlist(WishlistService.getWishlist())
    }
    return success
  }, [])

  const isInWishlist = useCallback((listingId: string) => {
    return WishlistService.isInWishlist(listingId)
  }, [])

  const toggleWishlist = useCallback((listing: Listing) => {
    if (isInWishlist(listing.id)) {
      return removeFromWishlist(listing.id)
    } else {
      return addToWishlist(listing)
    }
  }, [addToWishlist, isInWishlist, removeFromWishlist])

  return {
    wishlist,
    isLoading,
    isHydrated,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    count: wishlist.length
  }
}
