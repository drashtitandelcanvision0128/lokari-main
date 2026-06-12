'use client'

import { useAppDispatch } from '@/lib/store/hooks'
import { logout as logoutAction } from '@/lib/store/slices/authSlice'
import { clearCart } from '@/lib/store/slices/cartSlice'
import { clearWishlist } from '@/lib/store/slices/wishlistSlice'
import { CART_STORAGE_KEY } from '@/lib/store/slices/cartSlice'
import { WISHLIST_STORAGE_KEY } from '@/lib/store/slices/wishlistSlice'

export function useLogout() {
  const dispatch = useAppDispatch()

  return () => {
    localStorage.removeItem('currentUser')
    localStorage.removeItem('userProfile')
    localStorage.removeItem(CART_STORAGE_KEY)
    localStorage.removeItem(WISHLIST_STORAGE_KEY)
    localStorage.removeItem('kycBypass')
    localStorage.removeItem('loginState')
    localStorage.removeItem('adminSession')

    Object.keys(localStorage).forEach((key) => {
      if (key.includes('user') || key.includes('auth') || key.includes('session')) {
        localStorage.removeItem(key)
      }
    })

    dispatch(logoutAction())
    dispatch(clearCart())
    dispatch(clearWishlist())
  }
}
