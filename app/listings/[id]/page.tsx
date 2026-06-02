'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { dummyListings } from '@/lib/dummyData'
import ListingDetails from '@/components/listings/ListingDetails'

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [listing, setListing] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params?.id) return

    const fetchListing = async () => {
      const id = Array.isArray(params.id) ? params.id[0] : params.id
      if (!id) return

      // dummy check
      const dummyMatch = dummyListings.find(l => l.id === id)
      if (dummyMatch) {
        setListing(dummyMatch)
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`http://localhost:5000/listings/${id}`)
        const result = await response.json()

        if (!result?.success || !result?.data) {
          setListing(null)
          return
        }

        const d = result.data

        setListing({
          id: d.listing_id,
          title: d.title,
          description: d.description,
          type: d.type?.toLowerCase(),
          price: Number(d.price ?? 0),
          priceType: d.price_type?.toLowerCase(),
          status: d.status?.toLowerCase(),
          location: '',
          quantity:
            d.produceListing?.quantity ||
            d.warehouseListing?.capacity ||
            d.transportListing?.capacity ||
            0,
          unit: d.produceListing?.unit || 'kg',
          seller: {
            name: d.user?.name || 'Seller',
            rating: 4.5,
            verified: d.user?.is_verified || false,
          },
          images: [],
          postedAt: d.created_at,
          category: d.produceListing?.crop_type || d.type || 'General',
        })
      } catch (err) {
        console.error(err)
        setListing(null)
      } finally {
        setLoading(false)
      }
    }

    fetchListing()
  }, [params?.id])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0b5d68] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading listing...</p>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Listing not found</h3>
          <p className="text-gray-500">The listing you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/listings')}
            className="mt-4 px-4 py-2 bg-[#0b5d68] text-white rounded-lg"
          >
            Back to Listings
          </button>
        </div>
      </div>
    )
  }

  const handleBidSubmit = (newBid: any) => {
    setListing((prev: any) => ({
      ...prev,
      bids: [...(prev.bids || []), {
        ...newBid,
        id: `b${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'pending'
      }]
    }))
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <ListingDetails listing={listing} onBidSubmit={handleBidSubmit} />
    </div>
  )
}