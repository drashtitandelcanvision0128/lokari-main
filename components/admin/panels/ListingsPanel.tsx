'use client'

import { useState, useEffect } from 'react'
import DashboardLoader from '@/components/ui/DashboardLoader'
import { AdminListing } from '@/types/admin'
// import { mockAdminListings } from '@/data/adminMock's
import { apiUrl, authHeaders } from '@/lib/api'
import { AdminDetailDrawer } from '../AdminDetailDrawer'
import { EditListingModal } from './EditListingModal'

import AdminTable from '@/components/admin/common/AdminTable'

interface ListingsPanelProps {
  searchQuery?: string
}

export function ListingsPanel({ searchQuery = '' }: ListingsPanelProps) {
  // const [listings] = useState<AdminListing[]>(mockAdminListings)
  const [listings, setListings] = useState<AdminListing[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedListing, setSelectedListing] = useState<AdminListing | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editListingData, setEditListingData] = useState<AdminListing | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  // For Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // For sorting
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

  const fetchListings = async () => {
    setLoading(true)
    try {
      const response = await fetch(apiUrl('/listings'))
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
              item.type === 'PRODUCE'
                ? 'produce'
                : item.type === 'WAREHOUSE'
                  ? 'warehouse'
                  : 'transport',
            seller: {
              id: item.user_id,
              name: item.user?.name || 'Unknown User',
              email: item.user?.email || 'N/A',
              location: sellerLocation,
            },
            price: Number(item.price),
            unit:
              item.farmerProduce?.unit ||
              item.transport?.vehicle_type ||
              'unit',
            quantity:
              item.farmerProduce?.quantity ||
              item.warehouse?.capacity ||
              1,
            location: item.listing_location || 'N/A',
            status:
              item.status === 'ACTIVE'
                ? 'active'
                : item.status === 'DRAFT'
                  ? 'draft'
                  : item.status === 'SOLD'
                    ? 'sold'
                    : item.status === 'EXPIRED'
                      ? 'expired'
                      : 'draft',
            isBlocked: item.is_blocked || false,
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
      }
    } catch (error) {
      console.error('Failed to fetch admin listings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchListings()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategory, selectedStatus])

  const handleAction = (action: string, item: any) => {
    if (action === 'block_toggled') {
      fetchListings()
    } else if (action === 'edit') {
      setEditListingData(item)
      setIsEditModalOpen(true)
    } else if (action === 'delete') {
      handleDeleteListing(item.id)
    }
  }

  const handleSaveListing = async (listingId: string, updatedData: any) => {
    try {
      const response = await fetch(apiUrl(`/listings/${listingId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify(updatedData)
      })
      if (response.ok) {
        alert('Listing updated successfully')
        fetchListings()
      } else {
        alert('Failed to update listing')
      }
    } catch (error) {
      console.error('Error updating listing:', error)
      alert('Error updating listing')
    }
  }

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      const response = await fetch(apiUrl(`/listings/${listingId}`), {
        method: 'DELETE',
        headers: authHeaders()
      })
      if (response.ok) {
        alert('Listing deleted successfully')
        fetchListings()
        handleCloseDrawer()
      } else {
        alert('Failed to delete listing')
      }
    } catch (error) {
      console.error('Error deleting listing:', error)
      alert('Error deleting listing')
    }
  }

  const handleViewListing = (listing: AdminListing) => {
    setSelectedListing(listing)
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedListing(null)
  }

  if (loading) {
    return <DashboardLoader />
  }
  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.seller.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || listing.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || listing.status === selectedStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-primary-fixed text-primary'
      case 'pending':
        return 'bg-secondary-fixed text-secondary'
      case 'approved':
        return 'bg-tertiary-fixed text-tertiary'
      case 'rejected':
        return 'bg-error-container text-error'
      case 'flagged':
        return 'bg-error text-on-error'
      case 'expired':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-surface-container text-on-surface-variant'
      case 'draft':
        return 'bg-gray-100 text-gray-700'

      case 'sold':
        return 'bg-green-100 text-green-700'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'produce':
        return 'agriculture'
      case 'warehouse':
        return 'warehouse'
      case 'transport':
        return 'local_shipping'
      default:
        return 'category'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusPriority = (status: string) => {
    const priorities = {
      'pending': 0,
      'flagged': 1,
      'active': 2,
      'approved': 3,
      'rejected': 4,
      'expired': 5
    }
    return priorities[status as keyof typeof priorities] || 999
  }

  // const sortedListings = [...filteredListings].sort((a, b) => {
  //   return getStatusPriority(a.status) - getStatusPriority(b.status)
  // })
  const sortedListings = [...filteredListings].sort((a, b) => {

    if (!sortField) return 0

    let valueA = ''
    let valueB = ''

    if (sortField === 'title') {
      valueA = a.title
      valueB = b.title
    }

    if (sortField === 'seller') {
      valueA = a.seller.name
      valueB = b.seller.name
    }

    if (sortField === 'location') {
      valueA = a.location
      valueB = b.location
    }

    if (sortField === 'quantity') {
      return sortDirection === 'asc'
        ? a.quantity - b.quantity
        : b.quantity - a.quantity
    }

    if (sortField === 'price') {
      return sortDirection === 'asc'
        ? a.price - b.price
        : b.price - a.price
    }

    return sortDirection === 'asc'
      ? valueA.localeCompare(valueB)
      : valueB.localeCompare(valueA)
  })

  const totalPages = Math.ceil(sortedListings.length / rowsPerPage)

  const paginatedListings = sortedListings.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  )


  return (
    <>
      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm
font-medium
text-[#0b5d68] text-on-surface-variant">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-sm border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Categories</option>
              <option value="produce">Produce</option>
              <option value="warehouse">Warehouse</option>
              <option value="transport">Transport</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm
font-medium
text-[#0b5d68] text-on-surface-variant">Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 text-sm border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="flagged">Flagged</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div className="ml-auto text-sm text-on-surface-variant">
            Showing {sortedListings.length} of {listings.length} listings
          </div>
        </div>

        {/* Listings Grid */}
        <AdminTable>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-outline-variant">

              <thead className="bg-gray-50">
                <tr>

                  <th className="px-6 py-3">
                    <button
                      onClick={() => handleSort('title')}
                      className="
      group
      w-full
      inline-flex
      items-center
      justify-center
      gap-2
      text-[13px]
      font-semibold
      tracking-[0.02em]
      text-[#667085]
      transition-colors
      hover:text-[#0b5d68]
    "
                    >
                      Title

                      <span
                        className="
        material-symbols-outlined
        text-[13px]
        text-gray-400
        transition-all
        duration-200
        group-hover:-translate-y-[1px]
        group-hover:text-[#0b5d68]
      "
                      >
                        {sortField === 'title'
                          ? sortDirection === 'asc'
                            ? 'arrow_upward'
                            : 'arrow_downward'
                          : 'unfold_more'}
                      </span>

                    </button>
                  </th>

                  <th className="px-6 py-3">
                    <button
                      onClick={() => handleSort('seller')}
                      className="
      group
      w-full
      inline-flex
      items-center
      justify-center
      gap-2
      text-[13px]
      font-semibold
      tracking-[0.02em]
      text-[#667085]
      transition-colors
      hover:text-[#0b5d68]
    "
                    >
                      Seller

                      <span
                        className="
        material-symbols-outlined
        text-[13px]
        text-gray-400
        transition-all
        duration-200
        group-hover:-translate-y-[1px]
        group-hover:text-[#0b5d68]
      "
                      >
                        {sortField === 'seller'
                          ? sortDirection === 'asc'
                            ? 'arrow_upward'
                            : 'arrow_downward'
                          : 'unfold_more'}
                      </span>

                    </button>
                  </th>
                  <th className="px-6 py-3 text-center text-[13px] font-semibold tracking-[0.02em] text-[#667085]">
                    Category
                  </th>

                  <th className="px-6 py-3">
                    <button
                      onClick={() => handleSort('location')}
                      className="
      group
      w-full
      inline-flex
      items-center
      justify-center
      gap-2
      text-[13px]
      font-semibold
      tracking-[0.02em]
      text-[#667085]
      transition-colors
      hover:text-[#0b5d68]
    "
                    >
                      Location

                      <span
                        className="
        material-symbols-outlined
        text-[13px]
        text-gray-400
        transition-all
        duration-200
        group-hover:-translate-y-[1px]
        group-hover:text-[#0b5d68]
      "
                      >
                        {sortField === 'location'
                          ? sortDirection === 'asc'
                            ? 'arrow_upward'
                            : 'arrow_downward'
                          : 'unfold_more'}
                      </span>

                    </button>
                  </th>

                  <th className="px-6 py-3 text-center text-[13px] font-semibold tracking-[0.02em] text-[#667085]">
                    <button
                      onClick={() => handleSort('quantity')}
                      className="
      group
      inline-flex
      items-center
      gap-2
      text-[13px]
      font-semibold
      text-[#667085]
      transition-colors
      hover:text-[#0b5d68]
    "
                    >
                      Quantity

                      <span
                        className="
        material-symbols-outlined
        text-[13px]
        text-gray-400
        transition-all
        duration-200
        group-hover:-translate-y-[1px]
        group-hover:text-[#0b5d68]
      "
                      >
                        {sortField === 'quantity'
                          ? sortDirection === 'asc'
                            ? 'arrow_upward'
                            : 'arrow_downward'
                          : 'unfold_more'}
                      </span>
                    </button>
                  </th>

                  <th className="px-6 py-3 text-center text-[13px] font-semibold tracking-[0.02em] text-[#667085]">
                    <button
                      onClick={() => handleSort('price')}
                      className="
      group
      inline-flex
      items-center
      gap-2
      text-[13px]
      font-semibold
      text-[#667085]
      transition-colors
      hover:text-[#0b5d68]
    "
                    >
                      Price

                      <span
                        className="
        material-symbols-outlined
        text-[13px]
        text-gray-400
        transition-all
        duration-200
        group-hover:-translate-y-[1px]
        group-hover:text-[#0b5d68]
      "
                      >
                        {sortField === 'price'
                          ? sortDirection === 'asc'
                            ? 'arrow_upward'
                            : 'arrow_downward'
                          : 'unfold_more'}
                      </span>
                    </button>
                  </th>



                  <th className="px-6 py-3 text-center text-[13px] font-semibold tracking-[0.02em] text-[#667085]">
                    Status
                  </th>

                  <th className="px-6 py-3 text-center text-[13px] font-semibold tracking-[0.02em] text-[#667085]">
                    Created
                  </th>

                  <th className="px-6 py-3 text-center text-[13px] font-semibold tracking-[0.02em] text-[#667085]">
                    Actions
                  </th>

                </tr>
              </thead>


              <tbody className="bg-white divide-y divide-gray-200">

                {paginatedListings.map((listing) => (

                  <tr
                    key={listing.id}
                    className="hover:bg-gray-50 transition-colors"
                  >


                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3 max-w-[200px]">

                        {listing.image ? (
                          <img
                            src={listing.image}
                            alt={listing.title}
                            className="h-10 w-10 rounded-lg object-cover bg-gray-100"
                          />
                        ) : (
                          <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-gray-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-gray-500">
                              {getCategoryIcon(listing.category)}
                            </span>
                          </div>
                        )}


                        <div className='min-w-0'>
                          <p className="text-sm
font-medium
text-[#0b5d68] text-gray-900 truncate">
                            {listing.title}
                          </p>

                          <p className="mt-0.5 text-xs text-gray-500 truncate">
                            {listing.description || 'No description available'}
                          </p>

                        </div>

                      </div>

                    </td>



                    <td className="px-6 py-4 text-sm text-gray-600">
                      {listing.seller.name}
                    </td>



                    <td className="px-6 py-4">

                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs produce
→ bg-[#2eb5c2]/10
text-[#2eb5c2]
border border-[#2eb5c2]/20

warehouse
→ amber

transport
→ purple">
                        {listing.category}
                      </span>

                    </td>



                    <td className="px-6 py-4 text-sm text-gray-600">
                      {listing.location}
                    </td>


                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1 rounded bg-gray-100 px-3 py-1">
                        <span className="text-sm font-medium text-[#0b5d68]">
                          {listing.quantity}
                        </span>
                        <span className="text-xs text-gray-500">
                          {listing.unit}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm
font-medium
text-[#0b5d68]">
                      ₹{listing.price}/{listing.unit}
                    </td>


                    <td className="px-6 py-4">

                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs ${getStatusColor(listing.status)}`}>
                        {listing.status}
                      </span>

                    </td>



                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(listing.createdAt)}
                    </td>



                    <td className="px-6 py-4">

                      <div className="flex gap-2">


                        <button
                          onClick={() => handleViewListing(listing)}
                          className="
    h-7
    px-2.5
    rounded-md
    border
    border-sky-200
    bg-white
    text-sky-600
    shadow-sm
    hover:border-sky-300
    hover:bg-sky-50
    hover:text-sky-700
    hover:shadow-md
    transition-all
    duration-200
    flex
    items-center
    justify-center
    group/view
  "
                          title="View"
                        >
                          <span
                            className="
      material-symbols-outlined
      text-[18px]
      transition-all
      duration-200
      group-hover/view:scale-110
      group-hover/view:-translate-y-[1px]
    "
                            style={{
                              fontVariationSettings:
                                "'FILL' 0, 'wght' 250, 'GRAD' 0, 'opsz' 24",
                            }}
                          >
                            pageview
                          </span>
                        </button>



                        <button
                          onClick={() => {
                            setEditListingData(listing)
                            setIsEditModalOpen(true)
                          }}
                          title="Edit"
                          className="
    h-7
    px-2.5
    rounded-md
    border
    border-gray-200
    bg-white
    text-gray-500
    shadow-sm
    hover:border-[#2eb5c2]/40
    hover:text-[#0b5d68]
    hover:shadow-md
    transition-all
    duration-200
    flex
    items-center
    justify-center
    group/edit
  "
                        >
                          <div className="relative w-5 h-5">
                            {/* Paper */}
                            <span
                              className="
        absolute
        left-[1px]
        top-[3px]
        w-[13px]
        h-[15px]
        rounded-[2px]
        border-[1.5px]
        border-current
        transition-all
        duration-200
        group-hover/edit:-translate-x-[1px]
      "
                            >
                              <span
                                className="
          absolute
          left-[3px]
          top-[4px]
          w-[6px]
          h-[1px]
          bg-current
          rounded-full
        "
                              />

                              <span
                                className="
          absolute
          left-[3px]
          top-[8px]
          w-[8px]
          h-[1px]
          bg-current
          rounded-full
        "
                              />
                            </span>

                            {/* Pen */}
                            <span
                              className="
        absolute
        right-[-1px]
        top-[0px]
        w-[10px]
        h-[3px]
        rounded-full
        bg-current
        rotate-[-45deg]
        transition-all
        duration-200
        origin-left
        group-hover/edit:translate-x-[4px]
        group-hover/edit:-translate-y-[2px]
      "
                            />
                          </div>
                        </button>

                        <button
                          onClick={async () => {
                            const response = await fetch(
                              apiUrl(`/listings/${listing.id}/block`),
                              {
                                method: 'PATCH',
                                headers: authHeaders()
                              }
                            )

                            if (response.ok) {
                              fetchListings()
                            } else {
                              alert('Failed to update listing block status')
                            }
                          }}
                          title={listing.isBlocked ? 'Unblock' : 'Block'}
                          className="
    h-7
    px-2.5
    rounded-md
    border
    border-gray-200
    bg-white
    shadow-sm
    hover:border-[#2eb5c2]/40
    hover:shadow-md
    transition-all
    duration-200
    flex
    items-center
    justify-center
  "
                        >
                          <div
                            className={`
      relative
      w-6 h-3
      rounded-full
      transition-all
      duration-300
      ease-in-out
      ${listing.isBlocked
                                ? 'bg-[#d55b39]'
                                : 'bg-[#2eb5c2]'
                              }
    `}
                          >
                            <span
                              className={`
        absolute
        top-[1.5px]
        w-2 h-2
        rounded-full
        bg-white
        shadow-sm
        transition-all
        duration-300
        ease-in-out
        ${listing.isBlocked
                                  ? 'left-[2px]'
                                  : 'left-[14px]'
                                }
      `}
                            />
                          </div>
                        </button>


                      </div>

                    </td>


                  </tr>

                ))}


              </tbody>

            </table>
          </div>


          {/* Footer pagination */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">

              {/* Left */}
              <p className="text-sm text-gray-500">
                Showing{" "}
                {(currentPage - 1) * rowsPerPage + 1}
                {" - "}
                {Math.min(currentPage * rowsPerPage, sortedListings.length)}
                {" of "}
                {sortedListings.length} listings
              </p>


              {/* Right */}
              <div className="flex items-center gap-4">


                {/* Rows dropdown */}
                <div className="flex items-center gap-2 text-sm text-gray-500">

                  <span>Rows:</span>

                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    className="border border-gray-200 rounded-md px-2 py-1 text-sm"
                  >

                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>

                  </select>

                </div>



                {/* Pagination */}
                <div className="flex items-center gap-2">


                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="
            px-3
            py-1
            text-sm
            border
            rounded-md
            disabled:opacity-40
          "
                  >
                    Previous
                  </button>



                  <span className="text-sm text-gray-600">
                    {currentPage} / {totalPages}
                  </span>



                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="
            px-3
            py-1
            text-sm
            border
            rounded-md
            disabled:opacity-40
          "
                  >
                    Next
                  </button>


                </div>


              </div>

            </div>
          </div>



        </AdminTable>

        {/* Empty State */}
        {sortedListings.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-2xl text-on-surface-variant">inventory_2</span>
            </div>
            <h3 className="text-lg font-medium text-on-surface mb-2">No listings found</h3>
            <p className="text-on-surface-variant">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Admin Detail Drawer */}
      <AdminDetailDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        data={selectedListing}
        type="listing"
        onAction={handleAction}
      />

      {/* Edit Listing Modal */}
      <EditListingModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        listing={editListingData}
        onSave={handleSaveListing}
      />
    </>
  )
}
