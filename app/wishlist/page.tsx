'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useWishlist } from '@/hooks/useWishlist'
import { WishlistService } from '@/lib/wishlist'
import ListingCard from '@/components/listings/ListingCard'
import Button from '@/components/common/Button'

const WishlistPage = () => {
  const { wishlist, isLoading, removeFromWishlist, count } = useWishlist()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="min-h-screen bg-[#fcf9f5] pt-16">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fcf9f5] pt-16">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const wishlistListings = wishlist.map(item => item.listing)

  return (
    <div className="min-h-screen bg-[#fcf9f5] pt-16">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[#0b5d68] tracking-tight mb-2 font-['Manrope']">
                My Wishlist
              </h1>
              <p className="text-[#414844] text-sm">
                {count === 0 
                  ? 'Start adding items to your wishlist to keep track of your favorite listings'
                  : `You have ${count} item${count !== 1 ? 's' : ''} in your wishlist`
                }
              </p>
            </div>
            
            {count > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  if (confirm('Are you sure you want to clear your entire wishlist?')) {
                    WishlistService.clearWishlist()
                    window.location.reload()
                  }
                }}
                className="text-sm"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        {count === 0 ? (
          // Empty State
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-[#f0ede9] rounded-full flex items-center justify-center mb-6 mx-auto">
              <svg className="w-10 h-10 text-[#717973]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#012d1d] mb-2 font-['Manrope']">
              Your wishlist is empty
            </h3>
            <p className="text-[#414844] mb-8 max-w-md mx-auto">
              Start browsing our marketplace and add items you're interested in to your wishlist. You can come back to them anytime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/listings">
                <Button className="bg-[#0b5d68] hover:bg-[#0a4d54] text-white">
                  Browse Marketplace
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          // Wishlist Items Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {/* Footer Stats */}
        {count > 0 && (
          <div className="mt-12 pt-8 border-t border-[#e5e2de]">
            <div className="flex items-center justify-between text-sm text-[#717973]">
              <div>
                Total items: <span className="font-semibold text-[#0b5d68]">{count}</span>
              </div>
              <div className="text-xs">
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WishlistPage
