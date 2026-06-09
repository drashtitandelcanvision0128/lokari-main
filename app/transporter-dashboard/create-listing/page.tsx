'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getUserRole } from '@/lib/auth'
import Button from '@/components/common/Button'
import DynamicForm from '@/components/forms/DynamicForm'

export default function TransporterDashboardCreateListingPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string>('')
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [listingData, setListingData] = useState<any>({})

  // Authentication check
  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push('/login')
      return
    }
    
    setCurrentUser(user)
    setUserRole(user.role)
  }, [router])

  // Get listing type based on user role
  const getListingType = (): 'produce' | 'warehouse' | 'transport' => {
    return 'transport' // Transporter specific
  }

  const handleSubmit = async (data: any) => {
    if (!currentUser) return
    setIsSubmitting(true)

    try {
      const payload = {
        user_id: currentUser.id,
        type: 'TRANSPORT',
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

      if (!result.success) {
        throw new Error(result.message || 'Failed to create listing')
      }

      router.push('/transporter-dashboard')
    } catch (error: any) {
      console.error('Error creating listing:', error)
      alert(`Failed to create listing: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!currentUser || !userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#012d1d] mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-[#012d1d] mb-6">
            Create Transport Listing
          </h1>
          
          <DynamicForm
            listingType={getListingType()}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            onSubmit={handleSubmit}
            listingData={listingData}
            setListingData={setListingData}
          />
          
          <div className="mt-6 flex justify-center">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="mr-4"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
