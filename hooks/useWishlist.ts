'use client'

import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import {
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  selectWishlistItems,
  selectWishlistCount,
  selectWishlistHydrated,
  selectWishlistLoading,
} from '@/lib/store/slices/wishlistSlice'
import { Listing } from '@/lib/dummyData'

export type { WishlistItem } from '@/lib/store/slices/wishlistSlice'

export const useWishlist = () => {
  const dispatch = useAppDispatch()
  const wishlist = useAppSelector(selectWishlistItems)
  const count = useAppSelector(selectWishlistCount)
  const isHydrated = useAppSelector(selectWishlistHydrated)
  const isLoading = useAppSelector(selectWishlistLoading)

  const add = useCallback(
    (listing: Listing) => {
      dispatch(addToWishlist(listing))
      return true
    },
    [dispatch]
  )

  const remove = useCallback(
    (listingId: string) => {
      dispatch(removeFromWishlist(listingId))
      return true
    },
    [dispatch]
  )

  const toggle = useCallback(
    (listing: Listing) => {
      dispatch(toggleWishlist(listing))
      return true
    },
    [dispatch]
  )

  const isInWishlist = useCallback(
    (listingId: string) => wishlist.some((item) => item.id === listingId),
    [wishlist]
  )

  return {
    wishlist,
    isLoading,
    isHydrated,
    addToWishlist: add,
    removeFromWishlist: remove,
    toggleWishlist: toggle,
    isInWishlist,
    count,
  }
}
