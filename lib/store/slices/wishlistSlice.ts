import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Listing } from '@/lib/dummyData'

export interface WishlistItem {
  id: string
  listing: Listing
  addedAt: string
}

export const WISHLIST_STORAGE_KEY = 'lokhari_wishlist'

interface WishlistState {
  items: WishlistItem[]
  isLoading: boolean
  isHydrated: boolean
}

const initialState: WishlistState = {
  items: [],
  isLoading: true,
  isHydrated: false,
}

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    hydrateWishlist(state, action: PayloadAction<WishlistItem[]>) {
      state.items = action.payload
      state.isLoading = false
      state.isHydrated = true
    },
    addToWishlist(state, action: PayloadAction<Listing>) {
      if (state.items.some((item) => item.id === action.payload.id)) return
      state.items.push({
        id: action.payload.id,
        listing: action.payload,
        addedAt: new Date().toISOString(),
      })
    },
    removeFromWishlist(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
    toggleWishlist(state, action: PayloadAction<Listing>) {
      const index = state.items.findIndex((item) => item.id === action.payload.id)
      if (index !== -1) {
        state.items.splice(index, 1)
      } else {
        state.items.push({
          id: action.payload.id,
          listing: action.payload,
          addedAt: new Date().toISOString(),
        })
      }
    },
    clearWishlist(state) {
      state.items = []
    },
    syncWishlistFromStorage(state, action: PayloadAction<WishlistItem[]>) {
      state.items = action.payload
    },
  },
})

export const {
  hydrateWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
  syncWishlistFromStorage,
} = wishlistSlice.actions

export default wishlistSlice.reducer

export const selectWishlistItems = (state: { wishlist: WishlistState }) => state.wishlist.items
export const selectWishlistCount = (state: { wishlist: WishlistState }) => state.wishlist.items.length
export const selectWishlistHydrated = (state: { wishlist: WishlistState }) =>
  state.wishlist.isHydrated
export const selectWishlistLoading = (state: { wishlist: WishlistState }) =>
  state.wishlist.isLoading
export const selectIsInWishlist = (listingId: string) => (state: { wishlist: WishlistState }) =>
  state.wishlist.items.some((item) => item.id === listingId)
