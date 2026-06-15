'use client'

import { useAppDispatch } from '@/lib/store/hooks'
import { logout as logoutAction } from '@/lib/store/slices/authSlice'
import { clearCart } from '@/lib/store/slices/cartSlice'
import { clearWishlist } from '@/lib/store/slices/wishlistSlice'
import { CART_STORAGE_KEY } from '@/lib/store/slices/cartSlice'
import { WISHLIST_STORAGE_KEY } from '@/lib/store/slices/wishlistSlice'
import { clearUserSession } from '@/lib/auth/session'
import { logoutFromApi } from '@/lib/auth/api'

export function useLogout() {
  const dispatch = useAppDispatch()

  return async () => {
    await logoutFromApi()
    clearUserSession()
    localStorage.removeItem(CART_STORAGE_KEY)
    localStorage.removeItem(WISHLIST_STORAGE_KEY)
    localStorage.removeItem('kycBypass')
    localStorage.removeItem('adminSession')

    dispatch(logoutAction())
    dispatch(clearCart())
    dispatch(clearWishlist())
  }
}
