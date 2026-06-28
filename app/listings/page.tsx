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
import DashboardLoader from '@/components/ui/DashboardLoader'

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

  const ITEMS_PER_PAGE = 6

  const [currentPage, setCurrentPage] = useState(1)

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

        const res = await fetch(apiUrl('/listings?marketplace=true'))
        const result = await res.json()

        // console.log("DB listings:", result)
        console.log("First Listing:", result.data[0])
        console.log("Produce Listing:", result.data[0]?.produceListing)
        console.log("User:", result.data[0]?.user)
        console.log("Produce Images:", result.data[0]?.produceImages)

        // IMPORTANT FIX 👇
        const dbArray = result.data || []

        setDbListings(dbArray)

        // const normalizedDB = dbArray
        // Safety net: only show ACTIVE, non-blocked listings in the marketplace
        // .filter((item: any) => item.status === 'ACTIVE' && !item.is_blocked)
        // .map((item: any) => ({
        const normalizedDB = dbArray.map((item: any) => ({
          id: item.listing_id,
          title: item.title,
          description: item.description,
          type: item.type.toLowerCase(),
          price: Number(item.price),
          quantity:
            Number(item.farmerProduce?.quantity) ||
            item.warehouse?.capacity ||
            1,
          unit:
            item.farmerProduce?.unit ||
            item.transport?.vehicleType ||
            "unit",
          location: item.address
            ? `${item.address.city}, ${item.address.state}`
            : "Unknown",
          status: item.status.toLowerCase(),
          is_blocked: item.is_blocked || false,
          images: item.product_images || [],
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
        if (searchTerm.trim()) {
          const term = searchTerm.trim().toLowerCase()

          filtered = filtered.filter(listing =>
            (listing.title || '').toLowerCase().includes(term)
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

  // Pagination
  const totalPages = Math.ceil(filteredListings.length / ITEMS_PER_PAGE)

  const paginatedListings = filteredListings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const start =
    filteredListings.length === 0
      ? 0
      : (currentPage - 1) * ITEMS_PER_PAGE + 1

  const end = Math.min(
    currentPage * ITEMS_PER_PAGE,
    filteredListings.length
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [
    searchTerm,
    selectedType,
    selectedStatus,
    sortBy,
    sidebarFilters,
    categoryFromUrl
  ])

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
    return <DashboardLoader />
  }

  return (
    <div className="bg-background min-h-screen pt-16 pb-8">

      <div className="flex">
        {/* Sidebar Filters */}
        <SidebarFilters onFilterChange={handleSidebarFilterChange} />

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-8">
          <header className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-[#0b5d68] tracking-tight mb-2 font-headline">Marketplace Listings</h1>
                <p className="text-[0.875rem] text-[#666666] font-body">Real-time inventory and logistics exchange for modern agriculture.</p>
              </div>

              {/* Search Field - Extreme Right */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-base text-[#2eb5c2]">search</span>
                <input
                  className="w-64 rounded-[0.3125rem] border border-gray-200 bg-white py-2 pl-10 pr-4 text-[0.875rem] text-[#0b5d68] placeholder:text-gray-400 transition-all focus:border-[#2eb5c2] focus:outline-none focus:ring-2 focus:ring-[#2eb5c2]/30 font-body"
                  placeholder="Search listings..."
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Sort Options - Extreme Right, Below Search */}
            <div className="flex justify-end mt-4">
              <div className="flex items-center gap-2 bg-white border border-gray-100 p-1.5 rounded-[0.3125rem] w-fit">
                <span className="text-xs font-semibold px-3 text-[#666666] uppercase tracking-wider font-headline">Sort:</span>
                <button
                  onClick={() => setSortBy('latest')}
                  className={`px-3 py-1.5 text-[0.875rem] font-medium rounded-[0.3125rem] transition-colors font-body ${sortBy === 'latest'
                    ? 'bg-[#0b5d68] text-white'
                    : 'text-[#0b5d68] hover:bg-[#f0f0f0]'
                    }`}
                >
                  Latest
                </button>
                <button
                  onClick={() => setSortBy('price-low')}
                  className={`px-3 py-1.5 text-[0.875rem] font-medium rounded-[0.3125rem] transition-colors font-body ${sortBy === 'price-low'
                    ? 'bg-[#0b5d68] text-white'
                    : 'text-[#0b5d68] hover:bg-[#f0f0f0]'
                    }`}
                >
                  Price Low
                </button>
                <button
                  onClick={() => setSortBy('price-high')}
                  className={`px-3 py-1.5 text-[0.875rem] font-medium rounded-[0.3125rem] transition-colors font-body ${sortBy === 'price-high'
                    ? 'bg-[#0b5d68] text-white'
                    : 'text-[#0b5d68] hover:bg-[#f0f0f0]'
                    }`}
                >
                  Price High
                </button>
                <button
                  onClick={() => setSortBy('capacity')}
                  className={`px-3 py-1.5 text-[0.875rem] font-medium rounded-[0.3125rem] transition-colors font-body ${sortBy === 'capacity'
                    ? 'bg-[#0b5d68] text-white'
                    : 'text-[#0b5d68] hover:bg-[#f0f0f0]'
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
              Showing <span className="font-semibold">{start}</span>–
              <span className="font-semibold">{end}</span> of{" "}
              <span className="font-semibold">{filteredListings.length}</span> listings
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
              // filteredListings.map((listing) => (
              paginatedListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))
            )}
          </div>


          {!loading && filteredListings.length > 0 && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white p-2 shadow-sm">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="
                  flex items-center gap-1
px-4 py-2
rounded-lg
border border-gray-200
bg-white
text-[#0b5d68]
font-medium
transition-all duration-200 ease-out
hover:bg-[#f6f8f9]
hover:border-[#2eb5c2]
hover:-translate-y-[2px]
hover:shadow-lg
hover:scale-105
active:translate-y-0
disabled:opacity-40
disabled:cursor-not-allowed
disabled:hover:translate-y-0
disabled:hover:shadow-none
"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    chevron_left
                  </span>
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    return (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    )
                  })
                  .map((page, index, pages) => (
                    <div key={page} className="flex items-center">
                      {index > 0 && page - pages[index - 1] > 1 && (
                        <span className="px-1 text-sm font-semibold text-gray-400 select-none">...</span>
                      )}

                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`
          w-10 h-10
          rounded-lg
          font-medium
          transition-all duration-200 ease-out
          ${currentPage === page
                            ? 'bg-[#0b5d68] text-white shadow-md scale-105 ring-2 ring-[#2eb5c2]/20'
                            : 'bg-white border border-gray-200 text-[#0b5d68] hover:bg-[#f6f8f9] hover:border-[#2eb5c2] hover:-translate-y-[2px] hover:shadow-lg hover:scale-105'
                          }
        `}
                      >
                        {page}
                      </button>
                    </div>
                  ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="
                  flex items-center gap-1
px-4 py-2
rounded-lg
border border-gray-200
bg-white
text-[#0b5d68]
font-medium
transition-all duration-200 ease-out
hover:bg-[#f6f8f9]
hover:border-[#2eb5c2]
hover:-translate-y-[2px]
hover:shadow-lg
hover:scale-105
active:translate-y-0
disabled:opacity-40
disabled:cursor-not-allowed
disabled:hover:translate-y-0
disabled:hover:shadow-none
"
                >
                  Next
                  <span className="material-symbols-outlined text-[18px]">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<DashboardLoader />}>
      <ListingsPageContent />
    </Suspense>
  )
}
