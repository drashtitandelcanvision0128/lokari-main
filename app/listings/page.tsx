'use client'

import { useState, useEffect, Suspense } from 'react'
import { apiUrl } from '@/lib/api'
import { useSearchParams } from 'next/navigation'
import ListingCard from '@/components/listings/ListingCard'
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

const ITEMS_PER_PAGE = 6

function ListingsPageContent() {
  const searchParams = useSearchParams()
  const categoryFromUrl = searchParams.get('category')

  const [listings, setListings] = useState<any[]>([])
  const [loadingListings, setLoadingListings] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState(categoryFromUrl || 'all')
  const [sortBy, setSortBy] = useState('latest')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [sidebarFilters, setSidebarFilters] = useState<FilterState>({
    categories: categoryFromUrl ? [categoryFromUrl] : ['produce', 'warehouse', 'transport'],
    location: 'all',
    priceMin: '',
    priceMax: '',
    availabilityDate: '',
    storageTypes: [],
  })

  // ── Fetch from server whenever any filter/sort/page changes ──
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoadingListings(true)

        const params = new URLSearchParams({
          marketplace: 'true',
          search: searchTerm.trim(),
          page: String(currentPage),
          limit: String(ITEMS_PER_PAGE),
          sortBy,
        })

        // Category from URL takes highest precedence
        if (categoryFromUrl) {
          params.set('type', categoryFromUrl === 'storage' ? 'WAREHOUSE' : categoryFromUrl.toUpperCase())
        } else if (selectedType !== 'all') {
          params.set('type', selectedType.toUpperCase())
        }

        // Sidebar filters
        if (sidebarFilters.location !== 'all') {
          params.set('location', sidebarFilters.location)
        }
        if (sidebarFilters.priceMin) params.set('priceMin', sidebarFilters.priceMin)
        if (sidebarFilters.priceMax) params.set('priceMax', sidebarFilters.priceMax)

        if (sidebarFilters.categories.length > 0) {
          params.set('type', sidebarFilters.categories.join(','))
        }
        if (sidebarFilters.storageTypes.length > 0) {
          params.set('storageTypes', sidebarFilters.storageTypes.join(','))
        }

        const res = await fetch(apiUrl(`/listings?${params.toString()}`))
        console.log(params.toString())
        const result = await res.json()

        const dbArray = result.data || []

        const normalizedListings = dbArray.map((item: any) => ({
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
            'unit',
          location: item.address
            ? `${item.address.city}, ${item.address.state}`
            : 'Unknown',
          status: item.status.toLowerCase(),
          is_blocked: item.is_blocked || false,
          images: item.product_images || [],
          isDb: true,
        }))

        setListings(normalizedListings)
        setTotalPages(result.totalPages || 1)
        setTotalCount(result.total || normalizedListings.length)
      } catch (err) {
        console.error('Failed to fetch listings:', err)
        setListings([])
        setTotalPages(1)
        setTotalCount(0)
      } finally {
        setLoadingListings(false)
      }
    }

    fetchListings()
  }, [searchTerm, selectedType, sortBy, sidebarFilters, categoryFromUrl, currentPage])

  // ── Reset to page 1 when filters/search change ──
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedType, sortBy, sidebarFilters, categoryFromUrl])

  const start = totalCount === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1
  const end = Math.min(currentPage * ITEMS_PER_PAGE, totalCount)

  const handleSidebarFilterChange = (filters: FilterState) => {
    if (categoryFromUrl) {
      setSidebarFilters({
        ...filters,
        categories: categoryFromUrl === 'storage' ? ['warehouse'] : [categoryFromUrl],
      })
    } else {
      setSidebarFilters(filters)
    }
  }

  return (
    <div className="bg-background min-h-screen pt-16 pb-8">
      <div className="flex">
        {/* Sidebar */}
        <SidebarFilters onFilterChange={handleSidebarFilterChange} />

        {/* Main */}
        <main className="flex-1 min-w-0 p-8">
          <header className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-[#0b5d68] tracking-tight mb-2 font-headline">
                  Marketplace Listings
                </h1>
                <p className="text-[0.875rem] text-[#666666] font-body">
                  Real-time inventory and logistics exchange for modern agriculture.
                </p>
              </div>

              {/* Search */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-base text-[#2eb5c2]">
                  search
                </span>
                <input
                  className="w-64 rounded-[0.3125rem] border border-gray-200 bg-white py-2 pl-10 pr-4 text-[0.875rem] text-[#0b5d68] placeholder:text-gray-400 transition-all focus:border-[#2eb5c2] focus:outline-none focus:ring-2 focus:ring-[#2eb5c2]/30 font-body"
                  placeholder="Search listings..."
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Sort */}
            <div className="flex justify-end mt-4">
              <div className="flex items-center gap-2 bg-white border border-gray-100 p-1.5 rounded-[0.3125rem] w-fit">
                <span className="text-xs font-semibold px-3 text-[#666666] uppercase tracking-wider font-headline">
                  Sort:
                </span>
                {[
                  { value: 'latest', label: 'Latest' },
                  { value: 'price-low', label: 'Price Low' },
                  { value: 'price-high', label: 'Price High' },
                  { value: 'capacity', label: 'Capacity' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setSortBy(value)}
                    className={`px-3 py-1.5 text-[0.875rem] font-medium rounded-[0.3125rem] transition-colors font-body ${sortBy === value ? 'bg-[#0b5d68] text-white' : 'text-[#0b5d68] hover:bg-[#f0f0f0]'
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </header>

          {/* Results count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-[#414844]">
              Showing <span className="font-semibold">{start}</span>–
              <span className="font-semibold">{end}</span> of{' '}
              <span className="font-semibold">{totalCount}</span> listings
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {loadingListings ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl overflow-hidden flex flex-col animate-pulse">
                  <div className="h-48 bg-gradient-to-br from-[#f6f3ef] to-[#e5e2de]" />
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="h-6 bg-[#f0ede9] rounded mb-2" />
                        <div className="h-4 bg-[#f0ede9] rounded w-3/4" />
                      </div>
                      <div className="h-6 bg-[#f0ede9] rounded w-20" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-[#f0ede9] p-3 rounded-lg h-12" />
                      <div className="bg-[#f0ede9] p-3 rounded-lg h-12" />
                    </div>
                    <div className="h-10 bg-[#f0ede9] rounded-lg mt-auto" />
                  </div>
                </div>
              ))
            ) : listings.length === 0 ? (
              <div className="col-span-full py-20 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-[#f0ede9] rounded-full flex items-center justify-center mb-6">
                  <span className="text-4xl text-[#717973]">🔍</span>
                </div>
                <h3 className="text-2xl font-bold text-[#012d1d] mb-2 font-headline">
                  No matching listings
                </h3>
                <p className="text-[#414844] max-w-sm">
                  We couldn't find any listings that match your current filter selection. Try
                  adjusting your search or filters.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    const preservedCategory =
                      categoryFromUrl === 'storage' ? 'warehouse' : categoryFromUrl
                    setSelectedType(preservedCategory || 'all')
                    setSidebarFilters({
                      categories: preservedCategory
                        ? [preservedCategory]
                        : ['produce', 'warehouse', 'transport'],
                      location: 'all',
                      priceMin: '',
                      priceMax: '',
                      availabilityDate: '',
                      storageTypes: [],
                    })
                  }}
                  className="mt-8 px-6 py-2 border border-[#012d1d] text-[#012d1d] font-semibold rounded-lg hover:bg-[#012d1d] hover:text-white transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))
            )}
          </div>

          {/* Pagination */}
          {!loadingListings && totalCount > 0 && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white p-2 shadow-sm">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 bg-white text-[#0b5d68] font-medium transition-all duration-200 ease-out hover:bg-[#f6f8f9] hover:border-[#2eb5c2] hover:-translate-y-[2px] hover:shadow-lg hover:scale-105 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1),
                  )
                  .map((page, index, pages) => (
                    <div key={page} className="flex items-center">
                      {index > 0 && page - pages[index - 1] > 1 && (
                        <span className="px-1 text-sm font-semibold text-gray-400 select-none">
                          ...
                        </span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ease-out ${currentPage === page
                          ? 'bg-[#0b5d68] text-white shadow-md scale-105 ring-2 ring-[#2eb5c2]/20'
                          : 'bg-white border border-gray-200 text-[#0b5d68] hover:bg-[#f6f8f9] hover:border-[#2eb5c2] hover:-translate-y-[2px] hover:shadow-lg hover:scale-105'
                          }`}
                      >
                        {page}
                      </button>
                    </div>
                  ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 bg-white text-[#0b5d68] font-medium transition-all duration-200 ease-out hover:bg-[#f6f8f9] hover:border-[#2eb5c2] hover:-translate-y-[2px] hover:shadow-lg hover:scale-105 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  Next
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
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