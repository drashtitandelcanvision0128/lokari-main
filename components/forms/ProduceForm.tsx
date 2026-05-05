'use client'

import { useState } from 'react'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'

interface ProduceFormProps {
  onSubmit?: (data: any) => void
}

const ProduceForm = ({ onSubmit }: ProduceFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
    quantity: '',
    unit: 'kg',
    location: '',
    images: [] as string[]
  })

  const categories = [
    'Vegetables',
    'Fruits',
    'Grains',
    'Dairy',
    'Meat',
    'Herbs',
    'Other'
  ]

  const units = ['kg', 'lbs', 'tons', 'bushels', 'crates', 'boxes', 'bags']

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit({
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        type: 'produce'
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-[#e0e0e0] p-6">
        <h2 className="text-xl font-semibold text-[#0b5d68] mb-6">Produce Information</h2>
        
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Produce Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Fresh Organic Tomatoes"
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-[#0b5d68] mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-[#e0e0e0] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0b5d68] focus:border-[#0b5d68] sm:text-sm"
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0b5d68] mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="block w-full px-3 py-2 border border-[#e0e0e0] rounded-lg shadow-sm placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#0b5d68] focus:border-[#0b5d68] sm:text-sm"
              placeholder="Describe your produce, quality, growing methods, etc."
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
              label="Available Quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="0"
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-[#0b5d68] mb-1">
                Unit
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-[#e0e0e0] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0b5d68] focus:border-[#0b5d68] sm:text-sm"
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
            placeholder="e.g., Maharashtra, India"
            required
          />

          <div>
            <label className="block text-sm font-medium text-[#0b5d68] mb-1">
              Images (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="mt-1 text-sm text-gray-600">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to 10MB each
              </p>
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

export default ProduceForm
