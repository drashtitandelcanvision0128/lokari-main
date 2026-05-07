'use client'

import { useMemo } from 'react'

/**
 * Generic search hook for filtering arrays of objects
 * Provides consistent search functionality across all components
 */
export function useSearchFilter<T>(
  items: T[],
  searchQuery: string,
  searchFields: (keyof T)[],
  additionalFilters?: (item: T) => boolean
) {
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return additionalFilters 
        ? items.filter(additionalFilters)
        : items
    }

    const query = searchQuery.toLowerCase().trim()

    return items.filter(item => {
      // Check if item matches search query in any of the specified fields
      const matchesSearch = searchFields.some(field => {
        const value = item[field]
        if (typeof value === 'string') {
          return value.toLowerCase().includes(query)
        }
        if (typeof value === 'object' && value !== null) {
          // Handle nested objects (like buyer.name, seller.name)
          return Object.values(value).some(v => 
            typeof v === 'string' && v.toLowerCase().includes(query)
          )
        }
        return false
      })

      // Apply additional filters if provided
      const matchesAdditionalFilters = additionalFilters ? additionalFilters(item) : true

      return matchesSearch && matchesAdditionalFilters
    })
  }, [items, searchQuery, searchFields, additionalFilters])

  return filteredItems
}

/**
 * Search hook for dashboard-specific items with common fields
 */
export function useDashboardSearch<T extends Record<string, any>>(
  items: T[],
  searchQuery: string,
  additionalFilters?: (item: T) => boolean
) {
  // Common search fields for dashboard items
  const commonSearchFields: (keyof T)[] = ['product', 'title', 'name', 'description', 'orderNumber', 'id']
  
  return useSearchFilter(items, searchQuery, commonSearchFields, additionalFilters)
}

/**
 * Search hook for admin panel items with admin-specific fields
 */
export function useAdminSearch<T extends Record<string, any>>(
  items: T[],
  searchQuery: string,
  additionalFilters?: (item: T) => boolean
) {
  // Admin-specific search fields
  const adminSearchFields: (keyof T)[] = ['id', 'title', 'name', 'email', 'description', 'listingTitle']
  
  return useSearchFilter(items, searchQuery, adminSearchFields, additionalFilters)
}
