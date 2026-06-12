'use client'

import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  selectCartItems,
  selectCartCount,
  selectCartTotal,
  selectCartHydrated,
  selectCartLoading,
} from '@/lib/store/slices/cartSlice'
import { Listing } from '@/lib/dummyData'

export type { CartItem } from '@/lib/store/slices/cartSlice'

export const useCart = () => {
  const dispatch = useAppDispatch()
  const cart = useAppSelector(selectCartItems)
  const count = useAppSelector(selectCartCount)
  const total = useAppSelector(selectCartTotal)
  const isHydrated = useAppSelector(selectCartHydrated)
  const isLoading = useAppSelector(selectCartLoading)

  const add = useCallback(
    (listing: Listing, quantity = 1) => dispatch(addToCart({ listing, quantity })),
    [dispatch]
  )

  const remove = useCallback(
    (listingId: string) => dispatch(removeFromCart(listingId)),
    [dispatch]
  )

  const update = useCallback(
    (listingId: string, quantity: number) => dispatch(updateQuantity({ id: listingId, quantity })),
    [dispatch]
  )

  const clear = useCallback(() => dispatch(clearCart()), [dispatch])

  const isInCart = useCallback(
    (listingId: string) => cart.some((item) => item.id === listingId),
    [cart]
  )

  const toggleCart = useCallback(
    (listing: Listing) => {
      if (isInCart(listing.id)) {
        dispatch(removeFromCart(listing.id))
      } else {
        dispatch(addToCart({ listing, quantity: 1 }))
      }
    },
    [dispatch, isInCart]
  )

  return {
    cart,
    items: cart,
    isLoading,
    isHydrated,
    count,
    total,
    addToCart: add,
    removeFromCart: remove,
    updateQuantity: update,
    clearCart: clear,
    isInCart,
    toggleCart,
    getCartTotal: () => total,
  }
}
