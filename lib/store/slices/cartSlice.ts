import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Listing } from '@/lib/dummyData'

export interface CartItem {
  id: string
  listing: Listing
  quantity: number
  addedAt: string
}

export const CART_STORAGE_KEY = 'lokhari_cart'

interface CartState {
  items: CartItem[]
  isLoading: boolean
  isHydrated: boolean
}

const initialState: CartState = {
  items: [],
  isLoading: true,
  isHydrated: false,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    hydrateCart(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload
      state.isLoading = false
      state.isHydrated = true
    },
    setCartLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
    },
    addToCart(state, action: PayloadAction<{ listing: Listing; quantity?: number }>) {
      const { listing, quantity = 1 } = action.payload
      const existingIndex = state.items.findIndex((item) => item.id === listing.id)

      if (existingIndex !== -1) {
        state.items[existingIndex].quantity += quantity
      } else {
        state.items.push({
          id: listing.id,
          listing,
          quantity,
          addedAt: new Date().toISOString(),
        })
      }
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
    updateQuantity(state, action: PayloadAction<{ id: string; quantity: number }>) {
      const { id, quantity } = action.payload
      if (quantity <= 0) {
        state.items = state.items.filter((item) => item.id !== id)
        return
      }
      const item = state.items.find((entry) => entry.id === id)
      if (item) item.quantity = quantity
    },
    clearCart(state) {
      state.items = []
    },
    syncCartFromStorage(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload
    },
  },
})

export const {
  hydrateCart,
  setCartLoading,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  syncCartFromStorage,
} = cartSlice.actions

export default cartSlice.reducer

export const selectCartItems = (state: { cart: CartState }) => state.cart.items
export const selectCartCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0)
export const selectCartTotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, item) => sum + item.listing.price * item.quantity, 0)
export const selectCartHydrated = (state: { cart: CartState }) => state.cart.isHydrated
export const selectCartLoading = (state: { cart: CartState }) => state.cart.isLoading
export const selectIsInCart = (listingId: string) => (state: { cart: CartState }) =>
  state.cart.items.some((item) => item.id === listingId)
