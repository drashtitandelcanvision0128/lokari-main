'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getUserRole } from '@/lib/auth'
import { registrationService } from '@/lib/registration'
import Button from '@/components/common/Button'
import DynamicForm from '@/components/forms/DynamicForm'

export default function CreateListingPage() {
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
    
    // Traders cannot create listings - they are buyers only
    if (user.role === 'trader') {
      router.push('/listings')
      return
    }
    
    setCurrentUser(user)
    setUserRole(user.role)
  }, [router])

  // Get listing type based on user role
  const getListingType = () => {
    switch (userRole) {
      case 'farmer':
        return 'produce'
      case 'warehouse':
        return 'warehouse'
      case 'transporter':
        return 'transport'
      default:
        return 'produce'
    }
  }

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const finalData = {
      ...data,
      id: Date.now().toString(),
      userId: currentUser?.id,
      userRole: userRole,
      createdAt: new Date().toISOString(),
      status: 'active'
    }
    
    console.log('Listing created:', finalData)
    
    // Store in localStorage for simulation
    const existingListings = JSON.parse(localStorage.getItem('listings') || '[]')
    existingListings.push(finalData)
    localStorage.setItem('listings', JSON.stringify(existingListings))
    
    // Redirect to listing detail page
    router.push(`/listings/${finalData.id}`)
    setIsSubmitting(false)
  }

  // Show loading state while checking authentication
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
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep > index + 1 
                  ? 'bg-[#2eb5c2] text-white' 
                  : currentStep === index + 1 
                    ? 'bg-[#0b5d68] text-white' 
                    : 'bg-gray-200 text-gray-500'
              }`}>
                {currentStep > index + 1 ? '✓' : index + 1}
              </div>
              <span className={`ml-2 text-sm ${
                currentStep >= index + 1 ? 'text-[#0b5d68]' : 'text-gray-500'
              }`}>
                {step}
              </span>
              {index < 3 && (
                <div className={`mx-4 w-8 h-0.5 ${
                  currentStep > index + 1 ? 'bg-[#2eb5c2]' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Multi-step Form Content */}
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
