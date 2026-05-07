'use client'

import { useState } from 'react'
import { useCart } from '@/hooks/useCart'
import { Listing } from '@/lib/dummyData'

interface CartIconProps {
  listing: Listing
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const CartIcon = ({ listing, size = 'md', className = '' }: CartIconProps) => {
  const { isInCart, toggleCart, isHydrated } = useCart()
  const [isAnimating, setIsAnimating] = useState(false)

  // Only check cart state after hydration to prevent server/client mismatch
  const isInCartState = isHydrated ? isInCart(listing.id) : false

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7'
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsAnimating(true)
    toggleCart(listing)
    
    setTimeout(() => setIsAnimating(false), 300)
  }

  return (
    <button
      onClick={handleClick}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center
        rounded-xl transition-all duration-300 ease-out
        ${isInCartState 
          ? 'bg-gradient-to-br from-[#e89151] via-[#d67a40] to-[#c56a30] text-white shadow-xl ring-2 ring-[#e89151]/50 hover:ring-4 hover:scale-105' 
          : 'bg-gradient-to-br from-white via-gray-50 to-gray-100 text-[#0b5d68] shadow-xl ring-2 ring-[#0b5d68]/20 hover:ring-4 hover:scale-105 hover:from-[#e89151] hover:via-gray-50 hover:to-white'
        }
        ${isAnimating ? 'scale-110' : 'hover:scale-105'}
        ${className}
      `}
      aria-label={isInCartState ? 'Remove from cart' : 'Add to cart'}
      title={isInCartState ? 'Remove from cart' : 'Add to cart'}
    >
      {isInCartState ? (
        // Premium filled state with white cart icon
        <div className="relative w-full h-full flex items-center justify-center">
          <svg
            className={`w-4 h-4 ${isAnimating ? 'animate-pulse' : ''}`}
            fill="white"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#d55b39] rounded-full flex items-center justify-center">
            <svg
              className="w-2 h-2 text-white"
              viewBox="0 0 24 24"
              fill="white"
              stroke="white"
              strokeWidth="1"
            >
              <path 
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                fill="white"
              />
            </svg>
          </div>
        </div>
      ) : (
        // Premium outline state with gradient
        <svg
          className={`w-4 h-4 ${isAnimating ? 'animate-pulse' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      )}
    </button>
  )
}

export default CartIcon
