'use client'

import { useState, useEffect, Suspense } from 'react'
import { apiUrl } from '@/lib/api'
import { useSearchParams } from 'next/navigation'
import { dummyListings } from '@/lib/dummyData'
import ListingGrid from '@/components/listings/ListingGrid'
import ListingCard from '@/components/listings/ListingCard'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import SidebarFilters from '@/components/listings/SidebarFilters'

interface FilterState {
  categories: string[]
  location: string
  priceMin: string
  priceMax: string
  availabilityDate: string
  storageTypes: string[]
}

const getProductImage = (listing: any) => {
  // Use working Pexels URLs for the problematic products
  const imageMap: { [key: string]: string } = {
    'Fresh Organic Tomatoes': 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
    'Premium Wheat Grains': 'https://images.pexels.com/photos/1631378/wheat-field-harvest-agriculture-1631378.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
    'Cold Storage Warehouse': 'https://images.pexels.com/photos/704971/pexels-photo-704971.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
    'Refrigerated Transport Service': 'https://images.pexels.com/photos/707046/truck-truck-driver-semi-trailer-707046.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
    'Organic Apples': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=200&fit=crop&crop=center',
    // New products from stitch marketplace with actual stitch images
    'A-Grade Wheat': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPZxN73cAToZ1xs2ois-pOf3NPnE4X4FYsWgrE-vv3-QVq166zMI3nn5Pk8bPvup640j1hUU_BzyybMm86DjNt6D_2sQSqdYgwVHFN7UPnbczRDY5voBZvT-GqnykJtWf7XOCkleFVHFnSFeOQYKU1Wefezvql-gNR5bothSVNm_I4Mv-c9DysStzxcedSHCStpin-H66TJIkR6eAYzrWrdvLGuguIQkZ__eEx6Y68ATKOWQnJbSU7RWUG8rBfGkoEypYCrA06CHE',
    'Cold Storage Unit B-4': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfeB_JebhZ_ezEka2VU1Zg1zFkGVkyTZwXMVRLEMTpEfS7uKH9YhT07550Xcazi8pmVGj6h8CWQSAJ-zRWMHGFApqEVtuqF8p7T3vW6BgLJx55Tdi4TKuW-RmNLXXrcmf5W5G7ePEBmxBVQuoeUtF0ZO7ae7lZ0KqbDkYG_dPJ2AWTE9QY3zgIvIsu1bYsGatHERC4YrGtgGim-1TYAtMoXgdzC1fGsLYFwC0Pi8wlwpXTaan8n3u2Sup5tOkWir45iCi50dFUF74',
    'Bulk Grain Hauler': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBnMLdCPM5iqB0puuJ1zypdL6jgVB1rp8sVTCLcq8fuGu59hqqbBSr4ZoF93pwPGEWdr5PaHOEpbMIvqfELmBhZzS_WriAjk1dgfUrJdREa8BScsQARjcVlXBZ_1v0cKfAkacPbJrTXLYuoz8UqUYwPTOtMFKTed3M9DknA8p5luT1zWwzjaG5ULo0hphTgFxNaGsOb19svfkqlulscbi8eRNLlBhN3PE_ZyHsXo4_ur-I4GmtjYXObJEeCGwU7Xl-5_fuOxS846zo',
    // Demo Auction Products
    'Premium Organic Corn - Live Auction': 'https://images.pexels.com/photos/1549251/corn-cornfield-maize-agriculture-1549251.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
    'Heritage Potatoes - Auction Ending Soon': 'https://images.pexels.com/photos/2284101/potatoes-vegetables-food-farm-2284101.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
    'Fresh Strawberries - Hot Auction': 'https://images.pexels.com/photos/1994461/strawberries-fruits-fresh-red-1994461.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
    'Premium Soybeans - Fixed Price Deal': 'https://images.pexels.com/photos/536210/soybeans-bean-legume-soy-536210.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop'
  }

  return imageMap[listing.title] || 'https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop' // Default farm image
}

function ListingsPageContent() {
  const searchParams = useSearchParams()
  const categoryFromUrl = searchParams.get('category')

  const [listings, setListings] = useState(dummyListings)
  const [filteredListings, setFilteredListings] = useState(dummyListings)

  const [dbListings, setDbListings] = useState<any[]>([])
  const [loadingListings, setLoadingListings] = useState(true)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState(categoryFromUrl || 'all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState('latest')
  const [sidebarFilters, setSidebarFilters] = useState<FilterState>({
    categories: categoryFromUrl ? [categoryFromUrl] : ['produce', 'warehouse', 'transport'],
    location: 'all',
    priceMin: '',
    priceMax: '',
    availabilityDate: '',
    storageTypes: []
  })

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoadingListings(true)

        const res = await fetch(apiUrl('/listings'))
        const result = await res.json()

        console.log("DB listings:", result)

        // IMPORTANT FIX 👇
        const dbArray = result.data || []

        setDbListings(dbArray)

        const normalizedDB = dbArray.map((item: any) => ({
          id: item.listing_id,
          title: item.title,
          description: item.description,
          type: item.type.toLowerCase(),
          price: Number(item.price),
          quantity:
            item.produceListing?.quantity ||
            item.warehouseListing?.capacity ||
            1,
          unit:
            item.produceListing?.unit ||
            item.transportListing?.vehicleType ||
            "unit",
          location: item.user?.location || "Unknown",
          status: item.status.toLowerCase(),
          images: [],
          isDb: true
        }))

        const merged = [...normalizedDB, ...dummyListings]

        setListings(merged)
        setFilteredListings(merged)

      } catch (err) {
        console.log("API failed, using dummy only")

        setListings(dummyListings)
        setFilteredListings(dummyListings)

      } finally {
        setLoadingListings(false)
      }
    }

    fetchListings()
  }, [])

  useEffect(() => {
    setLoading(true)

    const timer = setTimeout(() => {
      let filtered = listings

      // URL category filter (highest precedence)
      if (categoryFromUrl) {
        let filterType = categoryFromUrl
        // Map 'storage' URL parameter to 'warehouse' type
        if (categoryFromUrl === 'storage') {
          filterType = 'warehouse'
        }
        filtered = listings.filter(listing => listing.type === filterType)
      } else {
        // Search filter
        if (searchTerm) {
          const term = searchTerm.toLowerCase()

          filtered = filtered.filter(listing =>
            (listing.title || '').toLowerCase().includes(term) ||
            (listing.description || '').toLowerCase().includes(term) ||
            (listing.category || '').toLowerCase().includes(term)
          )
        }

        // Type filter
        if (selectedType !== 'all') {
          filtered = filtered.filter(listing => listing.type.toLowerCase() === selectedType.toLowerCase())
        }
        console.log("FINAL LISTINGS:", listings)
        // Status filter
        if (selectedStatus !== 'all') {
          filtered = filtered.filter(listing => listing.status === selectedStatus)
        }

        // Sidebar filters
        if (sidebarFilters.categories.length > 0 && !sidebarFilters.categories.includes('all')) {
          filtered = filtered.filter(listing => sidebarFilters.categories.includes(listing.type))
        }

        if (sidebarFilters.location !== 'all') {
          filtered = filtered.filter(listing =>
            listing.location.toLowerCase().includes(sidebarFilters.location.toLowerCase())
          )
        }

        if (sidebarFilters.priceMin) {
          filtered = filtered.filter(listing => listing.price >= parseFloat(sidebarFilters.priceMin))
        }

        if (sidebarFilters.priceMax) {
          filtered = filtered.filter(listing => listing.price <= parseFloat(sidebarFilters.priceMax))
        }

        // Storage type filter (only applies to warehouse listings)
        if (sidebarFilters.storageTypes.length > 0) {
          filtered = filtered.filter(listing => {
            // Only apply storage type filter to warehouse listings
            if (listing.type !== 'warehouse') {
              return false
            }

            // Map filter values to keywords to search in title/description/storageTypes
            const typeMapping: { [key: string]: string[] } = {
              'cold': ['cold storage', 'temperature controlled', 'freeze'],
              'dry': ['dry grain', 'dry storage', 'silo', 'grain storage'],
              'climate': ['climate controlled', 'temperature controlled', 'humidity']
            }

            return sidebarFilters.storageTypes.some(filterType => {
              const keywords = typeMapping[filterType] || []
              const searchText = `${listing.title} ${listing.description} ${(listing.storageTypes || []).join(' ')}`.toLowerCase()
              return keywords.some(keyword => searchText.includes(keyword))
            })
          })
        }
      }

      // Sorting
      if (sortBy === 'price-low') {
        filtered.sort((a, b) => a.price - b.price)
      } else if (sortBy === 'price-high') {
        filtered.sort((a, b) => b.price - a.price)
      } else if (sortBy === 'capacity') {
        filtered.sort((a, b) => b.quantity - a.quantity)
      }
      // 'latest' is default (no sorting needed as we keep original order)

      setFilteredListings(filtered)
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, selectedType, selectedStatus, listings, sortBy, sidebarFilters, categoryFromUrl])

  const types = ['all', 'produce', 'warehouse', 'transport']
  const statuses = ['all', 'active', 'pending', 'sold']

  const handleSidebarFilterChange = (filters: FilterState) => {
    // Preserve URL category when clearing other filters
    if (categoryFromUrl) {
      setSidebarFilters({
        ...filters,
        categories: categoryFromUrl === 'storage' ? ['warehouse'] : [categoryFromUrl]
      })
    } else {
      setSidebarFilters(filters)
    }
  }

  if (loadingListings) {
    return <div className="p-6">Loading marketplace...</div>
  }

  return (
    <div className="bg-[#fcf9f5] min-h-screen pt-16">

      <div className="flex min-h-screen">
        {/* Sidebar Filters */}
        <SidebarFilters onFilterChange={handleSidebarFilterChange} />

        {/* Main Content */}
        <main className="flex-1 lg:ml-72 p-8">
          <header className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-[#012d1d] tracking-tight mb-2 font-['Manrope']">Marketplace Listings</h1>
                <p className="text-[#414844] text-sm">Real-time inventory and logistics exchange for modern agriculture.</p>
              </div>

              {/* Search Field - Extreme Right */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717973] text-sm material-symbols-outlined text-base">search</span>
                <input
                  className="pl-10 pr-4 py-2 rounded-lg bg-white border border-gray-200 focus:ring-2 focus:ring-[#012d1d] focus:border-transparent text-sm w-64"
                  placeholder="Search listings..."
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Sort Options - Extreme Right, Below Search */}
            <div className="flex justify-end mt-4">
              <div className="flex items-center gap-2 bg-[#f6f3ef] p-1.5 rounded-xl w-fit">
                <span className="text-xs font-semibold px-3 text-[#717973] uppercase tracking-widest">Sort:</span>
                <button
                  onClick={() => setSortBy('latest')}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${sortBy === 'latest'
                    ? 'bg-[#ffffff] text-[#012d1d] shadow-sm'
                    : 'text-[#414844] hover:bg-[#e5e2de]'
                    }`}
                >
                  Latest
                </button>
                <button
                  onClick={() => setSortBy('price-low')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${sortBy === 'price-low'
                    ? 'bg-[#ffffff] text-[#012d1d] shadow-sm'
                    : 'text-[#414844] hover:bg-[#e5e2de]'
                    }`}
                >
                  Price Low
                </button>
                <button
                  onClick={() => setSortBy('price-high')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${sortBy === 'price-high'
                    ? 'bg-[#ffffff] text-[#012d1d] shadow-sm'
                    : 'text-[#414844] hover:bg-[#e5e2de]'
                    }`}
                >
                  Price High
                </button>
                <button
                  onClick={() => setSortBy('capacity')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${sortBy === 'capacity'
                    ? 'bg-[#ffffff] text-[#012d1d] shadow-sm'
                    : 'text-[#414844] hover:bg-[#e5e2de]'
                    }`}
                >
                  Capacity
                </button>
              </div>
            </div>
          </header>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-[#414844]">
              Showing {filteredListings.length} of {listings.length} listings
            </p>
          </div>

          {/* Listing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-[#ffffff] rounded-xl overflow-hidden flex flex-col animate-pulse">
                  <div className="h-48 bg-gradient-to-br from-[#f6f3ef] to-[#e5e2de] animate-pulse"></div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="h-6 bg-[#f0ede9] rounded mb-2"></div>
                        <div className="h-4 bg-[#f0ede9] rounded w-3/4"></div>
                      </div>
                      <div className="h-6 bg-[#f0ede9] rounded w-20"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-[#f0ede9] p-3 rounded-lg h-12"></div>
                      <div className="bg-[#f0ede9] p-3 rounded-lg h-12"></div>
                    </div>
                    <div className="h-10 bg-[#f0ede9] rounded-lg mt-auto"></div>
                  </div>
                </div>
              ))
            ) : filteredListings.length === 0 ? (
              <div className="col-span-full py-20 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-[#f0ede9] rounded-full flex items-center justify-center mb-6">
                  <span className="text-4xl text-[#717973]">🔍</span>
                </div>
                <h3 className="text-2xl font-bold text-[#012d1d] mb-2 font-['Manrope']">No matching listings</h3>
                <p className="text-[#414844] max-w-sm">We couldn't find any listings that match your current filter selection. Try adjusting your search or filters.</p>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedStatus('all')
                    // Preserve URL category when clearing filters
                    const preservedCategory = categoryFromUrl === 'storage' ? 'warehouse' : categoryFromUrl
                    setSelectedType(preservedCategory || 'all')
                    setSidebarFilters({
                      categories: preservedCategory ? [preservedCategory] : ['produce', 'warehouse', 'transport'],
                      location: 'all',
                      priceMin: '',
                      priceMax: '',
                      availabilityDate: '',
                      storageTypes: []
                    })
                  }}
                  className="mt-8 px-6 py-2 border border-[#012d1d] text-[#012d1d] font-semibold rounded-lg hover:bg-[#012d1d] hover:text-white transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<div>Loading listings...</div>}>
      <ListingsPageContent />
    </Suspense>
  )
}
