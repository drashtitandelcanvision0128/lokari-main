'use client'

import { useState, useEffect } from 'react'
import DashboardLoader from '@/components/ui/DashboardLoader'
import { AdminListing } from '@/types/admin'
import { apiUrl, authHeaders } from '@/lib/api'
import { AdminDetailDrawer } from '../AdminDetailDrawer'
import { EditListingModal } from './EditListingModal'
import AdminTable from '@/components/admin/common/AdminTable'

interface ListingsPanelProps {
  searchQuery?: string
}

type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'

export function ListingsPanel({ searchQuery = '' }: ListingsPanelProps) {
  const [listings, setListings] = useState<AdminListing[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedListing, setSelectedListing] = useState<AdminListing | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editListingData, setEditListingData] = useState<AdminListing | null>(null)

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [localSearch, setLocalSearch] = useState('')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Sorting
  const [sortField, setSortField] = useState<'title' | 'seller' | 'location' | 'price' | 'quantity' | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const handleSort = (field: 'title' | 'seller' | 'location' | 'price' | 'quantity') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Reset to page 1 when filters/search change
  useEffect(() => {
    setCurrentPage(1)
  }, [localSearch, selectedCategory, selectedStatus, sortField, sortDirection, rowsPerPage])

  const fetchListings = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search: localSearch.trim(),
        status: selectedStatus === 'all' ? 'all' : selectedStatus.toUpperCase(),
        sortField: sortField ?? '',
        sortDirection,
        page: String(currentPage),
        limit: String(rowsPerPage),
      })

      const response = await fetch(apiUrl(`/listings?${params.toString()}`), {
        headers: authHeaders(),
      })
      const result = await response.json()

      if (result.success) {
        const formattedListings: AdminListing[] = result.data.map((item: any) => {
          const addr = item.user?.addresses?.[0]
          const profile = item.user?.profile
          const sellerLocation = addr
            ? [addr.city, addr.state].filter(Boolean).join(', ')
            : profile?.farm_location
            || profile?.warehouse_location
            || profile?.service_area
            || 'N/A'

          return {
            id: item.listing_id,
            title: item.title,
            description: item.description || '',
            category:
              item.type === 'PRODUCE' ? 'produce'
                : item.type === 'WAREHOUSE' ? 'warehouse'
                  : 'transport',
            seller: {
              id: item.user_id,
              name: item.user?.name || 'Unknown User',
              email: item.user?.email || 'N/A',
              location: sellerLocation,
            },
            price: Number(item.price),
            unit: item.farmerProduce?.unit || item.transport?.vehicle_type || 'unit',
            quantity: item.farmerProduce?.quantity || item.warehouse?.capacity || 1,
            location: item.address?.city
              ? `${item.address.city}, ${item.address.state}`
              : item.listing_location || 'N/A',
            status:
              item.status === 'ACTIVE' ? 'active'
                : item.status === 'DRAFT' ? 'draft'
                  : item.status === 'SOLD' ? 'sold'
                    : item.status === 'EXPIRED' ? 'expired'
                      : 'draft',
            isBlocked: item.is_blocked || false,
            verificationStatus: item.verification_status,
            createdAt: item.created_at,
            expiresAt:
              item.farmerProduce?.expiry_date ||
              item.warehouse?.available_to ||
              item.transport?.available_to ||
              item.created_at,
            views: 0,
            inquiries: 0,
            reports: 0,
            featured: false,
            image:
              item.product_images?.length > 0
                ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${item.product_images[0]}`
                : '',
            images: item.product_images || [],
          }
        })

        setListings(formattedListings)
        setTotalPages(result.totalPages)
        setTotalCount(result.total)
      }
    } catch (error) {
      console.error('Failed to fetch admin listings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchListings()
  }, [localSearch, selectedStatus, sortField, sortDirection, currentPage, rowsPerPage])

  // Category filter is client-side only (backend doesn't have a category/type filter param yet)
  const displayedListings = selectedCategory === 'all'
    ? listings
    : listings.filter(l => l.category === selectedCategory)

  const handleSaveListing = async (listingId: string, updatedData: any) => {
    try {
      const response = await fetch(apiUrl(`/listings/${listingId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(updatedData)
      })
      if (response.ok) {
        fetchListings()
      } else {
        alert('Failed to update listing')
      }
    } catch (error) {
      console.error('Error updating listing:', error)
    }
  }

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return
    try {
      const response = await fetch(apiUrl(`/listings/${listingId}`), {
        method: 'DELETE',
        headers: authHeaders()
      })
      if (response.ok) {
        fetchListings()
        setIsDrawerOpen(false)
        setSelectedListing(null)
      } else {
        alert('Failed to delete listing')
      }
    } catch (error) {
      console.error('Error deleting listing:', error)
    }
  }

  const handleVerificationChange = async (listingId: string, status: VerificationStatus) => {
    try {
      const response = await fetch(apiUrl(`/listings/${listingId}/verification`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ verification_status: status }),
      })
      if (response.ok) {
        fetchListings()
      } else {
        alert('Failed to update verification status')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleAction = (action: string, item: any) => {
    if (action === 'block_toggled') fetchListings()
    else if (action === 'edit') { setEditListingData(item); setIsEditModalOpen(true) }
    else if (action === 'delete') handleDeleteListing(item.id)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'produce': return 'agriculture'
      case 'warehouse': return 'warehouse'
      case 'transport': return 'local_shipping'
      default: return 'category'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'draft': return 'bg-gray-100 text-gray-600 border-gray-200'
      case 'sold': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'expired': return 'bg-orange-100 text-orange-700 border-orange-200'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

  const SortButton = ({ field, label }: { field: 'title' | 'seller' | 'location' | 'price' | 'quantity', label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="group inline-flex items-center gap-2 text-[13px] font-semibold text-[#667085] transition-colors hover:text-[#0b5d68]"
    >
      {label}
      <span className="material-symbols-outlined text-[13px] text-gray-400 transition-all duration-200 group-hover:-translate-y-[1px] group-hover:text-[#0b5d68]">
        {sortField === field ? (sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
      </span>
    </button>
  )

  if (loading) return <DashboardLoader />

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Filters bar */}
        <div className="flex flex-wrap gap-3 items-center">

          {/* Search */}
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm">
            <span className="material-symbols-outlined text-sm text-gray-400">search</span>
            <input
              className="bg-transparent border-none text-sm focus:ring-0 p-0 w-48 text-gray-700 placeholder-gray-400 outline-none"
              placeholder="Search listings..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>

          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-full bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2eb5c2]"
          >
            <option value="all">All Categories</option>
            <option value="produce">Produce</option>
            <option value="warehouse">Warehouse</option>
            <option value="transport">Transport</option>
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-full bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2eb5c2]"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="SOLD">Sold</option>
            <option value="EXPIRED">Expired</option>
          </select>

          <div className="ml-auto text-sm text-gray-500">
            {totalCount} listings total
          </div>
        </div>

        <AdminTable>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-center"><SortButton field="title" label="Title" /></th>
                  <th className="px-6 py-3 text-center"><SortButton field="seller" label="Seller" /></th>
                  <th className="px-6 py-3 text-center text-[13px] font-semibold text-[#667085]">Category</th>
                  <th className="px-6 py-3 text-center"><SortButton field="location" label="Location" /></th>
                  <th className="px-6 py-3 text-center"><SortButton field="quantity" label="Quantity" /></th>
                  <th className="px-6 py-3 text-center"><SortButton field="price" label="Price" /></th>
                  <th className="px-6 py-3 text-center text-[13px] font-semibold text-[#667085]">Status</th>
                  <th className="px-6 py-3 text-center text-[13px] font-semibold text-[#667085]">Created</th>
                  <th className="px-6 py-3 text-center text-[13px] font-semibold text-[#667085]">Verification</th>
                  <th className="px-6 py-3 text-center text-[13px] font-semibold text-[#667085]">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedListings.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-2xl text-gray-400">inventory_2</span>
                      </div>
                      <p>No listings found</p>
                    </td>
                  </tr>
                ) : (
                  displayedListings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-gray-50 transition-colors">

                      {/* Title */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 max-w-[200px]">
                          {listing.image ? (
                            <img src={listing.image} alt={listing.title} className="h-10 w-10 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                          ) : (
                            <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-gray-100 flex items-center justify-center">
                              <span className="material-symbols-outlined text-gray-500">{getCategoryIcon(listing.category)}</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{listing.title}</p>
                            <p className="mt-0.5 text-xs text-gray-500 truncate">{listing.description || 'No description'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Seller */}
                      <td className="px-6 py-4 text-sm text-gray-600">{listing.seller.name}</td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${listing.category === 'produce' ? 'bg-[#2eb5c2]/10 text-[#2eb5c2] border-[#2eb5c2]/20'
                            : listing.category === 'warehouse' ? 'bg-amber-100 text-amber-700 border-amber-200'
                              : 'bg-purple-100 text-purple-700 border-purple-200'
                          }`}>
                          {listing.category}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4 text-sm text-gray-600">{listing.location}</td>

                      {/* Quantity */}
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1 rounded bg-gray-100 px-3 py-1">
                          <span className="text-sm font-medium text-[#0b5d68]">{listing.quantity}</span>
                          <span className="text-xs text-gray-500">{listing.unit}</span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 text-sm font-medium text-[#0b5d68]">
                        ₹{listing.price}/{listing.unit}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(listing.status)}`}>
                          {listing.status}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(listing.createdAt)}</td>

                      {/* Verification */}
                      <td className="px-6 py-4 text-center">
                        <select
                          value={listing.verificationStatus}
                          onChange={(e) => handleVerificationChange(listing.id, e.target.value as VerificationStatus)}
                          className="text-xs rounded-md border border-gray-200 px-2 py-1 bg-white"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="VERIFIED">Verified</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {/* View */}
                          <button
                            onClick={() => { setSelectedListing(listing); setIsDrawerOpen(true) }}
                            title="View"
                            className="h-7 px-2.5 rounded-md border border-sky-200 bg-white text-sky-600 shadow-sm hover:bg-sky-50 hover:shadow-md transition-all duration-200 flex items-center justify-center group/view"
                          >
                            <span className="material-symbols-outlined text-[18px] transition-all duration-200 group-hover/view:scale-110" style={{ fontVariationSettings: "'FILL' 0, 'wght' 250, 'GRAD' 0, 'opsz' 24" }}>
                              pageview
                            </span>
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => { setEditListingData(listing); setIsEditModalOpen(true) }}
                            title="Edit"
                            className="h-7 px-2.5 rounded-md border border-gray-200 bg-white text-gray-500 shadow-sm hover:border-[#2eb5c2]/40 hover:text-[#0b5d68] hover:shadow-md transition-all duration-200 flex items-center justify-center group/edit"
                          >
                            <div className="relative w-5 h-5">
                              <span className="absolute left-[1px] top-[3px] w-[13px] h-[15px] rounded-[2px] border-[1.5px] border-current transition-all duration-200 group-hover/edit:-translate-x-[1px]">
                                <span className="absolute left-[3px] top-[4px] w-[6px] h-[1px] bg-current rounded-full" />
                                <span className="absolute left-[3px] top-[8px] w-[8px] h-[1px] bg-current rounded-full" />
                              </span>
                              <span className="absolute right-[-1px] top-[0px] w-[10px] h-[3px] rounded-full bg-current rotate-[-45deg] transition-all duration-200 origin-left group-hover/edit:translate-x-[4px] group-hover/edit:-translate-y-[2px]" />
                            </div>
                          </button>

                          {/* Block toggle */}
                          <button
                            onClick={async () => {
                              const res = await fetch(apiUrl(`/listings/${listing.id}/block`), { method: 'PATCH', headers: authHeaders() })
                              if (res.ok) fetchListings()
                              else alert('Failed to update block status')
                            }}
                            title={listing.isBlocked ? 'Unblock' : 'Block'}
                            className="h-7 px-2.5 rounded-md border border-gray-200 bg-white shadow-sm hover:border-[#2eb5c2]/40 hover:shadow-md transition-all duration-200 flex items-center justify-center"
                          >
                            <div className={`relative w-6 h-3 rounded-full transition-all duration-300 ${listing.isBlocked ? 'bg-[#d55b39]' : 'bg-[#2eb5c2]'}`}>
                              <span className={`absolute top-[1.5px] w-2 h-2 rounded-full bg-white shadow-sm transition-all duration-300 ${listing.isBlocked ? 'left-[2px]' : 'left-[14px]'}`} />
                            </div>
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          {totalCount > 0 && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * rowsPerPage + 1}–{Math.min(currentPage * rowsPerPage, totalCount)} of {totalCount} listings
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Rows:</span>
                    <select
                      value={rowsPerPage}
                      onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1) }}
                      className="border border-gray-200 rounded-md px-2 py-1 text-sm"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                      className="px-3 py-1 text-sm border rounded-md disabled:opacity-40 hover:bg-gray-50 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">{currentPage} / {totalPages || 1}</span>
                    <button
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}
                      className="px-3 py-1 text-sm border rounded-md disabled:opacity-40 hover:bg-gray-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </AdminTable>
      </div>

      <AdminDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); setSelectedListing(null) }}
        data={selectedListing}
        type="listing"
        onAction={handleAction}
      />
      <EditListingModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        listing={editListingData}
        onSave={handleSaveListing}
      />
    </>
  )
}