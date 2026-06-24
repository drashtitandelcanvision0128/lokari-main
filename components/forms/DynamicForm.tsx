'use client'

import { useState } from 'react'
import Button from '@/components/common/Button'

interface DynamicFormProps {
  listingType: 'produce' | 'warehouse' | 'transport'
  currentStep: number
  setCurrentStep: (step: number) => void
  onSubmit: (data: any) => void
  listingData: any
  setListingData: (data: any) => void
}

const DynamicForm = ({
  listingType,
  currentStep,
  setCurrentStep,
  onSubmit,
  listingData,
  setListingData
}: DynamicFormProps) => {
  const [errors, setErrors] = useState<any>({})

  const updateFormData = (field: string, value: any) => {
    setListingData((prev: any) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }))
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: any = {}

    if (step === 1) {
      if (!listingData.title?.trim()) newErrors.title = 'Title is required'
      if (!listingData.description?.trim()) newErrors.description = 'Description is required'
      if (!listingData.street?.trim())
        newErrors.street = 'Street address is required'

      if (!listingData.city?.trim())
        newErrors.city = 'City is required'

      if (!listingData.state?.trim())
        newErrors.state = 'State is required'

      if (!listingData.pincode?.trim())
        newErrors.pincode = 'Pincode is required'
    } else if (step === 2) {
      if (listingType === 'produce') {
        if (!listingData.cropName?.trim()) newErrors.cropName = 'Crop name is required'
        if (!listingData.quantity) newErrors.quantity = 'Quantity is required'
        if (!listingData.harvestDate) newErrors.harvestDate = 'Harvest date is required'
      } else if (listingType === 'warehouse') {
        if (!listingData.facilityName?.trim()) newErrors.facilityName = 'Facility name is required'
        if (!listingData.address?.trim()) newErrors.address = 'Address is required'
        if (!listingData.capacity) newErrors.capacity = 'Capacity is required'
      } else if (listingType === 'transport') {
        if (!listingData.vehicleType) newErrors.vehicleType = 'Vehicle type is required'
        if (!listingData.capacity) newErrors.capacity = 'Capacity is required'
        if (!listingData.routes?.from?.trim()) newErrors['routes.from'] = 'From location is required'
        if (!listingData.routes?.to?.trim()) newErrors['routes.to'] = 'To location is required'
      }
    } else if (step === 3) {
      if (!listingData.priceType) newErrors.priceType = 'Price type is required'
      if (listingData.priceType === 'fixed' && !listingData.price) newErrors.price = 'Price is required'
      if (listingData.priceType === 'auction' && !listingData.startingBid) newErrors.startingBid = 'Starting bid is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = () => {
    if (validateStep(4)) {
      onSubmit(listingData)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep listingData={listingData} updateFormData={updateFormData} errors={errors} />
      case 2:
        return <DetailsStep listingType={listingType} listingData={listingData} updateFormData={updateFormData} errors={errors} />
      case 3:
        return <PricingStep listingType={listingType} listingData={listingData} updateFormData={updateFormData} errors={errors} />
      case 4:
        return <ReviewStep listingType={listingType} listingData={listingData} />
      default:
        return null
    }
  }

  return (
    <div>
      {renderStepContent()}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <div>
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="px-6 py-2 border-[#e0e0e0] text-[#666666] hover:bg-[#f5f5f5]"
            >
              Previous
            </Button>
          )}
        </div>

        <div className="flex gap-3">
          {currentStep < 4 ? (
            <Button
              onClick={handleNext}
              className="px-6 py-2 bg-[#0b5d68] text-white hover:bg-[#0a4d58]"
            >
              Next
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="px-6 py-2 border-[#e0e0e0] text-[#666666] hover:bg-[#f5f5f5]"
              >
                Previous
              </Button>
              <Button
                onClick={handleSubmit}
                className="px-6 py-2 bg-[#e89151] text-white hover:bg-[#d67a3a]"
              >
                Publish Listing
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
];
// Step Components
const BasicInfoStep = ({ listingData, updateFormData, errors }: any) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium text-[#0b5d68] mb-2">
        Listing Title *
      </label>
      <input
        type="text"
        value={listingData.title || ''}
        onChange={(e) => updateFormData('title', e.target.value)}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2] ${errors.title ? 'border-red-500' : 'border-[#e0e0e0]'
          }`}
        placeholder="Enter a descriptive title for your listing"
      />
      {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
    </div>

    <div>
      <label className="block text-sm font-medium text-[#0b5d68] mb-2">
        Description *
      </label>
      <textarea
        value={listingData.description || ''}
        onChange={(e) => updateFormData('description', e.target.value)}
        rows={4}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2] ${errors.description ? 'border-red-500' : 'border-[#e0e0e0]'
          }`}
        placeholder="Provide detailed information about your listing"
      />
      {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
    </div>

    {/* <div>
      <label className="block text-sm font-medium text-[#0b5d68] mb-2">
        Location
      </label>
      <input
        type="text"
        value={listingData.location || ''}
        onChange={(e) => updateFormData('location', e.target.value)}
        className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2]"
        placeholder="City, State/Region"
      />
    </div> */}
    <div>
      <label className="block text-sm font-medium text-[#0b5d68] mb-2">
        Street Address *
      </label>
      <input
        type="text"
        value={listingData.street || ''}
        onChange={(e) => updateFormData('street', e.target.value)}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2eb5c2] ${errors.street
          ? 'border-red-500'
          : 'border-[#e0e0e0]'
          }`}
        placeholder="Street / Village"
      />
      {errors.street && (
        <p className="text-red-500 text-sm mt-1">
          {errors.street}
        </p>
      )}
    </div>


    <div className="grid grid-cols-2 gap-4">

      <div>
        <label className="block text-sm font-medium text-[#0b5d68] mb-2">
          City *
        </label>

        <input
          type="text"
          value={listingData.city || ''}
          onChange={(e) => updateFormData('city', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg ${errors.city ? 'border-red-500' : 'border-[#e0e0e0]'
            }`}
          placeholder="City"
        />
        {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
      </div>


      <div>
        <label className="block text-sm font-medium text-[#0b5d68] mb-2">
          State *
        </label>

        <select
          value={listingData.state || ''}
          onChange={(e) => updateFormData('state', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2eb5c2] ${errors.state ? 'border-red-500' : 'border-[#e0e0e0]'
            }`}
        >
          <option value="">Select state</option>

          {INDIAN_STATES.map((stateName) => (
            <option key={stateName} value={stateName}>
              {stateName}
            </option>
          ))}

        </select>

        {errors.state && (
          <p className="text-red-500 text-sm mt-1">
            {errors.state}
          </p>
        )}
      </div>

    </div>


    <div className="grid grid-cols-2 gap-4">

      <div>
        <label className="block text-sm font-medium text-[#0b5d68] mb-2">
          Pincode *
        </label>

        <input
          type="text"
          value={listingData.pincode || ''}
          onChange={(e) => updateFormData('pincode', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg ${errors.pincode ? 'border-red-500' : 'border-[#e0e0e0]'
            }`}
          placeholder="Pincode"
        />
        {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
      </div>


      <div>
        <label className="block text-sm font-medium text-[#0b5d68] mb-2">
          Country
        </label>

        <input
          type="text"
          value="India"
          readOnly
          className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
        />
      </div>

    </div>


    {/* <div className="grid grid-cols-2 gap-4">

      <input
        type="number"
        value={listingData.lat || ''}
        onChange={(e) => updateFormData('lat', e.target.value)}
        className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg"
        placeholder="Latitude"
      />


      <input
        type="number"
        value={listingData.lng || ''}
        onChange={(e) => updateFormData('lng', e.target.value)}
        className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg"
        placeholder="Longitude"
      />

    </div> */}
  </div>
)

const DetailsStep = ({ listingType, listingData, updateFormData, errors }: any) => (
  <div className="space-y-6">
    {listingType === 'produce' && (
      <>
        <div>
          <label className="block text-sm font-medium text-[#0b5d68] mb-2">
            Crop Name *
          </label>
          <input
            type="text"
            value={listingData.cropName || ''}
            onChange={(e) => updateFormData('cropName', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2] ${errors.cropName ? 'border-red-500' : 'border-[#e0e0e0]'
              }`}
            placeholder="e.g., Wheat, Rice, Tomatoes"
          />
          {errors.cropName && <p className="text-red-500 text-sm mt-1">{errors.cropName}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#0b5d68] mb-2">
              Variety
            </label>
            <input
              type="text"
              value={listingData.variety || ''}
              onChange={(e) => updateFormData('variety', e.target.value)}
              className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2]"
              placeholder="e.g., Basmati, Hybrid"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0b5d68] mb-2">
              Quality Grade
            </label>
            <select
              value={listingData.qualityGrade || ''}
              onChange={(e) => updateFormData('qualityGrade', e.target.value)}
              className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2]"
            >
              <option value="">Select Grade</option>
              <option value="premium">Premium</option>
              <option value="grade-a">Grade A</option>
              <option value="grade-b">Grade B</option>
              <option value="standard">Standard</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#0b5d68] mb-2">
              Quantity *
            </label>
            <input
              type="number"
              value={listingData.quantity || ''}
              onChange={(e) => updateFormData('quantity', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2] ${errors.quantity ? 'border-red-500' : 'border-[#e0e0e0]'
                }`}
              placeholder="0"
            />
            {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0b5d68] mb-2">
              Unit
            </label>
            <select
              value={listingData.unit || 'kg'}
              onChange={(e) => updateFormData('unit', e.target.value)}
              className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2]"
            >
              <option value="kg">Kilograms (kg)</option>
              <option value="quintal">Quintal</option>
              <option value="ton">Ton</option>
              <option value="lbs">Pounds (lbs)</option>
              <option value="bushels">Bushels</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#0b5d68] mb-2">
              Harvest Date *
            </label>
            <input
              type="date"
              value={listingData.harvestDate || ''}
              onChange={(e) => updateFormData('harvestDate', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2] ${errors.harvestDate ? 'border-red-500' : 'border-[#e0e0e0]'
                }`}
            />
            {errors.harvestDate && <p className="text-red-500 text-sm mt-1">{errors.harvestDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0b5d68] mb-2">
              Expiry Date
            </label>
            <input
              type="date"
              value={listingData.expiryDate || ''}
              onChange={(e) => updateFormData('expiryDate', e.target.value)}
              className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0b5d68] mb-2">
            Storage Requirements
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#666666] mb-1">Temperature (°C)</label>
              <input
                type="text"
                value={listingData.storageTemp || ''}
                onChange={(e) => updateFormData('storageTemp', e.target.value)}
                className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2]"
                placeholder="e.g., 2-8°C"
              />
            </div>
            <div>
              <label className="block text-xs text-[#666666] mb-1">Humidity (%)</label>
              <input
                type="text"
                value={listingData.storageHumidity || ''}
                onChange={(e) => updateFormData('storageHumidity', e.target.value)}
                className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2]"
                placeholder="e.g., 60-70%"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0b5d68] mb-2">
            Photos (Upload 1-8 images)
          </label>
          <div className="border-2 border-dashed border-[#e0e0e0] rounded-lg p-6 text-center">
            <div className="text-[#666666]">
              <span className="material-symbols-outlined text-3xl text-[#2eb5c2]">cloud_upload</span>
              <p className="mt-2">Click to upload or drag and drop</p>
              <p className="text-xs">PNG, JPG up to 10MB each</p>
            </div>
          </div>
        </div>
      </>
    )}

    {listingType === 'warehouse' && (
      <>
        <div>
          <label className="block text-sm font-medium text-[#0b5d68] mb-2">
            Facility Name *
          </label>
          <input
            type="text"
            value={listingData.facilityName || ''}
            onChange={(e) => updateFormData('facilityName', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2] ${errors.facilityName ? 'border-red-500' : 'border-[#e0e0e0]'
              }`}
            placeholder="Enter facility name"
          />
          {errors.facilityName && <p className="text-red-500 text-sm mt-1">{errors.facilityName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0b5d68] mb-2">
            Address *
          </label>
          <div className="space-y-2">
            <input
              type="text"
              value={listingData.address || ''}
              onChange={(e) => updateFormData('address', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2] ${errors.address ? 'border-red-500' : 'border-[#e0e0e0]'
                }`}
              placeholder="Street address"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={listingData.city || ''}
                onChange={(e) => updateFormData('city', e.target.value)}
                className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2]"
                placeholder="City"
              />
              <input
                type="text"
                value={listingData.state || ''}
                onChange={(e) => updateFormData('state', e.target.value)}
                className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2]"
                placeholder="State"
              />
            </div>
          </div>
          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0b5d68] mb-2">
            Storage Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            {['Cold', 'Wet', 'Dry', 'Frozen'].map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="checkbox"
                  checked={listingData.storageTypes?.includes(type) || false}
                  onChange={(e) => {
                    const current = listingData.storageTypes || []
                    if (e.target.checked) {
                      updateFormData('storageTypes', [...current, type])
                    } else {
                      updateFormData('storageTypes', current.filter((t: string) => t !== type))
                    }
                  }}
                  className="mr-2 text-[#2eb5c2] focus:ring-[#2eb5c2]"
                />
                <span className="text-sm text-[#666666]">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#0b5d68] mb-2">
              Available Capacity (sq ft) *
            </label>
            <input
              type="number"
              value={listingData.capacity || ''}
              onChange={(e) => updateFormData('capacity', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2] ${errors.capacity ? 'border-red-500' : 'border-[#e0e0e0]'
                }`}
              placeholder="0"
            />
            {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0b5d68] mb-2">
              Pricing Model
            </label>
            <select
              value={listingData.pricingModel || ''}
              onChange={(e) => updateFormData('pricingModel', e.target.value)}
              className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2]"
            >
              <option value="">Select Model</option>
              <option value="per-sqft">Per sq ft/month</option>
              <option value="per-ton">Per ton/day</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0b5d68] mb-2">
            Available Dates
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#666666] mb-1">From</label>
              <input
                type="date"
                value={listingData.availableFrom || ''}
                onChange={(e) => updateFormData('availableFrom', e.target.value)}
                className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#666666] mb-1">To</label>
              <input
                type="date"
                value={listingData.availableTo || ''}
                onChange={(e) => updateFormData('availableTo', e.target.value)}
                className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2]"
              />
            </div>
          </div>
        </div>
      </>
    )}


    {listingType === 'transport' && (
      <>
        <div>
          <label className="block text-sm font-medium text-[#0b5d68] mb-2">
            Vehicle Type *
          </label>
          <select
            value={listingData.vehicleType || ''}
            onChange={(e) => updateFormData('vehicleType', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2] ${errors.vehicleType ? 'border-red-500' : 'border-[#e0e0e0]'
              }`}
          >
            <option value="">Select Vehicle Type</option>
            <option value="truck">Truck</option>
            <option value="tempo">Tempo</option>
            <option value="reefer">Reefer (Refrigerated)</option>
            <option value="flatbed">Flatbed</option>
          </select>
          {errors.vehicleType && <p className="text-red-500 text-sm mt-1">{errors.vehicleType}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#0b5d68] mb-2">
              Vehicle Capacity (tons) *
            </label>
            <input
              type="number"
              value={listingData.capacity || ''}
              onChange={(e) => updateFormData('capacity', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2] ${errors.capacity ? 'border-red-500' : 'border-[#e0e0e0]'
                }`}
              placeholder="0"
            />
            {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0b5d68] mb-2">
              Price per km
            </label>
            <input
              type="number"
              value={listingData.pricePerKm || ''}
              onChange={(e) => updateFormData('pricePerKm', e.target.value)}
              className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2]"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0b5d68] mb-2">
            Service Routes *
          </label>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-[#666666] mb-1">From *</label>
              <input
                type="text"
                value={listingData.routes?.from || ''}
                onChange={(e) => updateFormData('routes', { ...listingData.routes, from: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2] ${errors['routes.from'] ? 'border-red-500' : 'border-[#e0e0e0]'
                  }`}
                placeholder="Starting location"
              />
              {errors['routes.from'] && <p className="text-red-500 text-sm mt-1">{errors['routes.from']}</p>}
            </div>
            <div>
              <label className="block text-xs text-[#666666] mb-1">To *</label>
              <input
                type="text"
                value={listingData.routes?.to || ''}
                onChange={(e) => updateFormData('routes', { ...listingData.routes, to: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2] ${errors['routes.to'] ? 'border-red-500' : 'border-[#e0e0e0]'
                  }`}
                placeholder="Destination"
              />
              {errors['routes.to'] && <p className="text-red-500 text-sm mt-1">{errors['routes.to']}</p>}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0b5d68] mb-2">
            Additional Services
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={listingData.refrigeration || false}
                onChange={(e) => updateFormData('refrigeration', e.target.checked)}
                className="mr-2 text-[#2eb5c2] focus:ring-[#2eb5c2]"
              />
              <span className="text-sm text-[#666666]">Refrigeration Available</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0b5d68] mb-2">
            Availability Dates
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#666666] mb-1">From</label>
              <input
                type="date"
                value={listingData.availableFrom || ''}
                onChange={(e) => updateFormData('availableFrom', e.target.value)}
                className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#666666] mb-1">To</label>
              <input
                type="date"
                value={listingData.availableTo || ''}
                onChange={(e) => updateFormData('availableTo', e.target.value)}
                className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2]"
              />
            </div>
          </div>
        </div>
      </>
    )}
  </div>
)

const PricingStep = ({ listingType, listingData, updateFormData, errors }: any) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium text-[#0b5d68] mb-2">
        Price Type *
      </label>
      <select
        value={listingData.priceType || ''}
        onChange={(e) => updateFormData('priceType', e.target.value)}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2] ${errors.priceType ? 'border-red-500' : 'border-[#e0e0e0]'
          }`}
      >
        <option value="">Select Price Type</option>
        <option value="fixed">Fixed Price</option>
        <option value="negotiable">Negotiable</option>
        {listingType === 'produce' && <option value="auction">Auction</option>}
      </select>
      {errors.priceType && <p className="text-red-500 text-sm mt-1">{errors.priceType}</p>}
    </div>

    {listingData.priceType === 'fixed' && (
      <div>
        <label className="block text-sm font-medium text-[#0b5d68] mb-2">
          Price (per unit) *
        </label>
        <input
          type="number"
          value={listingData.price || ''}
          onChange={(e) => updateFormData('price', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2] ${errors.price ? 'border-red-500' : 'border-[#e0e0e0]'
            }`}
          placeholder="0.00"
        />
        {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
      </div>
    )}

    {listingData.priceType === 'auction' && (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#0b5d68] mb-2">
            Starting Bid *
          </label>
          <input
            type="number"
            value={listingData.startingBid || ''}
            onChange={(e) => updateFormData('startingBid', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2] ${errors.startingBid ? 'border-red-500' : 'border-[#e0e0e0]'
              }`}
            placeholder="0.00"
          />
          {errors.startingBid && <p className="text-red-500 text-sm mt-1">{errors.startingBid}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0b5d68] mb-2">
            Reserve Price
          </label>
          <input
            type="number"
            value={listingData.reservePrice || ''}
            onChange={(e) => updateFormData('reservePrice', e.target.value)}
            className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2]"
            placeholder="0.00"
          />
          <p className="text-xs text-[#666666] mt-1">Minimum price you're willing to accept</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#0b5d68] mb-2">
              Auction Start Time
            </label>
            <input
              type="datetime-local"
              value={listingData.auctionStart || ''}
              onChange={(e) => updateFormData('auctionStart', e.target.value)}
              className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0b5d68] mb-2">
              Auction End Time
            </label>
            <input
              type="datetime-local"
              value={listingData.auctionEnd || ''}
              onChange={(e) => updateFormData('auctionEnd', e.target.value)}
              className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2]"
            />
          </div>
        </div>
      </div>
    )}

    <div>
      <label className="block text-sm font-medium text-[#0b5d68] mb-2">
        Listing Duration *
      </label>
      <select
        value={listingData.duration || ''}
        onChange={(e) => updateFormData('duration', e.target.value)}
        className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2]"
      >
        <option value="">Select Duration</option>
        <option value="7">7 days</option>
        <option value="14">14 days</option>
        <option value="30">30 days</option>
        <option value="60">60 days</option>
      </select>
    </div>

    <div>
      <label className="flex items-center">
        <input
          type="checkbox"
          checked={listingData.publishNow || false}
          onChange={(e) => updateFormData('publishNow', e.target.checked)}
          className="mr-2 text-[#2eb5c2] focus:ring-[#2eb5c2]"
        />
        <span className="text-sm text-[#666666]">Publish immediately</span>
      </label>
    </div>
  </div>
)

const ReviewStep = ({ listingType, listingData }: any) => (
  <div className="space-y-6">
    <div className="bg-[#f5f5f5] rounded-lg p-6">
      <h3 className="text-lg font-semibold text-[#0b5d68] mb-4">Listing Preview</h3>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-[#0b5d68]">{listingData.title || 'Untitled Listing'}</h4>
          <p className="text-[#666666] mt-1">{listingData.description || 'No description provided'}</p>
        </div>

        {listingType === 'produce' && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[#666666]">Crop:</span>
              <span className="ml-2 font-medium">{listingData.cropName || 'Not specified'}</span>
            </div>
            <div>
              <span className="text-[#666666]">Quantity:</span>
              <span className="ml-2 font-medium">{listingData.quantity || '0'} {listingData.unit || 'kg'}</span>
            </div>
            <div>
              <span className="text-[#666666]">Harvest Date:</span>
              <span className="ml-2 font-medium">{listingData.harvestDate || 'Not specified'}</span>
            </div>
            <div>
              <span className="text-[#666666]">Price Type:</span>
              <span className="ml-2 font-medium">{listingData.priceType || 'Not specified'}</span>
            </div>
          </div>
        )}


        {listingType === 'warehouse' && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[#666666]">Facility:</span>
              <span className="ml-2 font-medium">{listingData.facilityName || 'Not specified'}</span>
            </div>
            <div>
              <span className="text-[#666666]">Capacity:</span>
              <span className="ml-2 font-medium">{listingData.capacity || '0'} sq ft</span>
            </div>
            <div>
              <span className="text-[#666666]">Storage Types:</span>
              <span className="ml-2 font-medium">{listingData.storageTypes?.join(', ') || 'Not specified'}</span>
            </div>
            <div>
              <span className="text-[#666666]">Pricing:</span>
              <span className="ml-2 font-medium">{listingData.pricingModel || 'Not specified'}</span>
            </div>
          </div>
        )}

        {listingType === 'transport' && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[#666666]">Vehicle:</span>
              <span className="ml-2 font-medium">{listingData.vehicleType || 'Not specified'}</span>
            </div>
            <div>
              <span className="text-[#666666]">Capacity:</span>
              <span className="ml-2 font-medium">{listingData.capacity || '0'} tons</span>
            </div>
            <div>
              <span className="text-[#666666]">Route:</span>
              <span className="ml-2 font-medium">{listingData.routes?.from || 'Not specified'} to {listingData.routes?.to || 'Not specified'}</span>
            </div>
            <div>
              <span className="text-[#666666]">Price per km:</span>
              <span className="ml-2 font-medium">Rs. {listingData.pricePerKm || '0'}</span>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-[#e0e0e0]">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#666666]">Listing Duration:</span>
            <span className="font-medium">{listingData.duration || 'Not specified'} days</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-[#666666]">Status:</span>
            <span className="font-medium text-[#2eb5c2]">
              {listingData.publishNow ? 'Will be published immediately' : 'Draft'}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-medium text-blue-900 mb-2">Ready to Publish?</h4>
      <p className="text-sm text-blue-700">
        Your listing will be visible to other users immediately after publishing. You can edit or deactivate it anytime from your dashboard.
      </p>
    </div>
  </div>
)

export default DynamicForm
