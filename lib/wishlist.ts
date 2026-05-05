import { Listing } from './dummyData'

export interface WishlistItem {
  id: string
  listing: Listing
  addedAt: string
}

const WISHLIST_STORAGE_KEY = 'lokhari_wishlist'

export class WishlistService {
  static getWishlist(): WishlistItem[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading wishlist:', error)
      return []
    }
  }

  static addToWishlist(listing: Listing): boolean {
    if (typeof window === 'undefined') return false
    
    try {
      const wishlist = this.getWishlist()
      
      // Check if already in wishlist
      if (wishlist.some(item => item.id === listing.id)) {
        return false // Already exists
      }

      const newItem: WishlistItem = {
        id: listing.id,
        listing,
        addedAt: new Date().toISOString()
      }

      wishlist.push(newItem)
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist))
      
      // Trigger storage event for cross-tab sync
      window.dispatchEvent(new StorageEvent('storage', {
        key: WISHLIST_STORAGE_KEY,
        newValue: JSON.stringify(wishlist)
      }))
      
      return true
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      return false
    }
  }

  static removeFromWishlist(listingId: string): boolean {
    if (typeof window === 'undefined') return false
    
    try {
      const wishlist = this.getWishlist()
      const filteredWishlist = wishlist.filter(item => item.id !== listingId)
      
      if (filteredWishlist.length === wishlist.length) {
        return false // Item not found
      }

      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(filteredWishlist))
      
      // Trigger storage event for cross-tab sync
      window.dispatchEvent(new StorageEvent('storage', {
        key: WISHLIST_STORAGE_KEY,
        newValue: JSON.stringify(filteredWishlist)
      }))
      
      return true
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      return false
    }
  }

  static isInWishlist(listingId: string): boolean {
    if (typeof window === 'undefined') return false
    
    try {
      const wishlist = this.getWishlist()
      return wishlist.some(item => item.id === listingId)
    } catch (error) {
      console.error('Error checking wishlist status:', error)
      return false
    }
  }

  static getWishlistCount(): number {
    if (typeof window === 'undefined') return 0
    
    try {
      return this.getWishlist().length
    } catch (error) {
      console.error('Error getting wishlist count:', error)
      return 0
    }
  }

  static clearWishlist(): boolean {
    if (typeof window === 'undefined') return false
    
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify([]))
      
      // Trigger storage event for cross-tab sync
      window.dispatchEvent(new StorageEvent('storage', {
        key: WISHLIST_STORAGE_KEY,
        newValue: JSON.stringify([])
      }))
      
      return true
    } catch (error) {
      console.error('Error clearing wishlist:', error)
      return false
    }
  }

  static getWishlistListings(): Listing[] {
    if (typeof window === 'undefined') return []
    
    try {
      const wishlist = this.getWishlist()
      return wishlist.map(item => item.listing)
    } catch (error) {
      console.error('Error getting wishlist listings:', error)
      return []
    }
  }
}

