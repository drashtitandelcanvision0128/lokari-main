'use client'

import { useRef, useEffect } from 'react'
import { Provider } from 'react-redux'
import { makeStore, AppStore } from '@/lib/store/store'
import { registrationService } from '@/lib/registration'
import { hydrateAuth, logout } from '@/lib/store/slices/authSlice'
import {
  hydrateCart,
  syncCartFromStorage,
  CART_STORAGE_KEY,
  type CartItem,
} from '@/lib/store/slices/cartSlice'
import {
  hydrateWishlist,
  syncWishlistFromStorage,
  WISHLIST_STORAGE_KEY,
  type WishlistItem,
} from '@/lib/store/slices/wishlistSlice'

function persistCart(items: CartItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
}

function persistWishlist(items: WishlistItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items))
}

function StoreHydrator({ store }: { store: AppStore }) {
  useEffect(() => {
    const user = registrationService.getCurrentUser()
    const profile = registrationService.getUserProfile()
    store.dispatch(hydrateAuth({ user, profile }))

    try {
      const cartRaw = localStorage.getItem(CART_STORAGE_KEY)
      const cart = cartRaw ? (JSON.parse(cartRaw) as CartItem[]) : []
      store.dispatch(hydrateCart(cart))
    } catch {
      store.dispatch(hydrateCart([]))
    }

    try {
      const wishlistRaw = localStorage.getItem(WISHLIST_STORAGE_KEY)
      const wishlist = wishlistRaw ? (JSON.parse(wishlistRaw) as WishlistItem[]) : []
      store.dispatch(hydrateWishlist(wishlist))
    } catch {
      store.dispatch(hydrateWishlist([]))
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'currentUser') {
        if (!event.newValue) {
          store.dispatch(logout())
          return
        }
        try {
          store.dispatch(hydrateAuth({ user: JSON.parse(event.newValue), profile: registrationService.getUserProfile() }))
        } catch {
          store.dispatch(logout())
        }
      }

      if (event.key === CART_STORAGE_KEY && event.newValue) {
        try {
          store.dispatch(syncCartFromStorage(JSON.parse(event.newValue)))
        } catch {
          /* ignore */
        }
      }

      if (event.key === WISHLIST_STORAGE_KEY && event.newValue) {
        try {
          store.dispatch(syncWishlistFromStorage(JSON.parse(event.newValue)))
        } catch {
          /* ignore */
        }
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [store])

  useEffect(() => {
    let prevCart = store.getState().cart.items
    let prevWishlist = store.getState().wishlist.items

    const unsubscribe = store.subscribe(() => {
      const state = store.getState()
      if (state.cart.isHydrated && state.cart.items !== prevCart) {
        prevCart = state.cart.items
        persistCart(state.cart.items)
      }
      if (state.wishlist.isHydrated && state.wishlist.items !== prevWishlist) {
        prevWishlist = state.wishlist.items
        persistWishlist(state.wishlist.items)
      }
    })

    return unsubscribe
  }, [store])

  return null
}

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null)

  if (!storeRef.current) {
    storeRef.current = makeStore()
  }

  return (
    <Provider store={storeRef.current}>
      <StoreHydrator store={storeRef.current} />
      {children}
    </Provider>
  )
}
