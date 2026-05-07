'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import { CartService } from '@/lib/cart'
import { getCurrentUser } from '@/lib/auth'
import Button from '@/components/common/Button'

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
    'Fresh Strawberries - Hot Auction': 'https://images.pexels.com/photos/1994461/strawberries-fruits-fresh-red-1994461.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
    'Premium Soybeans - Fixed Price Deal': 'https://images.pexels.com/photos/536210/soybeans-bean-legume-soy-536210.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
    // Homepage Active Listings - Add these 4 items with their exact images
    'Durum Wheat': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbWL41VUZZ52UwNK1jj17RrN8lpBtb1htUK7daWe1IrGt5N0il31C-eNG6NIsMAC-N-mUndYLUB_rgwRaOkiLtVHfHkBmsj8h-TsfMCmoomYrfNH2mEaPURld9oYV_JiK4vL33l6sU9GRTYKm5kaqY3S7O_6nn1zT1TDAQ0evz5CCZCynv7-Zx0JalKFQU6-qYcZhe485imaPu68X9jQmL49c_0U7baWRRpMRlo1PYCXyTMslox9ujgGIgZBT1STrVRQ-p3HoQUIk',
    'Mustard Seed': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCntfrXe0AmTNrDTTb4AjIFxLuEyWdCrkBnDXNE9crfFkdxjtdpC-_XltQKkDMflv7hjzUFnh7M0zKmLNoCRMWzwso9mKgh1AGDWVm36nh5F6je8ESXOdMB1mebnI4XRlxTjXZ7RvQsxDnHdwZwOziTBLN1zI3a25gdr-6cILW0TYRiZ5IkHlEdUosRr_BSRjKF4HuCRZQNMttAtzwtMiWmVxdr-BBrMesCd59B3oijDtgI9PP1BMsEXkntrh5veiQzyxlzVMip5yc',
    'Cold Storage Unit 4': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXeDmeZwUegHs4iiR1A4KGm3uwoQDIMOQzG0fx9cLfmbP3N730p_wLe9VI6mIoVHemgC_Jp1LK-VRxnRfoGRgYIXXeW8V7qaV49gPeTBiFNYzwDiU71tuWMdjJW5DWHDgQ0SoQYGCYEoP9tmp72XqFcAk90UYl8jMfOab0jsFwUTEnQz4cwTb2_EeNwyVPcQCPtLuehFGyBv9DE29nKay5zF1LoMYuI4XtEGsEGIvDcwmniOqSAAyBEQ-NhrN5ntutsuc9B9_hXcI',
    'Basmati Rice (Long)': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrv1X4l-V9Y-DM5LgGI6TVIvBNMLTcdRTNG8HWlutEt-VFFvlSiqTg6JNz3D9dl5gkd5Z4Hsu7x-Wx7jLswA2uWVJF2-cw4Ny9qdzcimgA5jWyYgelBZT7HgcVsfJ-oOpbYMlbSURsEtz74R5yD16eoYFVpvk_Y4Azx8jmTNldB9xhvRgdZSUduNsha7K6WjHJ6djkjkkijcDdfMp3RVBf_9nzMXifRgtDhl0LEzFUBdUiY259Sp_8qVnetbPUyb_MzfvfSG3Xxbs'
  }
  
  return imageMap[listing.title] || 'https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop' // Default farm image
}

const CartPage = () => {
  const router = useRouter()
  const { cart, isLoading, removeFromCart, updateQuantity, clearCart, count, total } = useCart()
  
  // Defensive safe variables
  const safeCart = Array.isArray(cart) ? cart : []
  const safeTotal = Number(total || 0)
  const safeCount = Number(count || 0)

  const handleQuantityChange = (listingId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(listingId, newQuantity)
    } else {
      removeFromCart(listingId)
    }
  }

  const handleRemoveItem = (listingId: string) => {
    if (confirm('Are you sure you want to remove this item from your cart?')) {
      removeFromCart(listingId)
    }
  }

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear your entire cart?')) {
      clearCart()
    }
  }

  const handleProceedToCheckout = () => {
    // Check if user is KYC verified
    const user = getCurrentUser()
    if (!user) {
      // Redirect to login
      router.push('/login')
      return
    }

    // Check KYC status
    const kycData = localStorage.getItem(`kyc_${user.id}`)
    if (!kycData) {
      // Redirect to KYC verification
      router.push('/kyc-verification')
      return
    }

    try {
      const kyc = JSON.parse(kycData)
      if (kyc.status !== 'verified') {
        // Show KYC not verified message
        alert('Please complete KYC verification to proceed with checkout')
        router.push('/kyc-verification')
        return
      }
    } catch (error) {
      // Redirect to KYC verification if data is invalid
      router.push('/kyc-verification')
      return
    }

    // Navigate to checkout page (create if doesn't exist)
    router.push('/checkout')
  }

  const handleBidAction = (listingId: string) => {
    // Navigate to the bid page for the specific listing
    router.push(`/listings/${listingId}/bid`)
  }

  const handleBuyNow = (listingId: string) => {
    // Navigate to the payment page for the specific listing
    router.push(`/listings/${listingId}/pay`)
  }

  // Show loading state only when loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fcf9f5] pt-16">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="w-32 h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fcf9f5] pt-16">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[#0b5d68] tracking-tight mb-2 font-['Manrope']">
                Shopping Cart
              </h1>
              <p className="text-[#414844] text-sm">
                {safeCount === 0 
                  ? 'Your cart is empty. Start adding items to proceed with your purchase'
                  : `You have ${safeCount} item${safeCount !== 1 ? 's' : ''} in your cart`
                }
              </p>
            </div>
            
            {safeCount > 0 && (
              <Button
                variant="outline"
                onClick={handleClearCart}
                className="text-sm"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        {safeCount === 0 ? (
          // Empty State
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-[#f0ede9] rounded-full flex items-center justify-center mb-6 mx-auto">
              <svg className="w-10 h-10 text-[#717973]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#012d1d] mb-2 font-['Manrope']">
              Your cart is empty
            </h3>
            <p className="text-[#414844] mb-8 max-w-md mx-auto">
              Start browsing our marketplace and add items you're interested in to your cart. You can proceed to checkout when you're ready.
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
          // Cart Items
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {safeCart.map((item: any) => (
                <div key={item.id} data-cart-item className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-start gap-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                      <img 
                        src={getProductImage(item?.listing)} 
                        alt={item?.listing?.title || 'Unknown Product'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop'
                        }}
                      />
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-[#012d1d] mb-1 truncate">
                        {item?.listing?.title || 'Unknown Product'}
                      </h3>
                      <p className="text-sm text-[#717973] mb-2">
                        {item?.listing?.location || 'Unknown Location'} • {item?.listing?.category || 'Unknown Category'}
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold text-[#735a3a]">
                          &#8377;{Number(item?.listing?.price || 0).toFixed(2)}
                          <span className="text-xs font-medium text-[#717973]">/{item?.listing?.unit || 'unit'}</span>
                        </span>
                        {item?.listing?.priceType === 'auction' && (
                          <span className="px-2 py-1 text-xs font-bold uppercase tracking-widest rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white">
                            Auction
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  
                  {/* Quantity and Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-[#717973]">Quantity:</label>
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(item?.id, Number(item?.quantity || 1) - 1)}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-l-lg"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={Number(item?.quantity || 1)}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1
                              handleQuantityChange(item?.id, val)
                            }}
                            className="w-16 text-center border-x border-gray-300 py-1"
                            min="1"
                          />
                          <button
                            onClick={() => handleQuantityChange(item?.id, Number(item?.quantity || 1) + 1)}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r-lg"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {item?.listing?.priceType === 'auction' ? (
                          <Button
                            size="sm"
                            onClick={() => handleBidAction(item?.id)}
                            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
                          >
                            Place Bid
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleBuyNow(item?.listing?.id || item?.id)}
                            className="bg-[#0b5d68] hover:bg-[#0a4d54] text-white"
                          >
                            Buy Now
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Item Total */}
                    <div className="mt-2 text-right">
                      <span className="text-sm text-[#717973]">Item Total: </span>
                      <span className="text-lg font-bold text-[#012d1d]">
                        &#8377;{(Number(item?.listing?.price || 0) * Number(item?.quantity || 1)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-bold text-[#012d1d] mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#717973]">Items ({safeCount})</span>
                    <span className="font-medium text-[#012d1d]">&#8377;{safeTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#717973]">Estimated Shipping</span>
                    <span className="font-medium text-[#012d1d]">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#717973]">Tax</span>
                    <span className="font-medium text-[#012d1d]">Calculated at checkout</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="font-semibold text-[#012d1d]">Total</span>
                      <span className="text-xl font-bold text-[#0b5d68]">&#8377;{safeTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={handleProceedToCheckout}
                  className="w-full bg-[#0b5d68] hover:bg-[#0a4d54] text-white font-bold py-3"
                  size="lg"
                >
                  Proceed to Checkout
                </Button>
                
                <Link href="/listings" className="block mt-4">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Footer Stats */}
        {safeCount > 0 && (
          <div className="mt-12 pt-8 border-t border-[#e5e2de]">
            <div className="flex items-center justify-between text-sm text-[#717973]">
              <div>
                Total items: <span className="font-semibold text-[#0b5d68]">{safeCount}</span>
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

export default CartPage
