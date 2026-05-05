'use client'

import { useState } from 'react'
import { AdminListing } from '@/types/admin'
import { mockAdminListings } from '@/data/adminMock'
import { AdminDetailDrawer } from '../AdminDetailDrawer'

interface ListingsPanelProps {
  searchQuery?: string
}

export function ListingsPanel({ searchQuery = '' }: ListingsPanelProps) {
  const [listings] = useState<AdminListing[]>(mockAdminListings)
  const [selectedListing, setSelectedListing] = useState<AdminListing | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const handleViewListing = (listing: AdminListing) => {
    setSelectedListing(listing)
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedListing(null)
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
        return 'bg-surface-container text-on-surface-variant'
      default:
        return 'bg-surface-container text-on-surface-variant'
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

  const sortedListings = [...filteredListings].sort((a, b) => {
    return getStatusPriority(a.status) - getStatusPriority(b.status)
  })

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-on-surface-variant">Category:</label>
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
            <label className="text-sm font-medium text-on-surface-variant">Status:</label>
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
        <div className="grid gap-4">
          {sortedListings.map((listing) => (
            <div key={listing.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden hover:shadow-sm transition-shadow">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Left Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-lg text-on-surface-variant">
                          {getCategoryIcon(listing.category)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-on-surface">{listing.title}</h3>
                        <p className="text-sm text-on-surface-variant">by {listing.seller.name}</p>
                      </div>
                      {listing.featured && (
                        <span className="material-symbols-outlined text-warning">star</span>
                      )}
                    </div>
                    
                    <p className="text-on-surface-variant mb-3 line-clamp-2">{listing.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-container text-on-surface-variant capitalize">
                        {listing.category}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-container text-on-surface-variant">
                        {listing.location}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-container text-on-surface-variant">
                        Available: {listing.quantity} {listing.unit}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-semibold text-primary text-lg">
                        Rs. {listing.price}/{listing.unit}
                      </span>
                      <span className="text-on-surface-variant">
                        {listing.views} views
                      </span>
                      <span className="text-on-surface-variant">
                        {listing.inquiries} inquiries
                      </span>
                      {listing.reports > 0 && (
                        <span className="text-error font-medium">
                          {listing.reports} reports
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Content */}
                  <div className="ml-6 flex flex-col items-end gap-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                      {listing.status}
                    </span>
                    
                    <div className="text-xs text-on-surface-variant text-right">
                      <div>Created {formatDate(listing.createdAt)}</div>
                      <div>Expires {formatDate(listing.expiresAt)}</div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleViewListing(listing)}
                        className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white hover:bg-blue-100 hover:text-blue-900 transition-colors cursor-pointer"
                      >
                        View
                      </button>
                      {listing.status === 'pending' && (
                        <>
                          <button className="px-3 py-1.5 text-xs font-medium bg-purple-600 text-white hover:bg-purple-100 hover:text-purple-900 transition-colors cursor-pointer">
                            Approve
                          </button>
                          <button className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-100 hover:text-red-900 transition-colors cursor-pointer">
                            Reject
                          </button>
                        </>
                      )}
                      {listing.status === 'flagged' && (
                        <button className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white hover:bg-green-100 hover:text-green-900 transition-colors cursor-pointer">
                          Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

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
      />
    </>
  )
}
