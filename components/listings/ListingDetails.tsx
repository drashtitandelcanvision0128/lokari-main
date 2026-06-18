'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getUserRole, isUserVerified } from '@/lib/auth'
import Button from '@/components/common/Button'
import WishlistIcon from '@/components/ui/WishlistIcon'
import CartIcon from '@/components/ui/CartIcon'
import { useWishlist } from '@/hooks/useWishlist'
import { useCart } from '@/hooks/useCart'

interface ListingDetailsProps {
  listing: any
  onBidSubmit?: (bid: any) => void
}

const getProductImage = (listing: any) => {
  // Use working Pexels URLs for the problematic products
  const imageMap: { [key: string]: string } = {
    'Fresh Organic Tomatoes': 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
    'Premium Wheat Grains': 'https://images.pexels.com/photos/1631378/wheat-field-harvest-agriculture-1631378.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
    'Cold Storage Warehouse': 'https://images.pexels.com/photos/704971/pexels-photo-704971.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
    'Refrigerated Transport Service': 'https://images.pexels.com/photos/707046/truck-truck-driver-semi-trailer-707046.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
    'Organic Apples': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&h=450&fit=crop&crop=center',
    // New products from stitch marketplace with actual stitch images
    'A-Grade Wheat': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPZxN73cAToZ1xs2ois-pOf3NPnE4X4FYsWgrE-vv3-QVq166zMI3nn5Pk8bPvup640j1hUU_BzyybMm86DjNt6D_2sQSqdYgwVHFN7UPnbczRDY5voBZvT-GqnykJtWf7XOCkleFVHFnSFeOQYKU1Wefezvql-gNR5bothSVNm_I4Mv-c9DysStzxcedSHCStpin-H66TJIkR6eAYzrWrdvLGuguIQkZ__eEx6Y68ATKOWQnJbSU7RWUG8rBfGkoEypYCrA06CHE',
    'Cold Storage Unit B-4': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfeB_JebhZ_ezEka2VU1Zg1zFkGVkyTZwXMVRLEMTpEfS7uKH9YhT07550Xcazi8pmVGj6h8CWQSAJ-zRWMHGFApqEVtuqF8p7T3vW6BgLJx55Tdi4TKuW-RmNLXXrcmf5W5G7ePEBmxBVQuoeUtF0ZO7ae7lZ0KqbDkYG_dPJ2AWTE9QY3zgIvIsu1bYsGatHERC4YrGtgGim-1TYAtMoXgdzC1fGsLYFwC0Pi8wlwpXTaan8n3u2Sup5tOkWir45iCi50dFUF74',
    'Bulk Grain Hauler': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBnMLdCPM5iqB0puuJ1zypdL6jgVB1rp8sVTCLcq8fuGu59hqqbBSr4ZoF93pwPGEWdr5PaHOEpbMIvqfELmBhZzS_WriAjk1dgfUrJdREa8BScsQARjcVlXBZ_1v0cKfAkacPbJrTXLYuoz8UqUYwPTOtMFKTed3M9DknA8p5luT1zWwzjaG5ULo0hphTgFxNaGsOb19svfkqlulscbi8eRNLlBhN3PE_ZyHsXo4_ur-I4GmtjYXObJEeCGwU7Xl-5_fuOxS846zo',
    // Demo Auction Products
    'Premium Organic Corn - Live Auction': 'https://images.pexels.com/photos/1549251/corn-cornfield-maize-agriculture-1549251.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
    'Heritage Potatoes - Auction Ending Soon': 'https://images.pexels.com/photos/2284101/potatoes-vegetables-food-farm-2284101.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
    'Fresh Strawberries - Hot Auction': 'https://images.pexels.com/photos/1994461/strawberries-fruits-fresh-red-1994461.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
    'Premium Soybeans - Fixed Price Deal': 'https://images.pexels.com/photos/536210/soybeans-bean-legume-soy-536210.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop'
  }

  return imageMap[listing.title] || 'https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop' // Default farm image
}

const ListingDetails = ({ listing, onBidSubmit }: ListingDetailsProps) => {
  const router = useRouter()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const { toggleCart, isInCart } = useCart()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string>('')
  const [isVerified, setIsVerified] = useState(false)
  const [showKycModal, setShowKycModal] = useState(false)

  // Auction state
  const [bidAmount, setBidAmount] = useState('')
  const [autoBid, setAutoBid] = useState(false)
  const [maxBidAmount, setMaxBidAmount] = useState('')
  const [showBidHistory, setShowBidHistory] = useState(false)

  // Action states
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactMessage, setContactMessage] = useState('')
  const [isSaved, setIsSaved] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState('')

  useEffect(() => {
    const user = getCurrentUser()
    const role = getUserRole()
    const verified = isUserVerified()

    console.log('ListingDetails - User:', user?.id)
    console.log('ListingDetails - Role:', role)
    console.log('ListingDetails - Verified:', verified)

    setCurrentUser(user)
    setUserRole(role)
    setIsVerified(verified)
  }, [])

  useEffect(() => {
    // Calculate auction time remaining
    if (listing.priceType === 'auction' && listing.auctionEnd) {
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
  }, [listing.auctionEnd, listing.priceType])

  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onBidSubmit) {
      const bidData = {
        listingId: listing.id,
        bidder: {
          name: currentUser?.fullName || 'Anonymous',
          rating: 4.5,
          verified: isVerified
        },
        amount: parseFloat(bidAmount),
        timestamp: new Date().toISOString(),
        autoBid: autoBid,
        maxAmount: autoBid ? parseFloat(maxBidAmount) : null
      }
      onBidSubmit(bidData)
      setBidAmount('')
      setAutoBid(false)
      setMaxBidAmount('')
    }
  }

  const handleBuyNow = () => {
    // Create order directly
    const orderData = {
      listingId: listing.id,
      buyer: currentUser,
      seller: listing.seller,
      amount: listing.price,
      quantity: listing.quantity,
      type: 'direct_purchase'
    }
    console.log('Order created:', orderData)
    router.push('/orders/' + Date.now())
  }

  const handleContactSeller = () => {
    // Send in-platform message
    const messageData = {
      listingId: listing.id,
      sender: currentUser,
      receiver: listing.seller,
      message: contactMessage,
      timestamp: new Date().toISOString()
    }
    console.log('Message sent:', messageData)
    setContactMessage('')
    setShowContactForm(false)
  }

  const handleSaveToWishlist = () => {
    const success = toggleWishlist(listing)
    setIsSaved(!isSaved)
  }

  const handleShareListing = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: listing.description,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const handleReportListing = () => {
    const reason = prompt('Why are you reporting this listing?')
    if (reason) {
      const reportData = {
        listingId: listing.id,
        reporter: currentUser,
        reason,
        timestamp: new Date().toISOString()
      }
      console.log('Listing reported:', reportData)
      alert('Listing reported successfully')
    }
  }

  const renderProduceListing = () => (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Left Column - Images and Details */}
      <div className="lg:col-span-2 space-y-8">
        {/* Image Gallery */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-0">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
            <div className="relative w-full h-[500px] bg-gradient-to-br from-gray-50 to-gray-100">
              <img
                src={getProductImage(listing)}
                alt={listing.title}
                className="w-full h-[500px] object-cover group-hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop'
                }}
              />
              {listing.priceType === 'auction' && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg animate-pulse">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                    </svg>
                    LIVE AUCTION
                  </span>
                </div>
              )}
              {listing.priceType === 'fixed' && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" />
                    </svg>
                    FIXED PRICE
                  </span>
                </div>
              )}
            </div>
          </div>
          {listing.images && listing.images.length > 1 && (
            <div className="bg-gray-50 p-6 border-t border-gray-100">
              <div className="grid grid-cols-4 gap-3">
                {listing.images.slice(1, 5).map((img: string, index: number) => (
                  <div key={index} className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                    <img
                      src={getProductImage(listing)}
                      alt={`${listing.title} ${index + 2}`}
                      className="w-full h-24 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border-0">
          <div className="border-b border-gray-100 pb-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-[#0b5d68]">{listing.title}</h1>
              <div className="flex items-center gap-2">
                <WishlistIcon listing={listing} size="lg" />
                <CartIcon listing={listing} size="lg" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified Quality
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 100 4h2a2 2 0 100 4h2a1 1 0 100 2 2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
                </svg>
                {listing.qualityGrade || 'Premium Grade'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Crop Name</p>
                  <p className="text-lg font-bold text-gray-900">{listing.cropName || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Variety</p>
                  <p className="text-lg font-bold text-gray-900">{listing.variety || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quality Grade</p>
                  <p className="text-lg font-bold text-gray-900">{listing.qualityGrade || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Available Quantity</p>
                  <p className="text-lg font-bold text-gray-900">{listing.quantity} {listing.unit}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Min Order</p>
                  <p className="text-lg font-bold text-gray-900">{listing.minOrderQuantity || 'N/A'} {listing.unit}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Harvest Date</p>
                  <p className="text-lg font-bold text-gray-900">{listing.harvestDate || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
              </div>
              Storage Requirements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-[#666666]">Temperature</span>
                <p className="font-medium">{listing.storageTemp || 'Room temperature'}</p>
              </div>
              <div>
                <span className="text-sm text-[#666666]">Humidity</span>
                <p className="font-medium">{listing.storageHumidity || 'Standard'}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              Product Description
            </h3>
            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-100">
              <p className="text-gray-700 leading-relaxed text-lg">{listing.description}</p>
            </div>
          </div>
        </div>

        {/* Bid History */}
        {listing.bids && listing.bids.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border-0">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 100 4h2a2 2 0 100 4h2a1 1 0 100 2 2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
                </svg>
              </div>
              Bid History
            </h3>
            <div className="space-y-4">
              {listing.bids.map((bid: any, index: number) => (
                <div key={index} className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{bid.bidder?.name || 'Anonymous'}</p>
                      <p className="text-sm text-gray-600">Rating: {bid.bidder?.rating || 'N/A'}/5</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#0b5d68]">&#8377;{bid.amount.toFixed(2)}/{listing.unit}</p>
                      <p className="text-sm text-gray-600">Qty: {bid.quantity} {listing.unit}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">{bid.message}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        bid.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                      }`}>
                      {bid.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(bid.createdAt).toISOString().split('T')[0]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column - Actions and Seller Info */}
      <div className="space-y-8">
        {/* Price Section */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 border-0">
          {listing.priceType === 'fixed' && (
            <div className="text-center">
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Fixed Price</p>
                <div className="text-4xl font-bold bg-gradient-to-r from-[#0b5d68] to-[#2eb5c2] bg-clip-text text-transparent">
                  &#8377;{listing.price.toFixed(2)}
                  <span className="text-xl font-normal text-gray-600">/{listing.unit}</span>
                </div>
              </div>
              <Button
                onClick={() => router.push(`/listings/${listing.id}/pay`)}
                className="w-full bg-gradient-to-r from-[#e89151] to-[#f0a060] hover:from-[#d67a3a] hover:to-[#e89151] text-white py-4 rounded-xl font-bold text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                  Buy Now
                </span>
              </Button>
              {!isVerified && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-800 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    KYC verification required to purchase
                  </p>
                </div>
              )}
            </div>
          )}

          {listing.priceType === 'negotiable' && (
            <div className="text-center">
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Negotiable Price</p>
                <div className="text-4xl font-bold bg-gradient-to-r from-[#0b5d68] to-[#2eb5c2] bg-clip-text text-transparent">
                  &#8377;{listing.price.toFixed(2)}
                  <span className="text-xl font-normal text-gray-600">/{listing.unit}</span>
                </div>
                <p className="text-gray-600 mt-2 italic">Price is negotiable based on volume</p>
              </div>
              <Button
                onClick={() => setShowContactForm(true)}
                className="w-full bg-gradient-to-r from-[#0b5d68] to-[#1a6b70] hover:from-[#0a4d58] hover:to-[#0b5d68] text-white py-4 rounded-xl font-bold text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                disabled={!isVerified}
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                  </svg>
                  Make Offer
                </span>
              </Button>
            </div>
          )}

          {listing.priceType === 'auction' && (
            <div>
              <div className="text-center mb-6">
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full font-bold text-sm mb-4 shadow-lg animate-pulse">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                  </svg>
                  LIVE AUCTION
                </div>
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Time Remaining</div>
                <div className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  {timeRemaining}
                </div>
                {listing.reservePrice && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Reserve Price:</span> &#8377;{listing.reservePrice.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              {/* Current Bid */}
              {listing.bids && listing.bids.length > 0 && (
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6 mb-6 shadow-md">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">Current Highest Bid</p>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                      &#8377;{Math.max(...listing.bids.map((b: any) => b.amount)).toFixed(2)}
                    </span>
                    <span className="text-lg text-gray-600 ml-1">/{listing.unit}</span>
                  </div>
                  <p className="text-sm text-gray-700 text-center">
                    by <span className="font-medium">{listing.bids[listing.bids.length - 1].bidder.name}</span>
                  </p>
                </div>
              )}

              {/* Bid Form */}
              <form onSubmit={handleBidSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">
                    Your Bid Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-[#e0e0e0] rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2]"
                    placeholder="Enter bid amount"
                    required
                    disabled={!isVerified}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoBid"
                    checked={autoBid}
                    onChange={(e) => setAutoBid(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="autoBid" className="text-sm text-[#666666]">
                    Enable auto-bidding
                  </label>
                </div>

                {autoBid && (
                  <div>
                    <label className="block text-sm font-medium text-[#0b5d68] mb-1">
                      Maximum Bid Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={maxBidAmount}
                      onChange={(e) => setMaxBidAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-[#e0e0e0] rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2]"
                      placeholder="Enter maximum amount"
                      required
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full bg-[#e89151] hover:bg-[#f0a060] text-white py-3 rounded-lg font-semibold"
                    onClick={(e) => {
                      if (!isVerified) {
                        e.preventDefault()
                        setShowKycModal(true)
                      }
                      // If verified, let the form submit normally
                    }}
                  >
                    Place Bid
                  </Button>
                  <Button
                    onClick={() => router.push(`/listings/${listing.id}/bid`)}
                    className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-3 rounded-lg font-semibold shadow-lg"
                  >
                    View Live Auction
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Seller Profile */}
        <div className="bg-white rounded-xl border border-[#e0e0e0] p-6">
          <h3 className="font-semibold text-[#0b5d68] mb-4">Seller Information</h3>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-[#a5dce4] rounded-full flex items-center justify-center">
              <span className="text-[#0b5d68] font-bold">
                {listing.seller?.name?.charAt(0) || 'S'}
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <p className="font-medium text-[#0b5d68]">{listing.seller?.name || 'Seller'}</p>
                {listing.seller?.verified && (
                  <span className="text-[#2eb5c2] text-sm">Verified</span>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-sm text-[#666666]">Rating: {listing.seller?.rating || '4.5'}/5</span>
              </div>
              <p className="text-sm text-[#666666]">{listing.seller?.location || 'Location'}</p>
            </div>
          </div>
          <Button
            onClick={() => setShowContactForm(true)}
            className="w-full bg-[#0b5d68] hover:bg-[#1a6b70] text-white py-2 rounded-lg"
            disabled={!isVerified}
          >
            Contact Seller
          </Button>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl border border-[#e0e0e0] p-6">
          <h3 className="font-semibold text-[#0b5d68] mb-4">Actions</h3>
          <div className="space-y-3">
            <Button
              onClick={handleSaveToWishlist}
              variant="outline"
              className="w-full border-[#e0e0e0] text-[#666666] hover:bg-[#0b5d68] hover:text-white"
            >
              {isSaved ? 'Remove from Wishlist' : 'Save to Wishlist'}
            </Button>
            <Button
              onClick={handleShareListing}
              variant="outline"
              className="w-full border-[#e0e0e0] text-[#666666] hover:bg-[#0b5d68] hover:text-white"
            >
              Share Listing
            </Button>
            <Button
              onClick={handleReportListing}
              variant="outline"
              className="w-full border-[#d55b39] text-[#d55b39] hover:bg-[#ffdad6]"
            >
              Report Listing
            </Button>
          </div>
        </div>

        {/* Location */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 border-0">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            Origin Location
          </h3>
          <div className="relative">
            <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl overflow-hidden mb-6 shadow-inner">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="bg-white px-3 py-2 rounded-full shadow-md">
                    <p className="text-gray-800 font-semibold text-sm">{listing.location}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <p className="text-gray-700 font-medium">{listing.location}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderWarehouseListing = () => (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Left Column - Images and Details */}
      <div className="lg:col-span-2 space-y-6">
        {/* Image Gallery */}
        <div className="bg-white rounded-xl border border-[#e0e0e0] overflow-hidden">
          <div className="relative w-full h-96 bg-gray-100">
            <img
              src={getProductImage(listing)}
              alt={listing.title}
              className="w-full h-96 object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop'
              }}
            />
          </div>
          {listing.images && listing.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 p-4">
              {listing.images.slice(1, 5).map((img: string, index: number) => (
                <div key={index} className="relative w-full h-20 bg-gray-100">
                  <img
                    src={getProductImage(listing)}
                    alt={`${listing.title} ${index + 2}`}
                    className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-75"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Facility Details */}
        <div className="bg-white rounded-xl border border-[#e0e0e0] p-6">
          <h2 className="text-2xl font-bold text-[#0b5d68] mb-4">{listing.title}</h2>

          <div className="mb-6">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${listing.storageTypes?.includes('Cold') ? 'bg-blue-100 text-blue-800' :
                listing.storageTypes?.includes('Wet') ? 'bg-green-100 text-green-800' :
                  listing.storageTypes?.includes('Dry') ? 'bg-yellow-100 text-yellow-800' :
                    listing.storageTypes?.includes('Frozen') ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
              }`}>
              {listing.storageTypes?.join(', ') || 'Standard Storage'}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div>
              <span className="text-sm text-[#666666]">Total Capacity</span>
              <p className="font-semibold text-[#0b5d68]">{listing.capacity} sq ft</p>
            </div>
            <div>
              <span className="text-sm text-[#666666]">Available Capacity</span>
              <p className="font-semibold text-[#0b5d68]">{listing.availableCapacity || listing.capacity} sq ft</p>
            </div>
            <div>
              <span className="text-sm text-[#666666]">Temperature Range</span>
              <p className="font-semibold text-[#0b5d68]">{listing.temperatureRange || 'Ambient'}</p>
            </div>
            <div>
              <span className="text-sm text-[#666666]">Pricing Model</span>
              <p className="font-semibold text-[#0b5d68]">{listing.pricingModel || 'Per sq ft/month'}</p>
            </div>
            <div>
              <span className="text-sm text-[#666666]">Available From</span>
              <p className="font-semibold text-[#0b5d68]">{listing.availableFrom || 'Immediate'}</p>
            </div>
            <div>
              <span className="text-sm text-[#666666]">Available To</span>
              <p className="font-semibold text-[#0b5d68]">{listing.availableTo || 'Flexible'}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-[#0b5d68] mb-2">Amenities</h3>
            <div className="grid grid-cols-2 gap-2">
              {listing.amenities?.map((amenity: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-[#2eb5c2] rounded-full"></span>
                  <span className="text-sm text-[#666666]">{amenity}</span>
                </div>
              )) || <span className="text-sm text-[#666666]">Standard facilities</span>}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-[#0b5d68] mb-2">Certifications</h3>
            <div className="flex flex-wrap gap-2">
              {listing.certifications?.map((cert: string, index: number) => (
                <span key={index} className="px-2 py-1 bg-[#f5f5f5] rounded text-xs text-[#666666]">
                  {cert}
                </span>
              )) || <span className="text-sm text-[#666666]">No certifications listed</span>}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-[#0b5d68] mb-2">Description</h3>
            <p className="text-[#666666] leading-relaxed">{listing.description}</p>
          </div>
        </div>

        {/* Bid History */}
        {listing.bids && listing.bids.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border-0">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 100 4h2a2 2 0 100 4h2a1 1 0 100 2 2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
                </svg>
              </div>
              Bid History
            </h3>
            <div className="space-y-4">
              {listing.bids.map((bid: any, index: number) => (
                <div key={index} className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{bid.bidder?.name || 'Anonymous'}</p>
                      <p className="text-sm text-gray-600">Rating: {bid.bidder?.rating || 'N/A'}/5</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#0b5d68]">&#8377;{bid.amount.toFixed(2)}/{listing.unit}</p>
                      <p className="text-sm text-gray-600">Qty: {bid.quantity} {listing.unit}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">{bid.message}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        bid.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                      }`}>
                      {bid.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(bid.createdAt).toISOString().split('T')[0]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column - Actions and Owner Info */}
      <div className="space-y-6">
        {/* Pricing Section */}
        <div className="bg-white rounded-xl border border-[#e0e0e0] p-6">
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-[#0b5d68] mb-2">
              &#8377;{listing.price.toFixed(2)}/{listing.pricingModel === 'per-sqft' ? 'sq ft/month' : 'ton/day'}
            </div>
            <p className="text-[#666666]">Pricing per {listing.pricingModel === 'per-sqft' ? 'square foot' : 'ton'}</p>
          </div>

          <Button
            onClick={() => setShowContactForm(true)}
            className="w-full bg-[#e89151] hover:bg-[#f0a060] text-white py-3 rounded-lg font-semibold"
            disabled={!isVerified}
          >
            Request Booking
          </Button>
          {!isVerified && (
            <p className="text-sm text-[#d55b39] mt-2">KYC verification required to book</p>
          )}
        </div>

        {/* Owner Profile */}
        <div className="bg-white rounded-xl border border-[#e0e0e0] p-6">
          <h3 className="font-semibold text-[#0b5d68] mb-4">Facility Owner</h3>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-[#a5dce4] rounded-full flex items-center justify-center">
              <span className="text-[#0b5d68] font-bold">
                {listing.seller?.name?.charAt(0) || 'W'}
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <p className="font-medium text-[#0b5d68]">{listing.seller?.name || 'Warehouse Owner'}</p>
                {listing.seller?.verified && (
                  <span className="text-[#2eb5c2] text-sm">Verified</span>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-sm text-[#666666]">Rating: {listing.seller?.rating || '4.5'}/5</span>
              </div>
              <p className="text-sm text-[#666666]">{listing.seller?.location || 'Location'}</p>
            </div>
          </div>
          <Button
            onClick={() => setShowContactForm(true)}
            className="w-full bg-[#0b5d68] hover:bg-[#1a6b70] text-white py-2 rounded-lg"
            disabled={!isVerified}
          >
            Contact Owner
          </Button>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl border border-[#e0e0e0] p-6">
          <h3 className="font-semibold text-[#0b5d68] mb-4">Actions</h3>
          <div className="space-y-3">
            <Button
              onClick={handleSaveToWishlist}
              variant="outline"
              className="w-full border-[#e0e0e0] text-[#666666] hover:bg-[#0b5d68] hover:text-white"
            >
              {isSaved ? 'Remove from Wishlist' : 'Save to Wishlist'}
            </Button>
            <Button
              onClick={handleShareListing}
              variant="outline"
              className="w-full border-[#e0e0e0] text-[#666666] hover:bg-[#0b5d68] hover:text-white"
            >
              Share Listing
            </Button>
            <Button
              onClick={handleReportListing}
              variant="outline"
              className="w-full border-[#d55b39] text-[#d55b39] hover:bg-[#ffdad6]"
            >
              Report Listing
            </Button>
          </div>
        </div>

        {/* Location */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 border-0">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            Warehouse Location
          </h3>
          <div className="relative">
            <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl overflow-hidden mb-6 shadow-inner">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="bg-white px-3 py-2 rounded-full shadow-md">
                    <p className="text-gray-800 font-semibold text-sm">{listing.address || listing.location}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <p className="text-gray-700 font-medium">{listing.address || listing.location}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTransportListing = () => (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Left Column - Images and Details */}
      <div className="lg:col-span-2 space-y-6">
        {/* Image Gallery */}
        <div className="bg-white rounded-xl border border-[#e0e0e0] overflow-hidden">
          <div className="relative w-full h-96 bg-gray-100">
            <img
              src={getProductImage(listing)}
              alt={listing.title}
              className="w-full h-96 object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop'
              }}
            />
          </div>
          {listing.images && listing.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 p-4">
              {listing.images.slice(1, 5).map((img: string, index: number) => (
                <div key={index} className="relative w-full h-20 bg-gray-100">
                  <img
                    src={getProductImage(listing)}
                    alt={`${listing.title} ${index + 2}`}
                    className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-75"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vehicle Details */}
        <div className="bg-white rounded-xl border border-[#e0e0e0] p-6">
          <h2 className="text-2xl font-bold text-[#0b5d68] mb-4">{listing.title}</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div>
              <span className="text-sm text-[#666666]">Vehicle Type</span>
              <p className="font-semibold text-[#0b5d68]">{listing.vehicleType || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm text-[#666666]">Capacity</span>
              <p className="font-semibold text-[#0b5d68]">{listing.capacity} tons</p>
            </div>
            <div>
              <span className="text-sm text-[#666666]">Number Plate</span>
              <p className="font-semibold text-[#0b5d68]">{listing.numberPlate || 'Available on request'}</p>
            </div>
            <div>
              <span className="text-sm text-[#666666]">Price per km</span>
              <p className="font-semibold text-[#0b5d68]">&#8377;{listing.pricePerKm || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm text-[#666666]">Refrigerated</span>
              <p className="font-semibold text-[#0b5d68]">{listing.refrigeration ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <span className="text-sm text-[#666666]">Available From</span>
              <p className="font-semibold text-[#0b5d68]">{listing.availableFrom || 'Immediate'}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-[#0b5d68] mb-2">Service Routes</h3>
            <div className="bg-[#f5f5f5] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#0b5d68]">From: {listing.routes?.from || 'Flexible'}</p>
                  <p className="font-medium text-[#0b5d68]">To: {listing.routes?.to || 'Flexible'}</p>
                </div>
                <span className="text-[#2eb5c2]">Route Available</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-[#0b5d68] mb-2">Availability Calendar</h3>
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <span className="text-[#666666]">Calendar view - Available {listing.availableFrom || 'immediately'}</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-[#0b5d68] mb-2">Description</h3>
            <p className="text-[#666666] leading-relaxed">{listing.description}</p>
          </div>
        </div>

        {/* Bid History */}
        {listing.bids && listing.bids.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border-0">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 100 4h2a2 2 0 100 4h2a1 1 0 100 2 2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
                </svg>
              </div>
              Bid History
            </h3>
            <div className="space-y-4">
              {listing.bids.map((bid: any, index: number) => (
                <div key={index} className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{bid.bidder?.name || 'Anonymous'}</p>
                      <p className="text-sm text-gray-600">Rating: {bid.bidder?.rating || 'N/A'}/5</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#0b5d68]">&#8377;{bid.amount.toFixed(2)}/{listing.unit}</p>
                      <p className="text-sm text-gray-600">Qty: {bid.quantity} {listing.unit}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">{bid.message}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        bid.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                      }`}>
                      {bid.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(bid.createdAt).toISOString().split('T')[0]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column - Actions and Owner Info */}
      <div className="space-y-6">
        {/* Pricing Section */}
        <div className="bg-white rounded-xl border border-[#e0e0e0] p-6">
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-[#0b5d68] mb-2">
              &#8377;{listing.pricePerKm || 'Contact for pricing'}
            </div>
            <p className="text-[#666666]">Price per kilometer</p>
          </div>

          <Button
            onClick={() => setShowContactForm(true)}
            className="w-full bg-[#e89151] hover:bg-[#f0a060] text-white py-3 rounded-lg font-semibold"
            disabled={!isVerified}
          >
            Request Quote
          </Button>
          {!isVerified && (
            <p className="text-sm text-[#d55b39] mt-2">KYC verification required to request quotes</p>
          )}
        </div>

        {/* Owner Profile */}
        <div className="bg-white rounded-xl border border-[#e0e0e0] p-6">
          <h3 className="font-semibold text-[#0b5d68] mb-4">Transport Provider</h3>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-[#a5dce4] rounded-full flex items-center justify-center">
              <span className="text-[#0b5d68] font-bold">
                {listing.seller?.name?.charAt(0) || 'T'}
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <p className="font-medium text-[#0b5d68]">{listing.seller?.name || 'Transport Provider'}</p>
                {listing.seller?.verified && (
                  <span className="text-[#2eb5c2] text-sm">Verified</span>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-sm text-[#666666]">Rating: {listing.seller?.rating || '4.5'}/5</span>
              </div>
              <p className="text-sm text-[#666666]">{listing.seller?.location || 'Location'}</p>
            </div>
          </div>
          <Button
            onClick={() => setShowContactForm(true)}
            className="w-full bg-[#0b5d68] hover:bg-[#1a6b70] text-white py-2 rounded-lg"
            disabled={!isVerified}
          >
            Contact Provider
          </Button>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl border border-[#e0e0e0] p-6">
          <h3 className="font-semibold text-[#0b5d68] mb-4">Actions</h3>
          <div className="space-y-3">
            <Button
              onClick={handleSaveToWishlist}
              variant="outline"
              className="w-full border-[#e0e0e0] text-[#666666] hover:bg-[#0b5d68] hover:text-white"
            >
              {isSaved ? 'Remove from Wishlist' : 'Save to Wishlist'}
            </Button>
            <Button
              onClick={handleShareListing}
              variant="outline"
              className="w-full border-[#e0e0e0] text-[#666666] hover:bg-[#0b5d68] hover:text-white"
            >
              Share Listing
            </Button>
            <Button
              onClick={handleReportListing}
              variant="outline"
              className="w-full border-[#d55b39] text-[#d55b39] hover:bg-[#ffdad6]"
            >
              Report Listing
            </Button>
          </div>
        </div>

        {/* Service Area */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 border-0">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            Service Area
          </h3>
          <div className="relative">
            <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl overflow-hidden mb-6 shadow-inner">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="bg-white px-3 py-2 rounded-full shadow-md">
                    <p className="text-gray-800 font-semibold text-sm">{listing.routes?.from} to {listing.routes?.to}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <p className="text-gray-700 font-medium">{listing.routes?.from} to {listing.routes?.to}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderBidHistory = () => {
    if (!listing.bids || listing.bids.length === 0) return null

    return (
      <div className="bg-white rounded-xl border border-[#e0e0e0] p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#0b5d68]">Bid History</h3>
          <Button
            variant="outline"
            onClick={() => setShowBidHistory(!showBidHistory)}
            className="text-sm border-[#e0e0e0] text-[#666666]"
          >
            {showBidHistory ? 'Hide' : 'Show'} History
          </Button>
        </div>

        {showBidHistory && (
          <div className="space-y-3">
            <div className="grid grid-cols-4 text-sm font-medium text-[#666666] pb-2 border-b">
              <div>Bidder</div>
              <div>Amount</div>
              <div>Time</div>
              <div>Status</div>
            </div>
            {listing.bids.map((bid: any, index: number) => (
              <div key={index} className="grid grid-cols-4 text-sm py-2 border-b border-[#f0f0f0]">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{bid.bidder?.name || 'Anonymous'}</span>
                  <span className="text-xs text-[#666666]">({bid.bidder?.rating || 'N/A'})</span>
                </div>
                <div className="font-semibold text-[#0b5d68]">&#8377;{bid.amount.toFixed(2)}</div>
                <div className="text-[#666666]">
                  {new Date(bid.timestamp || bid.createdAt).toISOString().split('T')[0]}
                </div>
                <div>
                  <span className={`px-2 py-1 rounded text-xs ${bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      bid.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                    {bid.status || 'pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderContactModal = () => {
    if (!showContactForm) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
          <h3 className="text-xl font-bold text-[#0b5d68] mb-4">Contact {listing.seller?.name || 'Seller'}</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#0b5d68] mb-1">
                Your Message
              </label>
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                className="w-full px-3 py-2 border border-[#e0e0e0] rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2]"
                rows={4}
                placeholder="Enter your message..."
                required
              />
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleContactSeller}
                className="flex-1 bg-[#0b5d68] hover:bg-[#1a6b70] text-white"
                disabled={!isVerified || !contactMessage.trim()}
              >
                Send Message
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowContactForm(false)}
                className="flex-1 border-[#e0e0e0] text-[#666666]"
              >
                Cancel
              </Button>
            </div>

            {!isVerified && (
              <p className="text-sm text-[#d55b39]">KYC verification required to contact sellers</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Determine listing type and render appropriate layout
  const getListingType = () => {
    if (listing.cropName || listing.variety || listing.qualityGrade) return 'produce'
    if (listing.facilityName || listing.storageTypes) return 'warehouse'
    if (listing.vehicleType || listing.routes) return 'transport'
    return 'produce' // default
  }

  const listingType = getListingType()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Render appropriate listing type */}
      {listingType === 'produce' && renderProduceListing()}
      {listingType === 'warehouse' && renderWarehouseListing()}
      {listingType === 'transport' && renderTransportListing()}

      {/* KYC Verification Modal */}
      {showKycModal && !isVerified && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">KYC Verification Required</h2>
              <p className="text-gray-600 mb-6">
                You need to complete KYC verification to participate in live auctions and place bids.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setShowKycModal(false)
                    localStorage.setItem('kyc_return_url', `/listings/${listing.id}`)
                    router.push('/kyc')
                  }}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                >
                  Complete KYC Verification
                </Button>
                <button
                  onClick={() => setShowKycModal(false)}
                  className="w-full text-gray-500 hover:text-gray-700 font-medium"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {renderContactModal()}
    </div>
  )
}

export default ListingDetails
