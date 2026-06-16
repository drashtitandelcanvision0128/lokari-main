'use client'

import { useEffect, useRef } from 'react'
import { AdminUser, AdminListing, AdminOrder, AdminDispute, AuditLogEntry } from '@/types/admin'

type DetailType = 'user' | 'listing' | 'order' | 'dispute' | 'auditLog'

interface AdminDetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  data: AdminUser | AdminListing | AdminOrder | AdminDispute | AuditLogEntry | null
  type: DetailType
  onAction?: (action: string, item: any) => void
}

export function AdminDetailDrawer({ isOpen, onClose, data, type, onAction }: AdminDetailDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Close on outside click
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
      onClose()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string, type: string) => {
    const baseColors = {
      active: 'bg-[#2eb5c2] text-white',
      inactive: 'bg-[#0b5d68] text-white',
      pending: 'bg-[#e89151] text-white',
      completed: 'bg-[#2eb5c2] text-white',
      cancelled: 'bg-[#d55b39] text-white',
      rejected: 'bg-[#d55b39] text-white',
      approved: 'bg-[#2eb5c2] text-white',
      flagged: 'bg-[#e89151] text-white',
      resolved: 'bg-[#2eb5c2] text-white',
      open: 'bg-[#0b5d68] text-white',
      investigating: 'bg-[#e89151] text-white',
      paid: 'bg-[#2eb5c2] text-white',
      unpaid: 'bg-[#d55b39] text-white',
      verified: 'bg-[#2eb5c2] text-white',
      unverified: 'bg-[#e89151] text-white'
    }
    return baseColors[status as keyof typeof baseColors] || 'bg-[#f9f9f7] text-[#0b5d68]'
  }

  const renderUserDetails = (user: AdminUser) => (
    <div className="space-y-8">
      {/* Enhanced Header Info */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl"></div>
        <div className="relative flex items-center gap-6 p-6 bg-surface-container-high rounded-3xl border border-outline/20">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-[#2eb5c2] to-[#2eb5c2]/80 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-2xl font-bold text-white">
                {user.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 ${user.status === 'active' ? 'bg-[#2eb5c2]' : 'bg-[#0b5d68]/50'} rounded-full border-4 border-[#f9f9f7]`}></div>
          </div>
          <div className="flex-1">
            <div className="mb-3">
              <h3 className="text-2xl font-bold text-[#0b5d68] font-headline tracking-tight">{user.name}</h3>
              <p className="text-sm text-[#0b5d68]/70 font-medium mt-1">{user.email}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-semibold ${getStatusColor(user.verificationStatus, 'user')} shadow-sm`}>
                <span className="material-symbols-outlined text-sm mr-1">
                  {user.verificationStatus === 'verified' ? 'verified_user' : 'pending_actions'}
                </span>
                <span className="capitalize">{user.verificationStatus}</span>
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-semibold bg-[#f9f9f7] border border-[#0b5d68]/20 text-[#0b5d68] shadow-sm">
                <span className="material-symbols-outlined text-sm mr-1">badge</span>
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Main Details */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-[#f9f9f7] to-[#f9f9f7]/50 rounded-2xl p-6 border border-[#0b5d68]/20 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#2eb5c2]/10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-lg text-[#2eb5c2]">analytics</span>
              </div>
              <h4 className="text-lg font-semibold text-[#0b5d68] font-headline">Performance</h4>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#f9f9f7] rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-[#0b5d68]/70">inventory_2</span>
                  <span className="text-sm font-medium text-[#0b5d68]/70">Listings</span>
                </div>
                <span className="text-lg font-bold text-[#2eb5c2]">{user.listings}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#f9f9f7] rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-[#0b5d68]/70">shopping_cart</span>
                  <span className="text-sm font-medium text-[#0b5d68]/70">Orders</span>
                </div>
                <span className="text-lg font-bold text-[#2eb5c2]">{user.orders}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#f9f9f7] rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-[#0b5d68]/70">payments</span>
                  <span className="text-sm font-medium text-[#0b5d68]/70">Revenue</span>
                </div>
                <span className="text-lg font-bold text-[#e89151]">{user.revenue}</span>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-surface-container to-surface-container-high rounded-2xl p-6 border border-outline/20 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-lg text-secondary">contact_mail</span>
              </div>
              <h4 className="text-lg font-semibold text-on-surface font-headline">Contact</h4>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-surface rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">phone</span>
                  <span className="text-sm font-medium text-on-surface-variant">Phone</span>
                </div>
                <span className="text-sm text-on-surface">{user.phone}</span>
              </div>
              <div className="p-3 bg-surface rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">location_on</span>
                  <span className="text-sm font-medium text-on-surface-variant">Location</span>
                </div>
                <span className="text-sm text-on-surface">{user.location}</span>
              </div>
              <div className="p-3 bg-surface rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">calendar_today</span>
                  <span className="text-sm font-medium text-on-surface-variant">Joined</span>
                </div>
                <span className="text-sm text-on-surface">{formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Meta Info */}
      <div className="bg-gradient-to-br from-surface-container to-surface-container-high rounded-2xl p-6 border border-outline/20 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-tertiary/10 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-lg text-tertiary">info</span>
          </div>
          <h4 className="text-lg font-semibold text-on-surface font-headline">Meta Information</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-surface rounded-xl">
            <span className="text-sm font-medium text-on-surface-variant">User ID</span>
            <span className="text-sm font-mono text-on-surface font-semibold">{user.id}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-surface rounded-xl">
            <span className="text-sm font-medium text-on-surface-variant">Last Active</span>
            <span className="text-sm text-on-surface">{formatDate(user.lastActive)}</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderListingDetails = (listing: AdminListing) => (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="pb-4 border-b border-outline">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-lg text-on-surface-variant">
              {listing.category === 'produce' ? 'agriculture' : listing.category === 'warehouse' ? 'warehouse' : 'local_shipping'}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-on-surface font-headline">{listing.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(listing.status, 'listing')}`}>
                {listing.status}
              </span>
              {listing.featured && (
                <span className="material-symbols-outlined text-warning text-sm">star</span>
              )}
            </div>
          </div>
        </div>
        <p className="text-on-surface-variant">{listing.description}</p>
      </div>

      {/* Main Details */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container rounded-lg p-4">
            <h4 className="text-sm font-medium text-on-surface-variant mb-2">Listing Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-on-surface-variant">Category</span>
                <span className="text-sm text-on-surface capitalize">{listing.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-on-surface-variant">Price</span>
                <span className="text-sm font-medium text-primary">${listing.price}/{listing.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-on-surface-variant">Quantity</span>
                <span className="text-sm text-on-surface">{listing.quantity} {listing.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-on-surface-variant">Location</span>
                <span className="text-sm text-on-surface">{listing.location}</span>
              </div>
            </div>
          </div>
          <div className="bg-surface-container rounded-lg p-4">
            <h4 className="text-sm font-medium text-on-surface-variant mb-2">Performance</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-on-surface-variant">Views</span>
                <span className="text-sm font-medium text-on-surface">{listing.views}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-on-surface-variant">Inquiries</span>
                <span className="text-sm font-medium text-on-surface">{listing.inquiries}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-on-surface-variant">Reports</span>
                <span className={`text-sm font-medium ${listing.reports > 0 ? 'text-error' : 'text-on-surface'}`}>
                  {listing.reports}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seller Info */}
      <div className="bg-surface-container rounded-lg p-4">
        <h4 className="text-sm font-medium text-on-surface-variant mb-2">Seller Information</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Name</span>
            <span className="text-on-surface">{listing.seller.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Email</span>
            <span className="text-on-surface">{listing.seller.email}</span>
          </div>
          {/* <div className="flex justify-between">
            <span className="text-on-surface-variant">Location</span>
            <span className="text-on-surface">{listing.seller.location || 'N/A'}</span>
          </div> */}
        </div>
      </div>

      {/* Meta Info */}
      <div className="bg-surface-container rounded-lg p-4">
        <h4 className="text-sm font-medium text-on-surface-variant mb-2">Meta Information</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Listing ID</span>
            <span className="font-mono text-on-surface">{listing.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Created</span>
            <span className="text-on-surface">{formatDate(listing.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Expires</span>
            <span className="text-on-surface">{formatDate(listing.expiresAt)}</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderOrderDetails = (order: AdminOrder) => (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="pb-4 border-b border-outline">
        <h3 className="text-xl font-semibold text-on-surface font-headline mb-2">{order.id}</h3>
        <p className="text-on-surface-variant">{order.listingTitle}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status, 'order')}`}>
            {order.status}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.paymentStatus, 'order')}`}>
            {order.paymentStatus.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Main Details */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container rounded-lg p-4">
            <h4 className="text-sm font-medium text-on-surface-variant mb-2">Order Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-on-surface-variant">Quantity</span>
                <span className="text-sm text-on-surface">{order.quantity} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-on-surface-variant">Unit Price</span>
                <span className="text-sm text-on-surface">${order.unitPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-on-surface-variant">Total Amount</span>
                <span className="text-sm font-medium text-primary">${order.totalAmount.toFixed(2)}</span>
              </div>
              {order.trackingNumber && (
                <div className="flex justify-between">
                  <span className="text-sm text-on-surface-variant">Tracking</span>
                  <span className="text-sm text-on-surface">{order.trackingNumber}</span>
                </div>
              )}
            </div>
          </div>
          <div className="bg-surface-container rounded-lg p-4">
            <h4 className="text-sm font-medium text-on-surface-variant mb-2">Participants</h4>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-on-surface-variant">Buyer</span>
                <div className="text-sm text-on-surface">{order.buyer.name}</div>
                <div className="text-xs text-on-surface-variant">{order.buyer.email}</div>
              </div>
              <div>
                <span className="text-sm text-on-surface-variant">Seller</span>
                <div className="text-sm text-on-surface">{order.seller.name}</div>
                <div className="text-xs text-on-surface-variant">{order.seller.email}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meta Info */}
      <div className="bg-surface-container rounded-lg p-4">
        <h4 className="text-sm font-medium text-on-surface-variant mb-2">Meta Information</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Order ID</span>
            <span className="font-mono text-on-surface">{order.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Created</span>
            <span className="text-on-surface">{formatDate(order.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Updated</span>
            <span className="text-on-surface">{formatDate(order.updatedAt)}</span>
          </div>
          {order.deliveryDate && (
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Delivery Date</span>
              <span className="text-on-surface">{formatDate(order.deliveryDate)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderDisputeDetails = (dispute: AdminDispute) => (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="pb-4 border-b border-outline">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-lg text-on-surface-variant">gavel</span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-on-surface font-headline">{dispute.id}</h3>
            <p className="text-on-surface-variant">{dispute.orderTitle}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(dispute.status, 'dispute')}`}>
                {dispute.status}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(dispute.priority, 'dispute')}`}>
                {dispute.priority}
              </span>
            </div>
          </div>
        </div>
        <p className="text-on-surface-variant">{dispute.description}</p>
      </div>

      {/* Main Details */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container rounded-lg p-4">
            <h4 className="text-sm font-medium text-on-surface-variant mb-2">Dispute Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-on-surface-variant">Type</span>
                <span className="text-sm text-on-surface capitalize">{dispute.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-on-surface-variant">Priority</span>
                <span className="text-sm text-on-surface capitalize">{dispute.priority}</span>
              </div>
              {dispute.assignedTo && (
                <div className="flex justify-between">
                  <span className="text-sm text-on-surface-variant">Assigned To</span>
                  <span className="text-sm text-on-surface">{dispute.assignedTo}</span>
                </div>
              )}
            </div>
          </div>
          <div className="bg-surface-container rounded-lg p-4">
            <h4 className="text-sm font-medium text-on-surface-variant mb-2">Participants</h4>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-on-surface-variant">Raised By</span>
                <div className="text-sm text-on-surface">{dispute.raisedBy.name}</div>
                <div className="text-xs text-on-surface-variant">{dispute.raisedBy.email} ({dispute.raisedBy.role})</div>
              </div>
              <div>
                <span className="text-sm text-on-surface-variant">Against</span>
                <div className="text-sm text-on-surface">{dispute.against.name}</div>
                <div className="text-xs text-on-surface-variant">{dispute.against.email} ({dispute.against.role})</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Evidence */}
      {dispute.evidence.length > 0 && (
        <div className="bg-surface-container rounded-lg p-4">
          <h4 className="text-sm font-medium text-on-surface-variant mb-2">Evidence ({dispute.evidence.length} files)</h4>
          <div className="space-y-2">
            {dispute.evidence.map((evidence, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-surface rounded-lg">
                <span className="text-sm text-on-surface">📎 {evidence.split('/').pop()}</span>
                <button className="text-xs text-primary hover:text-primary-container">Download</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolution */}
      {dispute.resolution && (
        <div className="bg-tertiary-container rounded-lg p-4">
          <h4 className="text-sm font-medium text-tertiary mb-2">Resolution</h4>
          <p className="text-sm text-on-tertiary mb-2">{dispute.resolution}</p>
          <div className="text-xs text-tertiary-variant">
            Resolved on: {formatDate(dispute.resolvedAt!)}
          </div>
        </div>
      )}

      {/* Meta Info */}
      <div className="bg-surface-container rounded-lg p-4">
        <h4 className="text-sm font-medium text-on-surface-variant mb-2">Meta Information</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Dispute ID</span>
            <span className="font-mono text-on-surface">{dispute.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Created</span>
            <span className="text-on-surface">{formatDate(dispute.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Updated</span>
            <span className="text-on-surface">{formatDate(dispute.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderActions = () => {
    if (!data) return null

    const baseActions = [
      { label: 'Edit', color: 'bg-[#e89151] hover:bg-[#d55b39] text-white hover:shadow-md transition-all duration-200', actionType: 'edit' },
      { label: 'Delete', color: 'border border-[#d55b39] text-[#d55b39] hover:bg-[#d55b39] hover:text-white transition-all duration-200', actionType: 'delete' }
    ]

    let specificActions: any[] = []

    switch (type) {
      case 'user':
        const user = data as AdminUser
        specificActions = user.status === 'active'
          ? [{ label: 'Ban', color: 'bg-[#d55b39] hover:bg-[#b84630] text-white hover:shadow-md transition-all duration-200', actionType: 'toggle_ban' }]
          : [{ label: 'Unban', color: 'bg-[#2eb5c2] hover:bg-[#0b5d68] text-white hover:shadow-md transition-all duration-200', actionType: 'toggle_ban' }]

        // Add verification button
        if (user.verificationStatus === 'verified') {
          specificActions.push({ label: 'Unverify', color: 'bg-[#e89151] hover:bg-[#d55b39] text-white hover:shadow-md transition-all duration-200', actionType: 'toggle_verify' })
        } else {
          specificActions.push({ label: 'Verify User', color: 'bg-[#2eb5c2] hover:bg-[#0b5d68] text-white hover:shadow-md transition-all duration-200', actionType: 'toggle_verify' })
        }
        break
      case 'listing':
        const listing = data as AdminListing
        specificActions = listing.status === 'pending'
          ? [
            { label: 'Approve', color: 'bg-[#2eb5c2] hover:bg-[#0b5d68] text-white hover:shadow-md transition-all duration-200 cursor-pointer' },
            { label: 'Reject', color: 'bg-[#d55b39] hover:bg-[#b84630] text-white hover:shadow-md transition-all duration-200 cursor-pointer' },
            { label: 'Flag', color: 'bg-[#d55b39] hover:bg-[#b84630] text-white hover:shadow-md transition-all duration-200 cursor-pointer' }
          ]
          : [{ label: 'Flag', color: 'bg-[#d55b39] hover:bg-[#b84630] text-white hover:shadow-md transition-all duration-200 cursor-pointer' }]
        break
      case 'order':
        const order = data as AdminOrder
        specificActions = order.status === 'disputed'
          ? [{ label: 'Resolve Dispute', color: 'bg-[#2eb5c2] hover:bg-[#0b5d68] text-white hover:shadow-md transition-all duration-200' }]
          : []
        break
      case 'dispute':
        const dispute = data as AdminDispute
        specificActions = dispute.status === 'open'
          ? [
            { label: 'Start Investigation', color: 'bg-[#2eb5c2] hover:bg-[#0b5d68] text-white hover:shadow-md transition-all duration-200' },
            { label: 'Escalate', color: 'bg-[#d55b39] hover:bg-[#b84630] text-white hover:shadow-md transition-all duration-200' }
          ]
          : dispute.status === 'investigating'
            ? [{ label: 'Resolve', color: 'bg-[#2eb5c2] hover:bg-[#0b5d68] text-white hover:shadow-md transition-all duration-200' }]
            : []
        break
    }

    const allActions = [...specificActions, ...baseActions]

    return (
      <div className="p-6">
        <div className="mb-4">
          <h4 className="text-sm font-medium text-[#0b5d68] mb-1">Actions</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {allActions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                if (action.actionType && onAction) {
                  onAction(action.actionType, data)
                }
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg cursor-pointer ${action.color}`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const renderAuditLogDetails = (log: AuditLogEntry) => (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="pb-4 border-b border-outline">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-lg text-on-surface-variant">
              {getCategoryIcon(log.category)}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-on-surface font-headline">{log.action}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.severity, 'auditLog')}`}>
                {log.severity}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-container text-on-surface-variant">
                {log.category}
              </span>
            </div>
          </div>
        </div>
        <p className="text-on-surface-variant">{log.details}</p>
      </div>

      {/* Main Details */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container rounded-lg p-4">
            <h4 className="text-sm font-medium text-on-surface-variant mb-2">Event Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-on-surface-variant">Category</span>
                <span className="text-sm text-on-surface capitalize">{log.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-on-surface-variant">Severity</span>
                <span className="text-sm text-on-surface capitalize">{log.severity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-on-surface-variant">Resource</span>
                <span className="text-sm text-on-surface">{log.resource}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-on-surface-variant">Resource ID</span>
                <span className="text-sm text-on-surface">{log.resourceId}</span>
              </div>
            </div>
          </div>
          <div className="bg-surface-container rounded-lg p-4">
            <h4 className="text-sm font-medium text-on-surface-variant mb-2">User Information</h4>
            <div className="space-y-2">
              {log.userName && (
                <div className="flex justify-between">
                  <span className="text-sm text-on-surface-variant">User</span>
                  <span className="text-sm text-on-surface">{log.userName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-on-surface-variant">IP Address</span>
                <span className="text-sm text-on-surface">{log.ipAddress}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meta Info */}
      <div className="bg-surface-container rounded-lg p-4">
        <h4 className="text-sm font-medium text-on-surface-variant mb-2">Meta Information</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Log ID</span>
            <span className="font-mono text-on-surface">{log.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Timestamp</span>
            <span className="text-on-surface">{formatDate(log.timestamp)}</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    if (!data) return null

    switch (type) {
      case 'user':
        return renderUserDetails(data as AdminUser)
      case 'listing':
        return renderListingDetails(data as AdminListing)
      case 'order':
        return renderOrderDetails(data as AdminOrder)
      case 'dispute':
        return renderDisputeDetails(data as AdminDispute)
      case 'auditLog':
        return renderAuditLogDetails(data as AuditLogEntry)
      default:
        return null
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'error'
      case 'error':
        return 'error_outline'
      case 'warning':
        return 'warning'
      case 'info':
        return 'info'
      default:
        return 'info'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'user':
        return 'person'
      case 'listing':
        return 'inventory_2'
      case 'order':
        return 'shopping_cart'
      case 'payment':
        return 'payments'
      case 'system':
        return 'settings'
      case 'security':
        return 'security'
      default:
        return 'info'
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex"
      onClick={handleOverlayClick}
    >
      {/* Enhanced Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>

      {/* Premium Drawer */}
      <div
        ref={drawerRef}
        className={`absolute right-0 top-0 h-full w-full max-w-2xl bg-[#f9f9f7] shadow-2xl transform transition-all duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Enhanced Header */}
        <div className="relative bg-gradient-to-r from-[#2eb5c2]/10 to-transparent border-b border-[#0b5d68]/20">
          <div className="relative flex items-center justify-between p-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#2eb5c2] to-[#2eb5c2]/80 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-xl text-white">
                    {type === 'user' ? 'person' : type === 'listing' ? 'inventory_2' : type === 'order' ? 'shopping_cart' : type === 'dispute' ? 'gavel' : 'history'}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#0b5d68] font-headline tracking-tight">
                    {type.charAt(0).toUpperCase() + type.slice(1)} Details
                  </h2>
                  <p className="text-sm text-[#0b5d68]/70 font-medium mt-1">
                    Comprehensive information and management options
                  </p>
                </div>
              </div>
              {data && (
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f9f9f7] rounded-xl border border-[#0b5d68]/20">
                    <span className="material-symbols-outlined text-sm text-[#0b5d68]/70">tag</span>
                    <span className="text-sm font-mono text-[#0b5d68] font-semibold">{(data as any).id}</span>
                  </div>
                  {type === 'user' && (
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-semibold ${getStatusColor((data as AdminUser).status, 'user')} shadow-sm`}>
                      {(data as AdminUser).status}
                    </span>
                  )}
                  {type === 'listing' && (
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-semibold ${getStatusColor((data as AdminListing).status, 'listing')} shadow-sm`}>
                      {(data as AdminListing).status}
                    </span>
                  )}
                  {type === 'order' && (
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-semibold ${getStatusColor((data as AdminOrder).status, 'order')} shadow-sm`}>
                      {(data as AdminOrder).status}
                    </span>
                  )}
                  {type === 'dispute' && (
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-semibold ${getStatusColor((data as AdminDispute).status, 'dispute')} shadow-sm`}>
                      {(data as AdminDispute).status}
                    </span>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-3 text-[#0b5d68]/70 hover:text-[#0b5d68] hover:bg-[#f9f9f7] rounded-xl transition-all duration-200 hover:scale-105 shadow-sm"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Enhanced Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-8">
            {renderContent()}
          </div>
        </div>

        {/* Enhanced Actions */}
        <div className="border-t border-[#0b5d68]/20 bg-[#f9f9f7]/50">
          {renderActions()}
        </div>
      </div>
    </div>
  )
}
