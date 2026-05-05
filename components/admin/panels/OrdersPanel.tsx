'use client'

import { useState } from 'react'
import { AdminOrder } from '@/types/admin'
import { mockAdminOrders } from '@/data/adminMock'
import { AdminDetailDrawer } from '../AdminDetailDrawer'

interface OrdersPanelProps {
  searchQuery?: string
}

export function OrdersPanel({ searchQuery = '' }: OrdersPanelProps) {
  const [orders] = useState<AdminOrder[]>(mockAdminOrders)
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all')

  const handleViewOrder = (order: AdminOrder) => {
    setSelectedOrder(order)
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedOrder(null)
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.listingTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.seller.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus
    const matchesPaymentStatus = selectedPaymentStatus === 'all' || order.paymentStatus === selectedPaymentStatus
    
    return matchesSearch && matchesStatus && matchesPaymentStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-primary-fixed text-primary'
      case 'processing':
        return 'bg-secondary-fixed text-secondary'
      case 'shipped':
        return 'bg-secondary-container text-secondary'
      case 'delivered':
        return 'bg-tertiary text-on-tertiary'
      case 'cancelled':
        return 'bg-surface-container text-on-surface-variant'
      case 'disputed':
        return 'bg-error text-on-error'
      default:
        return 'bg-surface-container text-on-surface-variant'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-tertiary-fixed text-tertiary'
      case 'in_escrow':
        return 'bg-primary-fixed text-primary'
      case 'released':
        return 'bg-tertiary text-on-tertiary'
      case 'refunded':
        return 'bg-error-container text-error'
      default:
        return 'bg-surface-container text-on-surface-variant'
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
      'disputed': 0,
      'confirmed': 1,
      'processing': 2,
      'shipped': 3,
      'delivered': 4,
      'cancelled': 5
    }
    return priorities[status as keyof typeof priorities] || 999
  }

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    return getStatusPriority(a.status) - getStatusPriority(b.status)
  })

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-on-surface-variant">Order Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 text-sm border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="disputed">Disputed</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-on-surface-variant">Payment Status:</label>
            <select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              className="px-3 py-1.5 text-sm border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Payment Status</option>
              <option value="paid">Paid</option>
              <option value="in_escrow">In Escrow</option>
              <option value="released">Released</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div className="ml-auto text-sm text-on-surface-variant">
            Showing {sortedOrders.length} of {orders.length} orders
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-outline-variant">
              <thead className="bg-surface-container">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                    Participants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-surface-container-lowest divide-y divide-outline-variant">
                {sortedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface-container transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-on-surface">{order.id}</div>
                        <div className="text-on-surface-variant">{order.listingTitle}</div>
                        <div className="text-xs text-on-surface-variant">{order.quantity} units</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-on-surface-variant">Buyer:</div>
                        <div className="text-on-surface">{order.buyer.name}</div>
                        <div className="text-on-surface-variant">Seller:</div>
                        <div className="text-on-surface">{order.seller.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-semibold text-primary">Rs. {order.totalAmount.toFixed(2)}</div>
                        <div className="text-xs text-on-surface-variant">Rs. {order.unitPrice.toFixed(2)} per unit</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface-variant">
                      <div>{formatDate(order.createdAt)}</div>
                      {order.deliveryDate && (
                        <div className="text-xs">Delivery: {formatDate(order.deliveryDate)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleViewOrder(order)}
                          className="text-primary hover:text-primary-container transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </button>
                        {order.trackingNumber && (
                          <button className="text-secondary hover:text-secondary-container transition-colors cursor-pointer">
                            <span className="material-symbols-outlined text-lg">local_shipping</span>
                          </button>
                        )}
                        {order.status === 'disputed' && (
                          <button className="text-error hover:text-error-container transition-colors cursor-pointer">
                            <span className="material-symbols-outlined text-lg">gavel</span>
                          </button>
                        )}
                        <button className="text-on-surface hover:text-on-surface-variant transition-colors cursor-pointer">
                          <span className="material-symbols-outlined text-lg">more_vert</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {sortedOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-2xl text-on-surface-variant">receipt_long</span>
            </div>
            <h3 className="text-lg font-medium text-on-surface mb-2">No orders found</h3>
            <p className="text-on-surface-variant">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Admin Detail Drawer */}
      <AdminDetailDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        data={selectedOrder}
        type="order"
      />
    </>
  )
}
