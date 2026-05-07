'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { Listing } from '@/lib/dummyData'

export interface CartItem {
  id: string
  listing: Listing
  quantity: number
  addedAt: string
}

interface CartState {
  items: CartItem[]
  isLoading: boolean
  isHydrated: boolean
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_HYDRATED'; payload: boolean }
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: { listing: Listing; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }

const CART_STORAGE_KEY = 'lokhari_cart'

const initialState: CartState = {
  items: [],
  isLoading: true,
  isHydrated: false,
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'SET_HYDRATED':
      return { ...state, isHydrated: action.payload }
    
    case 'SET_CART':
      return { ...state, items: action.payload, isLoading: false }
    
    case 'ADD_ITEM': {
      const { listing, quantity } = action.payload
      const existingItemIndex = state.items.findIndex(item => item.id === listing.id)
      
      let newItems: CartItem[]
      if (existingItemIndex !== -1) {
        // Update quantity if already exists
        newItems = [...state.items]
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity
        }
      } else {
        // Add new item
        const newItem: CartItem = {
          id: listing.id,
          listing,
          quantity,
          addedAt: new Date().toISOString()
        }
        newItems = [...state.items, newItem]
      }
      
      return { ...state, items: newItems }
    }
    
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      }
    
    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== id)
        }
      }
      
      return {
        ...state,
        items: state.items.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      }
    }
    
    case 'CLEAR_CART':
      return { ...state, items: [] }
    
    default:
      return state
  }
}

interface CartContextType {
  items: CartItem[]
  isLoading: boolean
  isHydrated: boolean
  count: number
  total: number
  addToCart: (listing: Listing, quantity?: number) => void
  removeFromCart: (listingId: string) => void
  updateQuantity: (listingId: string, quantity: number) => void
  clearCart: () => void
  isInCart: (listingId: string) => boolean
  toggleCart: (listing: Listing) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCart = () => {
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem(CART_STORAGE_KEY)
          const cart = stored ? JSON.parse(stored) : []
          dispatch({ type: 'SET_CART', payload: cart })
        }
      } catch (error) {
        console.error('Error loading cart:', error)
        dispatch({ type: 'SET_CART', payload: [] })
      } finally {
        dispatch({ type: 'SET_HYDRATED', payload: true })
      }
    }

    loadCart()
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (state.isHydrated && typeof window !== 'undefined') {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items))
      } catch (error) {
        console.error('Error saving cart:', error)
      }
    }
  }, [state.items, state.isHydrated])

  // Listen for storage changes from other tabs (only for cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Only handle storage events from other tabs, not from our own localStorage writes
      if (e.key === CART_STORAGE_KEY && e.newValue && e.storageArea === localStorage) {
        try {
          const cart = JSON.parse(e.newValue)
          dispatch({ type: 'SET_CART', payload: cart })
        } catch (error) {
          console.error('Error syncing cart from storage:', error)
        }
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange)
      return () => window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Computed values
  const count = state.items.reduce((total, item) => total + item.quantity, 0)
  const total = state.items.reduce((sum, item) => sum + (item.listing.price * item.quantity), 0)

  // Actions
  const addToCart = useCallback((listing: Listing, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { listing, quantity } })
  }, [])

  const removeFromCart = useCallback((listingId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: listingId })
  }, [])

  const updateQuantity = useCallback((listingId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: listingId, quantity } })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' })
  }, [])

  const isInCart = useCallback((listingId: string) => {
    return state.items.some(item => item.id === listingId)
  }, [state.items])

  const toggleCart = useCallback((listing: Listing) => {
    if (isInCart(listing.id)) {
      removeFromCart(listing.id)
    } else {
      addToCart(listing, 1)
    }
  }, [isInCart, addToCart, removeFromCart])

  const value: CartContextType = {
    items: state.items,
    isLoading: state.isLoading,
    isHydrated: state.isHydrated,
    count,
    total,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    toggleCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCartContext() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider')
  }
  return context
}
