'use client'

import { useCartContext } from '@/contexts/CartContext'
import { CartItem } from '@/contexts/CartContext'

export const useCart = () => {
  const context = useCartContext()
  
  // Return the same interface as before for compatibility
  return {
    cart: context.items,
    isLoading: context.isLoading,
    isHydrated: context.isHydrated,
    addToCart: context.addToCart,
    removeFromCart: context.removeFromCart,
    updateQuantity: context.updateQuantity,
    isInCart: context.isInCart,
    toggleCart: context.toggleCart,
    clearCart: context.clearCart,
    getCartTotal: () => context.total,
    count: context.count,
    total: context.total
  }
}
