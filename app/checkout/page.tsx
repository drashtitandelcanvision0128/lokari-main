'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import { getCurrentUser } from '@/lib/auth'
import Button from '@/components/common/Button'

const CheckoutPage = () => {
  const { cart, total, count } = useCart()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)

    // Check KYC verification
    if (currentUser) {
      const kycData = localStorage.getItem(`kyc_${currentUser.id}`)
      if (!kycData) {
        window.location.href = '/kyc-verification'
        return
      }
      try {
        const kyc = JSON.parse(kycData)
        if (kyc.status !== 'verified') {
          alert('Please complete KYC verification to proceed with checkout')
          window.location.href = '/kyc-verification'
          return
        }
      } catch (error) {
        window.location.href = '/kyc-verification'
        return
      }
    } else {
      window.location.href = '/login'
      return
    }
  }, [])

  const handleProceedToPayment = () => {
    // This would navigate to payment gateway or process payment
    alert('Processing payment - This would integrate with payment gateway')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#fcf9f5] pt-16">
        <div className="max-w-4xl mx-auto px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="h-24 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (count === 0) {
    return (
      <div className="min-h-screen bg-[#fcf9f5] pt-16">
        <div className="max-w-4xl mx-auto px-8 py-12">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-[#012d1d] mb-4">Your cart is empty</h2>
            <p className="text-[#414844] mb-8">Add items to your cart to proceed with checkout</p>
            <Link href="/listings">
              <Button className="bg-[#0b5d68] hover:bg-[#0a4d54] text-white">
                Browse Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fcf9f5] pt-16">
      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0b5d68] tracking-tight mb-2 font-['Manrope']">
            Checkout
          </h1>
          <p className="text-[#414844] text-sm">
            Review your order and proceed to payment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-[#012d1d] mb-4">Order Summary</h2>
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                      <img 
                        src={item.listing.images?.[0] || 'https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop'} 
                        alt={item.listing.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#012d1d]">{item.listing.title}</h3>
                      <p className="text-sm text-[#717973]">
                        {item.quantity} × &#8377;{item.listing.price.toFixed(2)}/{item.listing.unit}
                      </p>
                    </div>
                    <div className="text-lg font-bold text-[#012d1d]">
                      &#8377;{(item.listing.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-[#012d1d] mb-4">Delivery Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#414844] mb-2">Delivery Address</label>
                  <textarea 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b5d68] focus:border-transparent"
                    rows={3}
                    placeholder="Enter your delivery address"
                    defaultValue={user?.location || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#414844] mb-2">Delivery Instructions</label>
                  <textarea 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b5d68] focus:border-transparent"
                    rows={2}
                    placeholder="Any special instructions for delivery"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-[#012d1d] mb-4">Payment Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-[#717973]">Subtotal ({count} items)</span>
                  <span className="font-medium text-[#012d1d]">&#8377;{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#717973]">Delivery Fee</span>
                  <span className="font-medium text-[#012d1d]">Calculated at next step</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#717973]">Tax</span>
                  <span className="font-medium text-[#012d1d]">Calculated at next step</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#012d1d]">Total</span>
                    <span className="text-xl font-bold text-[#0b5d68]">&#8377;{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={handleProceedToPayment}
                className="w-full bg-[#0b5d68] hover:bg-[#0a4d54] text-white font-bold py-3"
                size="lg"
              >
                Proceed to Payment
              </Button>
              
              <Link href="/cart" className="block mt-4">
                <Button variant="outline" className="w-full">
                  Back to Cart
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
