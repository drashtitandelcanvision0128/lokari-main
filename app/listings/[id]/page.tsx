'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { dummyListings } from '@/lib/dummyData'
import ListingDetails from '@/components/listings/ListingDetails'

export default function ListingDetailPage() {
  const params = useParams()
  const [listing, setListing] = useState(dummyListings.find(l => l.id === params.id))

  if (!listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Listing not found</h3>
          <p className="text-gray-500">The listing you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  const handleBidSubmit = (newBid: any) => {
    const updatedListing = {
      ...listing,
      bids: [
        ...(listing.bids || []),
        {
          ...newBid,
          id: `b${Date.now()}`,
          createdAt: new Date().toISOString(),
          status: 'pending'
        }
      ]
    }
    setListing(updatedListing)
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <ListingDetails listing={listing} onBidSubmit={handleBidSubmit} />
    </div>
  )
}
