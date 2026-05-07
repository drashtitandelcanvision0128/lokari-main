import { Listing } from './dummyData'

export interface CartItem {
  id: string
  listing: Listing
  quantity: number
  addedAt: string
}

const CART_STORAGE_KEY = 'lokhari_cart'

export class CartService {
  static getCart(): CartItem[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading cart:', error)
      return []
    }
  }

  static addToCart(listing: Listing, quantity: number = 1): boolean {
    if (typeof window === 'undefined') return false
    
    try {
      const cart = this.getCart()
      
      // Check if already in cart
      const existingItemIndex = cart.findIndex(item => item.id === listing.id)
      
      if (existingItemIndex !== -1) {
        // Update quantity if already exists
        cart[existingItemIndex].quantity += quantity
      } else {
        // Add new item
        const newItem: CartItem = {
          id: listing.id,
          listing,
          quantity,
          addedAt: new Date().toISOString()
        }
        cart.push(newItem)
      }

      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
      
      // Trigger storage event for cross-tab sync
      window.dispatchEvent(new StorageEvent('storage', {
        key: CART_STORAGE_KEY,
        newValue: JSON.stringify(cart)
      }))
      
      return true
    } catch (error) {
      console.error('Error adding to cart:', error)
      return false
    }
  }

  static removeFromCart(listingId: string): boolean {
    if (typeof window === 'undefined') return false
    
    try {
      const cart = this.getCart()
      const filteredCart = cart.filter(item => item.id !== listingId)
      
      if (filteredCart.length === cart.length) {
        return false // Item not found
      }

      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(filteredCart))
      
      // Trigger storage event for cross-tab sync
      window.dispatchEvent(new StorageEvent('storage', {
        key: CART_STORAGE_KEY,
        newValue: JSON.stringify(filteredCart)
      }))
      
      return true
    } catch (error) {
      console.error('Error removing from cart:', error)
      return false
    }
  }

  static updateQuantity(listingId: string, quantity: number): boolean {
    if (typeof window === 'undefined') return false
    if (quantity <= 0) return this.removeFromCart(listingId)
    
    try {
      const cart = this.getCart()
      const itemIndex = cart.findIndex(item => item.id === listingId)
      
      if (itemIndex === -1) {
        return false // Item not found
      }

      cart[itemIndex].quantity = quantity
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
      
      // Trigger storage event for cross-tab sync
      window.dispatchEvent(new StorageEvent('storage', {
        key: CART_STORAGE_KEY,
        newValue: JSON.stringify(cart)
      }))
      
      return true
    } catch (error) {
      console.error('Error updating cart quantity:', error)
      return false
    }
  }

  static isInCart(listingId: string): boolean {
    if (typeof window === 'undefined') return false
    
    try {
      const cart = this.getCart()
      return cart.some(item => item.id === listingId)
    } catch (error) {
      console.error('Error checking cart status:', error)
      return false
    }
  }

  static getCartCount(): number {
    if (typeof window === 'undefined') return 0
    
    try {
      const cart = this.getCart()
      return cart.reduce((total, item) => total + item.quantity, 0)
    } catch (error) {
      console.error('Error getting cart count:', error)
      return 0
    }
  }

  static getCartTotal(): number {
    if (typeof window === 'undefined') return 0
    
    try {
      const cart = this.getCart()
      return cart.reduce((total, item) => total + (item.listing.price * item.quantity), 0)
    } catch (error) {
      console.error('Error calculating cart total:', error)
      return 0
    }
  }

  static clearCart(): boolean {
    if (typeof window === 'undefined') return false
    
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([]))
      
      // Trigger storage event for cross-tab sync
      window.dispatchEvent(new StorageEvent('storage', {
        key: CART_STORAGE_KEY,
        newValue: JSON.stringify([])
      }))
      
      return true
    } catch (error) {
      console.error('Error clearing cart:', error)
      return false
    }
  }

  static getCartListings(): Listing[] {
    if (typeof window === 'undefined') return []
    
    try {
      const cart = this.getCart()
      return cart.map(item => item.listing)
    } catch (error) {
      console.error('Error getting cart listings:', error)
      return []
    }
  }
}
