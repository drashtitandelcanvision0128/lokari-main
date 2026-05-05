'use client'

import { useState } from 'react'
import { useWishlist } from '@/hooks/useWishlist'
import { Listing } from '@/lib/dummyData'

interface WishlistIconProps {
  listing: Listing
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const WishlistIcon = ({ listing, size = 'md', className = '' }: WishlistIconProps) => {
  const { isInWishlist, toggleWishlist, isHydrated } = useWishlist()
  const [isAnimating, setIsAnimating] = useState(false)

  // Only check wishlist state after hydration to prevent server/client mismatch
  const isWishlisted = isHydrated ? isInWishlist(listing.id) : false

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7'
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsAnimating(true)
    toggleWishlist(listing)
    
    setTimeout(() => setIsAnimating(false), 300)
  }

  return (
    <button
      onClick={handleClick}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center
        rounded-full transition-all duration-300 ease-out
        ${isWishlisted 
          ? 'text-[#d55b39] hover:bg-white/10 hover:scale-110' 
          : 'text-gray-100 hover:text-white hover:bg-white/10 hover:scale-110'
        }
        ${isAnimating ? 'scale-125' : ''}
        ${className}
      `}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <svg
        className={`w-full h-full ${isAnimating ? 'animate-pulse' : ''}`}
        fill={isWishlisted ? 'currentColor' : 'currentColor'}
        stroke={isWishlisted ? '#d55b39' : '#0b5d68'}
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  )
}

export default WishlistIcon
