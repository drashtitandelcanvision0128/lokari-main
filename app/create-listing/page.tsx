'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import DynamicForm from '@/components/forms/DynamicForm'

export default function CreateListingPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string>('')
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [listingData, setListingData] = useState<any>({})

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push('/login')
      return
    }

    if (user.role === 'trader') {
      router.push('/listings')
      return
    }

    setCurrentUser(user)
    setUserRole(user.role)
  }, [router])

  const getListingType = (): 'produce' | 'warehouse' | 'transport' => {
    switch (userRole) {
      case 'farmer':
      case 'FARMER':
        return 'produce'
      case 'warehouse':
      case 'WAREHOUSE_OWNER':
        return 'warehouse'
      case 'transporter':
      case 'TRANSPORTER':
        return 'transport'
      default:
        return 'produce'
    }
  }

  const typeMap = {
    produce: 'PRODUCE',
    warehouse: 'WAREHOUSE',
    transport: 'TRANSPORT',
  } as const

  const handleSubmit = async (data: any) => {
    if (!currentUser) return
    setIsSubmitting(true)

    try {
      const listingType = getListingType()

      const payload = {
        user_id: currentUser.id,
        type: typeMap[listingType],
        title: data.title,
        description: data.description,
        price: Number(data.price) || 0,
        price_type: data.priceType?.toUpperCase() === 'AUCTION' ? 'AUCTION' : 'FIXED_PRICE',
        // Produce fields
        crop_type: data.cropName || null,
        quantity: Number(data.quantity) || 0,
        unit: data.unit || 'kg',
        harvest_date: data.harvestDate || null,
        expiry_date: data.expiryDate || null,
        quality_grade: data.qualityGrade || null,
        // Warehouse fields
        capacity: Number(data.capacity) || null,
        capacity_unit: data.capacityUnit || 'sqft',
        available_from: data.availableFrom || null,
        available_to: data.availableTo || null,
        // Transport fields
        vehicle_type: data.vehicleType || null,
        is_refrigerated: data.refrigeration || false,
      }

      console.log('📦 Submitting payload:', payload)

      const token = currentUser?.token

      const response = await fetch('http://localhost:5000/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()
      console.log('✅ LISTING RESPONSE:', result)

      if (!result.success) {
        throw new Error(result.message || 'Failed to create listing')
      }

      // Use real UUID from DB
      router.push(`/listings/${result.data.listing_id}`)

    } catch (error: any) {
      console.error('❌ Create listing failed:', error)
      alert(`Failed to create listing: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0b5d68] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const listingType = getListingType()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0b5d68] mb-2">Create New Listing</h1>
        <p className="text-[#666666]">
          {listingType === 'produce' && 'List your agricultural produce for sale'}
          {listingType === 'warehouse' && 'Offer your warehouse space for storage'}
          {listingType === 'transport' && 'Provide transportation services'}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {['Basic Info', 'Details', 'Pricing', 'Review'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep > index + 1
                  ? 'bg-[#2eb5c2] text-white'
                  : currentStep === index + 1
                    ? 'bg-[#0b5d68] text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                {currentStep > index + 1 ? '✓' : index + 1}
              </div>
              <span className={`ml-2 text-sm ${currentStep >= index + 1 ? 'text-[#0b5d68]' : 'text-gray-500'
                }`}>
                {step}
              </span>
              {index < 3 && (
                <div className={`mx-4 w-8 h-0.5 ${currentStep > index + 1 ? 'bg-[#2eb5c2]' : 'bg-gray-200'
                  }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e0e0e0] p-6">
        {isSubmitting ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0b5d68] mx-auto mb-4"></div>
            <p className="text-[#666666]">Creating listing...</p>
          </div>
        ) : (
          <DynamicForm
            listingType={listingType}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            onSubmit={handleSubmit}
            listingData={listingData}
            setListingData={setListingData}
          />
        )}
      </div>
    </div>
  )
}