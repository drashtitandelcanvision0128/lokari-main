'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Button from '@/components/common/Button'
import { dummyListings } from '@/lib/dummyData'
import { getCurrentUser, isUserVerified } from '@/lib/auth'

const getProductImage = (listing: any) => {
  // Use working Pexels URLs for problematic products
  const imageMap: { [key: string]: string } = {
    'Fresh Organic Tomatoes': 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
    'Premium Wheat Grains': 'https://images.pexels.com/photos/1631378/wheat-field-harvest-agriculture-1631378.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
    'Cold Storage Warehouse': 'https://images.pexels.com/photos/704971/pexels-photo-704971.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
    'Refrigerated Transport Service': 'https://images.pexels.com/photos/707046/truck-truck-driver-semi-trailer-707046.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
    'Organic Apples': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=200&fit=crop&crop=center',
    // New products from stitch marketplace with actual stitch images
    'A-Grade Wheat': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPZxN73cAToZ1xs2ois-pOf3NPnE4X4FYsWgrE-vv3-QVq166zMI3nn5Pk8bPvup640j1hUU_BzyybMm86DjNt6D_2sQSqdYgwVHFN7UPnbczRDY5voBZvT-GqnykJtWf7XOCkleFVHFnSFeOQYKU1Wefezvql-gNR5bothSVNm_I4Mv-c9DysStzxcedSHCStpin-H66TJIkR6eAYzrWrdvLGuguIQkZ__eEx6Y68ATKOWQnJbSU7RWUG8rBfGkoEypYCrA06CHE',
    'Cold Storage Unit B-4': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfeB_JebhZ_ezEka2VU1Zg1zFkGVkyTZwXMVRLEMTpEfS7uKH9YhT07550Xcazi8pmVGj6h8CWQSAJ-zRWMHGFApqEVtuqF8p7T3vW6BgLJx55Tdi4TKuW-RmNLXXrcmf5W5G7ePEBmxBVQuoeUtF0ZO7ae7lZ0KqbDkYG_dPJ2AWTE9QY3zgIvIsu1bYsGatHERC4YrGtgGim-1TYAtMoXgdzC1fGsLYFwC0Pi8wlwpXTaan8n3u2Sup5tOkWir45iCi50dFUF74',
    'Bulk Grain Hauler': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBnMLdCPM5iqB0puuJ1zypdL6jgVB1rp8sVTCLcq8fuGu59hqqbBSr4ZoF93pwPGEWdr5PaHOEpbMIvqfELmBhZzS_WriAjk1dgfUrJdREa8BScsQARjcVlXBZ_1v0cKfAkacPbJrTXLYuoz8UqUYwPTOtMFKTed3M9DknA8p5luT1zWwzjaG5ULo0hphTgFxNaGsOb19svfkqlulscbi8eRNLlBhN3PE_ZyHsXo4_ur-I4GmtjYXObJEeCGwU7Xl-5_fuOxS846zo',
    // Demo Auction Products
    'Premium Organic Corn - Live Auction': 'https://images.pexels.com/photos/1549251/corn-cornfield-maize-agriculture-1549251.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
    'Heritage Potatoes - Auction Ending Soon': 'https://images.pexels.com/photos/2284101/potatoes-vegetables-food-farm-2284101.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
  }
  
  return imageMap[listing.title] || 'https://images.pexels.com/photos/257840/pexels-photo-257840.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop'
}

export default function BiddingPage() {
  const params = useParams()
  const router = useRouter()
  const listingId = params.id as string
  
  const [listing, setListing] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [timeRemaining, setTimeRemaining] = useState('')
  const [bidAmount, setBidAmount] = useState('')
  const [maxBidAmount, setMaxBidAmount] = useState('')
  const [autoBid, setAutoBid] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [userBidStatus, setUserBidStatus] = useState<'none' | 'leading' | 'outbid'>('none')
  const [currentHighestBid, setCurrentHighestBid] = useState(0)
  const [currentHighestBidder, setCurrentHighestBidder] = useState('')

  useEffect(() => {
    const user = getCurrentUser()
    console.log('Bidding Page - User:', user?.id)
    console.log('Bidding Page - KYC Data:', localStorage.getItem(`kyc_${user?.id}`))
    console.log('Bidding Page - Bypass:', localStorage.getItem(`dev_kyc_bypass_${user?.id}`))
    console.log('Bidding Page - isUserVerified():', isUserVerified())
    
    setCurrentUser(user)
    setIsVerified(isUserVerified())

    // Find the listing
    const foundListing = dummyListings.find(l => l.id === listingId)
    if (foundListing) {
      setListing(foundListing)
      
      // Set current highest bid from bids
      if (foundListing.bids && foundListing.bids.length > 0) {
        const highestBid = foundListing.bids.reduce((prev: any, current: any) => 
          (prev.amount > current.amount) ? prev : current
        )
        setCurrentHighestBid(highestBid.amount)
        setCurrentHighestBidder(highestBid.bidder?.name || 'Anonymous')
        
        // Check user's bid status
        const userBid = foundListing.bids.find((bid: any) => 
          bid.bidder?.fullName === user?.fullName
        )
        if (userBid) {
          setUserBidStatus(userBid.amount === highestBid.amount ? 'leading' : 'outbid')
        }
      } else {
        setCurrentHighestBid(foundListing.price || 0)
      }
    }
  }, [listingId])

  useEffect(() => {
    // Calculate auction time remaining
    if (listing?.priceType === 'auction' && listing?.auctionEnd) {
      const calculateTimeRemaining = () => {
        const now = new Date().getTime()
        const endTime = new Date(listing.auctionEnd).getTime()
        const distance = endTime - now

        if (distance > 0) {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24))
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((distance % (1000 * 60)) / 1000)

          setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`)
        } else {
          setTimeRemaining('Auction ended')
        }
      }

      calculateTimeRemaining()
      const interval = setInterval(calculateTimeRemaining, 1000)
      return () => clearInterval(interval)
    }
  }, [listing])

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!bidAmount || parseFloat(bidAmount) <= currentHighestBid) {
      alert('Bid must be higher than current highest bid')
      return
    }

    // Simulate bid placement
    console.log('Placing bid:', {
      amount: bidAmount,
      listingId,
      bidder: currentUser?.name
    })

    // Update UI (in real app, this would be handled by WebSocket/server updates)
    setCurrentHighestBid(parseFloat(bidAmount))
    setCurrentHighestBidder(currentUser?.name || 'Anonymous')
    setUserBidStatus('leading')
    setBidAmount('')
  }

  const handleSetAutoBid = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!maxBidAmount) {
      alert('Please enter a maximum bid amount')
      return
    }

    // Simulate auto-bid setup
    console.log('Setting auto-bid:', {
      maxAmount: maxBidAmount,
      listingId,
      bidder: currentUser?.name
    })

    setAutoBid(true)
  }

  if (!listing) {
    return <div>Loading...</div>
  }

  if (listing.priceType !== 'auction') {
    return <div>This is not an auction listing</div>
  }

  if (!isVerified) {
    // Store the return URL before redirecting to KYC
    localStorage.setItem('kyc_return_url', `/listings/${listingId}/bid`)
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">KYC Verification Required</h2>
          <p className="text-gray-600 mb-6">
            You need to complete KYC verification to participate in live auctions.
          </p>
          <Button onClick={() => router.push('/kyc')} className="w-full">
            Complete KYC Verification
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Live Auction Banner */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <span className="font-bold text-lg">LIVE AUCTION</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="font-medium">Ends in:</span>
            <span className="font-bold text-xl">{timeRemaining}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Listing Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                <img 
                  src={getProductImage(listing)}
                  alt={listing.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = 'https://images.pexels.com/photos/257840/pexels-photo-257840.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop'
                  }}
                />
              </div>
              
              <h3 className="font-bold text-xl text-gray-900 mb-2">{listing.title}</h3>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">Seller:</span>
                  <span className="ml-2">{listing.seller?.name}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">Location:</span>
                  <span className="ml-2">{listing.location}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">Quantity:</span>
                  <span className="ml-2">{listing.quantity} {listing.unit}</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{listing.description}</p>
              </div>
            </div>
          </div>

          {/* Middle Column - Bidding Interface */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Current Highest Bid */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Current Highest Bid</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    Rs. {currentHighestBid.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">
                    by {currentHighestBidder}
                  </div>
                </div>
              </div>

              {/* User Bid Status */}
              {userBidStatus !== 'none' && (
                <div className={`rounded-xl p-4 ${
                  userBidStatus === 'leading' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className={`text-center font-medium ${
                    userBidStatus === 'leading' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {userBidStatus === 'leading' 
                      ? 'You are currently leading!' 
                      : 'You have been outbid'
                    }
                  </div>
                </div>
              )}

              {/* Place Bid Form */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Place Your Bid</h3>
                <form onSubmit={handlePlaceBid} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bid Amount (Minimum: Rs. {(currentHighestBid + 1).toFixed(2)})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={currentHighestBid + 0.01}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter bid amount"
                      required
                    />
                  </div>
                  <Button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-3 rounded-lg font-semibold"
                  >
                    Place Bid
                  </Button>
                </form>
              </div>

              {/* Auto-Bid Panel */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Auto-Bid</h3>
                {!autoBid ? (
                  <form onSubmit={handleSetAutoBid} className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Set your maximum bid amount and we'll automatically bid for you up to this amount.
                    </p>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maximum Bid Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min={currentHighestBid + 0.01}
                        value={maxBidAmount}
                        onChange={(e) => setMaxBidAmount(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="Enter maximum amount"
                        required
                      />
                    </div>
                    <Button 
                      type="submit"
                      variant="outline"
                      className="w-full border-red-500 text-red-500 hover:bg-red-50"
                    >
                      Set Auto-Bid
                    </Button>
                  </form>
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <p className="font-medium text-green-800 mb-1">Auto-Bid Active</p>
                    <p className="text-sm text-gray-600 mb-3">
                      Maximum: ${maxBidAmount}
                    </p>
                    <Button 
                      onClick={() => setAutoBid(false)}
                      variant="outline"
                      className="w-full border-red-500 text-red-500 hover:bg-red-50"
                    >
                      Cancel Auto-Bid
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Bid History */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Bid History</h3>
              <div className="space-y-3">
                {listing.bids && listing.bids.length > 0 ? (
                  listing.bids
                    .sort((a: any, b: any) => b.amount - a.amount)
                    .map((bid: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">
                            {bid.bidder?.name || 'Anonymous'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(bid.createdAt).toISOString().split('T')[0]}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            ${bid.amount.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-600">
                            {bid.quantity} {listing.unit}
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-center text-gray-500 py-8">No bids yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
