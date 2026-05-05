'use client'

import { useState } from 'react'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'

interface TransportFormProps {
  onSubmit?: (data: any) => void
}

const TransportForm = ({ onSubmit }: TransportFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Logistics',
    description: '',
    price: '',
    quantity: '',
    unit: 'mile',
    location: '',
    vehicleType: '',
    capacity: '',
    serviceArea: '',
    features: [] as string[]
  })

  const vehicleTypes = [
    'Refrigerated Truck',
    'Dry Van',
    'Flatbed',
    'Tanker',
    'Box Truck',
    'Pickup Truck',
    'Cargo Van',
    'Semi-Trailer'
  ]

  const transportFeatures = [
    'GPS Tracking',
    'Temperature Monitoring',
    'Insurance Coverage',
    '24/7 Support',
    'Express Delivery',
    'Same Day Delivery',
    'Overnight Delivery',
    'White Glove Service',
    'Hazardous Materials Certified',
    'Cross-Border Transport'
  ]

  const units = ['mile', 'km', 'hour', 'day', 'trip', 'pallet', 'kg', 'lb']

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit({
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        type: 'transport'
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Transport Service Information</h2>
        
        <div className="space-y-6">
          <Input
            label="Service Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Refrigerated Transport Service"
            required
          />

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Type
              </label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                required
              >
                <option value="">Select vehicle type</option>
                {vehicleTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <Input
              label="Vehicle Capacity"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="e.g., 2000 kg or 10 pallets"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Describe your transport service, coverage area, specializations, etc."
              required
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Input
              label="Price per Unit"
              name="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              required
            />
            
            <Input
              label="Service Range"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="0"
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pricing Unit
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Service Area"
            name="serviceArea"
            value={formData.serviceArea}
            onChange={handleChange}
            placeholder="e.g., North India, Maharashtra to Gujarat"
            required
          />

          <Input
            label="Base Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., Uttar Pradesh, India"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Service Features
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {transportFeatures.map((feature) => (
                <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.features.includes(feature)}
                    onChange={() => handleFeatureToggle(feature)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">{feature}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <Button variant="outline" type="button">
          Save as Draft
        </Button>
        <Button type="submit">
          Publish Listing
        </Button>
      </div>
    </form>
  )
}

export default TransportForm
