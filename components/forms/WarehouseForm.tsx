'use client'

import { useState } from 'react'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'

interface WarehouseFormProps {
  onSubmit?: (data: any) => void
}

const WarehouseForm = ({ onSubmit }: WarehouseFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Storage',
    description: '',
    price: '',
    quantity: '',
    unit: 'sq ft',
    location: '',
    features: [] as string[]
  })

  const features = [
    'Temperature Control',
    'Humidity Control',
    'Pest Control',
    '24/7 Security',
    'Loading Docks',
    'Cold Storage',
    'Dry Storage',
    'Ventilation System',
    'Fire Suppression',
    'Insurance Coverage'
  ]

  const units = ['sq ft', 'sq meters', 'pallets', 'crates', 'containers']

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit({
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        type: 'warehouse'
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
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Warehouse Information</h2>
        
        <div className="space-y-6">
          <Input
            label="Warehouse Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Cold Storage Warehouse Facility"
            required
          />

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
              placeholder="Describe your warehouse facility, capacity, accessibility, etc."
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
              label="Available Space"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="0"
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
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
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., Rajasthan, India"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Available Features
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {features.map((feature) => (
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

export default WarehouseForm
