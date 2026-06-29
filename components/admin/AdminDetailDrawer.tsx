'use client'

import { useEffect, useRef } from 'react'
import { AdminUser, AdminListing, AdminOrder, AdminDispute, AuditLogEntry } from '@/types/admin'
import { apiUrl, authHeaders } from '@/lib/api'

type DetailType = 'user' | 'listing' | 'order' | 'dispute' | 'auditLog'

interface AdminDetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  data: AdminUser | AdminListing | AdminOrder | AdminDispute | AuditLogEntry | null
  type: DetailType
  onAction?: (action: string, item: any) => void
}

// ─── Design atoms ─────────────────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-[#2eb5c2]" style={{ fontSize: '15px' }}>{icon}</span>
        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#0b5d68]/50">{title}</span>
      </div>
      <div className="border border-[#e8ecee] rounded-lg overflow-hidden">
        {children}
      </div>
    </div>
  )
}

function Row({ label, value, mono = false, accent = false }: {
  label: string
  value: React.ReactNode
  mono?: boolean
  accent?: boolean
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-l-2 border-l-transparent hover:border-l-[#2eb5c2] hover:bg-[#f7fafb] transition-all duration-150 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-b-[#f0f3f4]">
      <span className="text-xs text-[#667085] font-medium">{label}</span>
      <span className={`text-xs font-semibold ${accent ? 'text-[#2eb5c2]' : 'text-[#1a2332]'} ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  )
}

function StatusPill({ status, variant = 'default' }: { status: string; variant?: 'green' | 'red' | 'amber' | 'blue' | 'default' }) {
  const styles = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-[#2eb5c2]/10 text-[#0b5d68] border-[#2eb5c2]/30',
    default: 'bg-gray-50 text-gray-600 border-gray-200',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${styles[variant]} capitalize`}>
      {status}
    </span>
  )
}

function getStatusVariant(status: string): 'green' | 'red' | 'amber' | 'blue' | 'default' {
  const s = status.toLowerCase()
  if (['active', 'verified', 'approved', 'resolved', 'completed', 'paid'].includes(s)) return 'green'
  if (['banned', 'blocked', 'rejected', 'cancelled', 'expired'].includes(s)) return 'red'
  if (['pending', 'investigating', 'flagged', 'unpaid'].includes(s)) return 'amber'
  if (['draft', 'inactive', 'unverified', 'open'].includes(s)) return 'blue'
  return 'default'
}

// ─── Type icons ───────────────────────────────────────────────────────────────

function typeIcon(type: DetailType) {
  const map: Record<DetailType, string> = {
    user: 'person',
    listing: 'inventory_2',
    order: 'shopping_bag',
    dispute: 'gavel',
    auditLog: 'history',
  }
  return map[type]
}

function categoryIcon(category: string) {
  const map: Record<string, string> = {
    produce: 'agriculture',
    warehouse: 'warehouse',
    transport: 'local_shipping',
    user: 'person',
    listing: 'inventory_2',
    order: 'shopping_cart',
    payment: 'payments',
    system: 'settings',
    security: 'security',
  }
  return map[category] || 'category'
}

// ─── Section renderers ────────────────────────────────────────────────────────

function UserDetails({ user, formatDate }: { user: AdminUser; formatDate: (d: string) => string }) {
  const initials = user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)
  return (
    <div className="space-y-6">
      {/* Identity card */}
      <div className="flex items-center gap-4 p-5 bg-[#f7fafb] border border-[#e8ecee] rounded-lg">
        {/* <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2] flex items-center justify-center shrink-0 shadow-sm">
          <span className="text-lg font-bold text-white tracking-tight">{initials}</span>
        </div> */}
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-14 h-14 rounded-lg object-cover shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2] flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-lg font-bold text-white tracking-tight">
              {initials}
            </span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-[#0b5d68] truncate">{user.name}</p>
          <p className="text-xs text-[#667085] truncate mt-0.5">{user.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <StatusPill status={user.verificationStatus} variant={getStatusVariant(user.verificationStatus)} />
            <StatusPill status={user.role} variant="default" />
          </div>
        </div>
      </div>

      {/* Performance */}
      <Section title="Performance" icon="analytics">
        <Row label="Listings" value={user.listings} accent />
        <Row label="Orders" value={user.orders} accent />
        <Row label="Revenue" value={user.revenue} accent />
      </Section>

      {/* Contact */}
      <Section title="Contact" icon="contact_mail">
        <Row label="Phone" value={user.phone} />
        <Row label="Location" value={user.location} />
        <Row label="Joined" value={formatDate(user.createdAt)} />
        <Row label="Last active" value={formatDate(user.lastActive)} />
      </Section>

      {/* Meta */}
      <Section title="Meta" icon="tag">
        <Row label="User ID" value={user.id} mono />
        <Row label="Status" value={<StatusPill status={user.status} variant={getStatusVariant(user.status)} />} />
      </Section>
    </div>
  )
}

function ListingDetails({ listing, formatDate }: { listing: AdminListing; formatDate: (d: string) => string }) {
  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="flex items-start gap-4 p-5 bg-[#f7fafb] border border-[#e8ecee] rounded-lg">
        {listing.image ? (
          <img src={listing.image} alt={listing.title} className="w-14 h-14 rounded-lg object-cover shrink-0 bg-gray-100" />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2] flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-white" style={{ fontSize: '22px' }}>{categoryIcon(listing.category)}</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-[#0b5d68] leading-tight">{listing.title}</p>
          <p className="text-xs text-[#667085] mt-1 line-clamp-2">{listing.description || 'No description'}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <StatusPill status={listing.status} variant={getStatusVariant(listing.status)} />
            {listing.isBlocked && <StatusPill status="Blocked" variant="red" />}
            <StatusPill status={listing.category} variant="blue" />
          </div>
        </div>
      </div>

      {/* Listing details */}
      <Section title="Details" icon="info">
        <Row label="Price" value={`₹${listing.price} / ${listing.unit}`} accent />
        <Row label="Quantity" value={`${listing.quantity} ${listing.unit}`} />
        <Row label="Location" value={listing.location} />
        <Row label="Verification" value={<StatusPill status={listing.verificationStatus || 'PENDING'} variant={getStatusVariant(listing.verificationStatus || 'PENDING')} />} />
      </Section>

      {/* Performance */}
      <Section title="Performance" icon="analytics">
        <Row label="Views" value={listing.views} />
        <Row label="Inquiries" value={listing.inquiries} />
        <Row label="Reports" value={
          <span className={listing.reports > 0 ? 'text-red-600 font-semibold text-xs' : 'text-xs font-semibold text-[#1a2332]'}>
            {listing.reports}
          </span>
        } />
      </Section>

      {/* Seller */}
      <Section title="Seller" icon="person">
        <Row label="Name" value={listing.seller.name} />
        <Row label="Email" value={listing.seller.email} />
      </Section>

      {/* Meta */}
      <Section title="Meta" icon="tag">
        <Row label="Listing ID" value={listing.id} mono />
        <Row label="Created" value={formatDate(listing.createdAt)} />
        <Row label="Expires" value={formatDate(listing.expiresAt)} />
      </Section>
    </div>
  )
}

function OrderDetails({ order, data, formatDate }: { order: AdminOrder; data: any; formatDate: (d: string) => string }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 bg-[#f7fafb] border border-[#e8ecee] rounded-lg">
        <p className="text-xs text-[#667085] font-medium mb-1">Order</p>
        <p className="text-base font-bold text-[#0b5d68]">{order.id}</p>
        <p className="text-xs text-[#667085] mt-1">{order.listingTitle}</p>
        <div className="flex items-center gap-2 mt-3">
          <StatusPill status={order.status} variant={getStatusVariant(order.status)} />
          <StatusPill status={order.paymentStatus.replace('_', ' ')} variant={getStatusVariant(order.paymentStatus)} />
          {data.isBlocked && <StatusPill status="Blocked" variant="red" />}
        </div>
      </div>

      {/* Order details */}
      <Section title="Order" icon="shopping_bag">
        <Row label="Quantity" value={`${order.quantity} units`} />
        <Row label="Unit price" value={`$${order.unitPrice.toFixed(2)}`} />
        <Row label="Total" value={`$${order.totalAmount.toFixed(2)}`} accent />
        {order.trackingNumber && <Row label="Tracking" value={order.trackingNumber} mono />}
      </Section>

      {/* Participants */}
      <Section title="Buyer" icon="person">
        <Row label="Name" value={order.buyer.name} />
        <Row label="Email" value={order.buyer.email} />
      </Section>

      <Section title="Seller" icon="storefront">
        <Row label="Name" value={order.seller.name} />
        <Row label="Email" value={order.seller.email} />
      </Section>

      {/* Meta */}
      <Section title="Meta" icon="tag">
        <Row label="Order ID" value={order.id} mono />
        <Row label="Created" value={formatDate(order.createdAt)} />
        <Row label="Updated" value={formatDate(order.updatedAt)} />
        {order.deliveryDate && <Row label="Delivery" value={formatDate(order.deliveryDate)} />}
      </Section>
    </div>
  )
}

function DisputeDetails({ dispute, formatDate }: { dispute: AdminDispute; formatDate: (d: string) => string }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 bg-[#f7fafb] border border-[#e8ecee] rounded-lg">
        <p className="text-xs text-[#667085] font-medium mb-1">Dispute</p>
        <p className="text-base font-bold text-[#0b5d68]">{dispute.id}</p>
        <p className="text-xs text-[#667085] mt-1">{dispute.orderTitle}</p>
        <p className="text-xs text-[#667085] mt-2 leading-relaxed">{dispute.description}</p>
        <div className="flex items-center gap-2 mt-3">
          <StatusPill status={dispute.status} variant={getStatusVariant(dispute.status)} />
          <StatusPill status={dispute.priority} variant={getStatusVariant(dispute.priority)} />
        </div>
      </div>

      {/* Details */}
      <Section title="Details" icon="info">
        <Row label="Type" value={dispute.type} />
        <Row label="Priority" value={dispute.priority} />
        {dispute.assignedTo && <Row label="Assigned to" value={dispute.assignedTo} />}
      </Section>

      {/* Raised by */}
      <Section title="Raised by" icon="person">
        <Row label="Name" value={dispute.raisedBy.name} />
        <Row label="Email" value={dispute.raisedBy.email} />
        <Row label="Role" value={dispute.raisedBy.role} />
      </Section>

      {/* Against */}
      <Section title="Against" icon="person_off">
        <Row label="Name" value={dispute.against.name} />
        <Row label="Email" value={dispute.against.email} />
        <Row label="Role" value={dispute.against.role} />
      </Section>

      {/* Evidence */}
      {dispute.evidence.length > 0 && (
        <Section title={`Evidence (${dispute.evidence.length})`} icon="attach_file">
          {dispute.evidence.map((e, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-b-[#f0f3f4] hover:bg-[#f7fafb] transition-colors">
              <span className="text-xs text-[#667085] truncate">{e.split('/').pop()}</span>
              <button className="text-[11px] font-semibold text-[#2eb5c2] hover:text-[#0b5d68] transition-colors ml-4 shrink-0">Download</button>
            </div>
          ))}
        </Section>
      )}

      {/* Resolution */}
      {dispute.resolution && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-600 mb-2">Resolution</p>
          <p className="text-xs text-emerald-800 leading-relaxed">{dispute.resolution}</p>
          <p className="text-[11px] text-emerald-600 mt-2">Resolved {formatDate(dispute.resolvedAt!)}</p>
        </div>
      )}

      {/* Meta */}
      <Section title="Meta" icon="tag">
        <Row label="Dispute ID" value={dispute.id} mono />
        <Row label="Created" value={formatDate(dispute.createdAt)} />
        <Row label="Updated" value={formatDate(dispute.updatedAt)} />
      </Section>
    </div>
  )
}

function AuditLogDetails({ log, formatDate }: { log: AuditLogEntry; formatDate: (d: string) => string }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 bg-[#f7fafb] border border-[#e8ecee] rounded-lg">
        <p className="text-xs text-[#667085] font-medium mb-1">Audit event</p>
        <p className="text-base font-bold text-[#0b5d68]">{log.action}</p>
        <p className="text-xs text-[#667085] mt-2 leading-relaxed">{log.details}</p>
        <div className="flex items-center gap-2 mt-3">
          <StatusPill status={log.severity} variant={getStatusVariant(log.severity)} />
          <StatusPill status={log.category} variant="default" />
        </div>
      </div>

      {/* Event */}
      <Section title="Event" icon="info">
        <Row label="Category" value={log.category} />
        <Row label="Severity" value={log.severity} />
        <Row label="Resource" value={log.resource} />
        <Row label="Resource ID" value={log.resourceId} mono />
      </Section>

      {/* User */}
      <Section title="Actor" icon="person">
        {log.userName && <Row label="Name" value={log.userName} />}
        <Row label="IP address" value={log.ipAddress} mono />
      </Section>

      {/* Meta */}
      <Section title="Meta" icon="tag">
        <Row label="Log ID" value={log.id} mono />
        <Row label="Timestamp" value={formatDate(log.timestamp)} />
      </Section>
    </div>
  )
}

// ─── Actions ──────────────────────────────────────────────────────────────────

function ActionButton({
  label,
  variant,
  onClick,
}: {
  label: string
  variant: 'primary' | 'danger' | 'ghost'
  onClick?: () => void
}) {
  const styles = {
    primary: 'bg-[#0b5d68] text-white hover:bg-[#094d57] shadow-sm',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
    ghost: 'border border-[#e0e4e6] text-[#555] hover:bg-[#f5f7f8] hover:border-[#cdd3d6]',
  }
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md text-xs font-semibold transition-all duration-150 ${styles[variant]}`}
    >
      {label}
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AdminDetailDrawer({ isOpen, onClose, data, type, onAction }: AdminDetailDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) onClose()
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

  const renderContent = () => {
    if (!data) return null
    switch (type) {
      case 'user': return <UserDetails user={data as AdminUser} formatDate={formatDate} />
      case 'listing': return <ListingDetails listing={data as AdminListing} formatDate={formatDate} />
      case 'order': return <OrderDetails order={data as AdminOrder} data={data} formatDate={formatDate} />
      case 'dispute': return <DisputeDetails dispute={data as AdminDispute} formatDate={formatDate} />
      case 'auditLog': return <AuditLogDetails log={data as AuditLogEntry} formatDate={formatDate} />
      default: return null
    }
  }

  const renderActions = () => {
    if (!data) return null

    const actions: { label: string; variant: 'primary' | 'danger' | 'ghost'; onClick?: () => void }[] = []

    if (type === 'user') {
      const user = data as AdminUser
      actions.push({
        label: user.status === 'active' ? 'Ban user' : 'Unban user',
        variant: user.status === 'active' ? 'danger' : 'primary',
        onClick: () => onAction?.('toggle_ban', data),
      })
      actions.push({
        label: user.verificationStatus === 'verified' ? 'Unverify' : 'Verify user',
        variant: user.verificationStatus === 'verified' ? 'ghost' : 'primary',
        onClick: () => onAction?.('toggle_verify', data),
      })
    }

    if (type === 'listing') {
      const listing = data as AdminListing
      actions.push({
        label: listing.isBlocked ? 'Unblock' : 'Block listing',
        variant: listing.isBlocked ? 'primary' : 'danger',
        onClick: async () => {
          try {
            const res = await fetch(apiUrl(`/listings/${listing.id}/block`), {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', ...authHeaders() },
            })
            const result = await res.json()
            if (result.success) { onAction?.('block_toggled', { id: listing.id }); onClose() }
          } catch (err) { console.error('Failed to toggle block:', err) }
        },
      })
    }

    if (type === 'dispute') {
      const dispute = data as AdminDispute
      if (dispute.status === 'open') {
        actions.push({ label: 'Start investigation', variant: 'primary', onClick: () => onAction?.('investigate', data) })
        actions.push({ label: 'Escalate', variant: 'danger', onClick: () => onAction?.('escalate', data) })
      } else if (dispute.status === 'investigating') {
        actions.push({ label: 'Mark resolved', variant: 'primary', onClick: () => onAction?.('resolve', data) })
      }
    }

    // Edit + Delete always last
    actions.push({ label: 'Edit', variant: 'ghost', onClick: () => onAction?.('edit', data) })
    actions.push({ label: 'Delete', variant: 'danger', onClick: () => onAction?.('delete', data) })

    if (actions.length === 0) return null

    return (
      <div className="px-6 py-4 border-t border-[#edf1f3] bg-white">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#0b5d68]/40 mb-3">Actions</p>
        <div className="flex flex-wrap gap-2">
          {actions.map((a, i) => (
            <ActionButton key={i} label={a.label} variant={a.variant} onClick={a.onClick} />
          ))}
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  const typeLabel = type === 'auditLog' ? 'Audit log' : type.charAt(0).toUpperCase() + type.slice(1)

  return (
    <div className="fixed inset-0 z-50 flex" onClick={handleOverlayClick}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-[−32px_0_80px_rgba(11,93,104,0.12)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative shrink-0 bg-white border-b border-[#edf1f3] px-6 pt-6 pb-5">
          {/* Teal accent bar */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#0b5d68] via-[#2eb5c2] to-[#2eb5c2]/20" />

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2] flex items-center justify-center shrink-0 shadow-md">
                <span className="material-symbols-outlined text-white" style={{ fontSize: '18px' }}>
                  {typeIcon(type)}
                </span>
              </div>
              {/* <div>
                <h2 className="text-base font-bold text-[#0b5d68] leading-tight">{typeLabel} details</h2>
                {data && (
                  <p className="text-[11px] text-[#667085] font-mono mt-0.5 truncate max-w-[260px]">
                    {(data as any).id}
                  </p>
                )}
              </div> */}
              <div>
                <h2 className="text-base font-bold text-[#0b5d68] leading-tight">
                  {typeLabel} details
                </h2>

                {data &&
                  (type === 'listing' ? (
                    <>
                      <p className="text-[11px] font-semibold text-[#0b5d68] mt-0.5">
                        {(data as AdminListing).seller.name}
                      </p>
                      <p className="text-[11px] text-[#667085] truncate max-w-[260px]">
                        {(data as AdminListing).seller.email}
                      </p>
                    </>
                  ) : (
                    <p className="text-[11px] text-[#667085] font-mono mt-0.5 truncate max-w-[260px]">
                      {(data as any).id}
                    </p>
                  ))}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded flex items-center justify-center text-[#999] hover:text-[#0b5d68] hover:bg-[#f0f4f5] transition-colors shrink-0 mt-0.5"
              aria-label="Close"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-[#f7f9fa]">
          {renderContent()}
        </div>

        {/* Footer actions */}
        {renderActions()}
      </div>
    </div>
  )
}