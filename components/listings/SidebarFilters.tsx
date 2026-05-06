'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getCurrentUser, getUserRole } from '@/lib/auth'
import { usePostListingNavigation } from '@/hooks/usePostListingNavigation'

interface SidebarFiltersProps {
  onFilterChange: (filters: FilterState) => void
}

interface FilterState {
  categories: string[]
  location: string
  priceMin: string
  priceMax: string
  availabilityDate: string
  storageTypes: string[]
}

const SidebarFilters = ({ onFilterChange }: SidebarFiltersProps) => {
  const [userRole, setUserRole] = useState<string>('')
  const { createListingPath } = usePostListingNavigation()
  const [filters, setFilters] = useState<FilterState>({
    categories: ['produce', 'warehouse', 'transport'],
    location: 'all',
    priceMin: '',
    priceMax: '',
    availabilityDate: '',
    storageTypes: []
  })

  useEffect(() => {
    const role = getUserRole()
    setUserRole(role)
  }, [])

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter(c => c !== category)
    
    const newFilters = { ...filters, categories: newCategories }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleStorageTypeClick = (storageType: string) => {
    const newStorageTypes = filters.storageTypes.includes(storageType)
      ? filters.storageTypes.filter(t => t !== storageType)
      : [...filters.storageTypes, storageType]
    
    const newFilters = { ...filters, storageTypes: newStorageTypes }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleChange = (field: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [field]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-[#f6f3ef] border-r border-stone-200/20 fixed h-[calc(100vh-4rem)] overflow-y-auto py-8 px-6">
      <div className="mb-8">
        <h2 className="font-bold text-[#012d1d] mb-4 text-lg font-['Manrope']">Market Filters</h2>
        
        <div className="space-y-6">
          {/* Category Filters */}
          <div>
            <label className="block font-semibold text-xs uppercase tracking-wider text-[#717973] mb-3">Category</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 text-sm cursor-pointer">
                <input
                  checked={filters.categories.includes('produce')}
                  onChange={(e) => handleCategoryChange('produce', e.target.checked)}
                  className="rounded border-[#c1c8c2] text-[#012d1d] focus:ring-[#012d1d]"
                  type="checkbox"
                />
                <span>Produce</span>
              </label>
              <label className="flex items-center gap-3 text-sm cursor-pointer">
                <input
                  checked={filters.categories.includes('warehouse')}
                  onChange={(e) => handleCategoryChange('warehouse', e.target.checked)}
                  className="rounded border-[#c1c8c2] text-[#012d1d] focus:ring-[#012d1d]"
                  type="checkbox"
                />
                <span>Storage Units</span>
              </label>
              <label className="flex items-center gap-3 text-sm cursor-pointer">
                <input
                  checked={filters.categories.includes('transport')}
                  onChange={(e) => handleCategoryChange('transport', e.target.checked)}
                  className="rounded border-[#c1c8c2] text-[#012d1d] focus:ring-[#012d1d]"
                  type="checkbox"
                />
                <span>Transport</span>
              </label>
            </div>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block font-semibold text-xs uppercase tracking-wider text-[#717973] mb-3">Location</label>
            <select
              value={filters.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="w-full bg-[#ffffff] border-none border-b border-[#c1c8c2] focus:ring-0 focus:border-[#012d1d] text-sm py-2 px-0"
            >
              <option value="all">All Regions</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Uttarakhand">Uttarakhand</option>
              <option value="Punjab">Punjab</option>
              <option value="Himachal Pradesh">Himachal Pradesh</option>
              <option value="Delhi">Delhi</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block font-semibold text-xs uppercase tracking-wider text-[#717973] mb-3">Price Range</label>
            <div className="flex items-center gap-2">
              <input
                value={filters.priceMin}
                onChange={(e) => handleChange('priceMin', e.target.value)}
                className="w-full bg-[#ffffff] border-none border-b border-[#c1c8c2] text-sm py-1"
                placeholder="Min"
                type="text"
              />
              <span className="text-[#717973]">-</span>
              <input
                value={filters.priceMax}
                onChange={(e) => handleChange('priceMax', e.target.value)}
                className="w-full bg-[#ffffff] border-none border-b border-[#c1c8c2] text-sm py-1"
                placeholder="Max"
                type="text"
              />
            </div>
          </div>

          
          {/* Storage Type */}
          <div>
            <label className="block font-semibold text-xs uppercase tracking-wider text-[#717973] mb-3">Storage Type</label>
            <div className="flex flex-wrap gap-2">
              <span
                onClick={() => handleStorageTypeClick('cold')}
                className={`px-3 py-1 rounded-full text-xs border cursor-pointer transition-colors ${
                  filters.storageTypes.includes('cold')
                    ? 'bg-[#012d1d] text-white border-[#012d1d]'
                    : 'bg-[#f0ede9] border-[#c1c8c2] hover:bg-[#012d1d] hover:text-white'
                }`}
              >
                Cold Storage
              </span>
              <span
                onClick={() => handleStorageTypeClick('dry')}
                className={`px-3 py-1 rounded-full text-xs border cursor-pointer transition-colors ${
                  filters.storageTypes.includes('dry')
                    ? 'bg-[#012d1d] text-white border-[#012d1d]'
                    : 'bg-[#f0ede9] border-[#c1c8c2] hover:bg-[#012d1d] hover:text-white'
                }`}
              >
                Dry Grain Silo
              </span>
              <span
                onClick={() => handleStorageTypeClick('climate')}
                className={`px-3 py-1 rounded-full text-xs border cursor-pointer transition-colors ${
                  filters.storageTypes.includes('climate')
                    ? 'bg-[#012d1d] text-white border-[#012d1d]'
                    : 'bg-[#f0ede9] border-[#c1c8c2] hover:bg-[#012d1d] hover:text-white'
                }`}
              >
                Climate Controlled
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {userRole !== 'trader' && (
        <Link href={createListingPath} className="mt-auto w-full py-3 bg-[#012d1d] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#1b4332] transition-all font-['Manrope'] text-center block">
          <span className="text-sm">+</span>
          Post Listing
        </Link>
      )}
    </aside>
  )
}

export default SidebarFilters
