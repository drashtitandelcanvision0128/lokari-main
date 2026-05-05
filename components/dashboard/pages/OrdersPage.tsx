'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { mockListings } from '@/data/dashboardMock'

interface Order {
  id: string
  orderNumber: string
  product: string
  type: 'buying' | 'selling'
  quantity: string
  amount: string
  status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
  buyer?: string
  seller?: string
  createdAt: string
  estimatedDelivery?: string
}

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    product: 'Arabica Coffee Beans',
    type: 'selling',
    quantity: '500 kg',
    amount: '₹1,28,650.00',
    status: 'confirmed',
    buyer: 'Global Coffee Co.',
    createdAt: '2024-01-15',
    estimatedDelivery: '2024-01-20'
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    product: 'Organic Fertilizer',
    type: 'buying',
    quantity: '2 Tons',
    amount: '₹66,400.00',
    status: 'shipped',
    seller: 'AgriSupply Ltd',
    createdAt: '2024-01-14',
    estimatedDelivery: '2024-01-18'
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    product: 'Yellow Maize',
    type: 'selling',
    quantity: '1.5 Tons',
    amount: '₹1,80,525.00',
    status: 'preparing',
    buyer: 'Food Processing Inc',
    createdAt: '2024-01-13'
  }
]

interface OrdersPageProps {
  searchQuery?: string
}

export function OrdersPage({ searchQuery = '' }: OrdersPageProps) {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [activeTab, setActiveTab] = useState<'all' | 'buying' | 'selling'>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === 'all' || order.type === activeTab
    const matchesSearch = searchQuery === '' || 
      order.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesTab && matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending: { color: 'text-[#e89151]', bg: 'bg-[#fef9f5]', border: 'border-[#e89151]/20' },
      confirmed: { color: 'text-[#2eb5c2]', bg: 'bg-[#f0f9ff]', border: 'border-[#2eb5c2]/20' },
      preparing: { color: 'text-[#e89151]', bg: 'bg-[#fef9f5]', border: 'border-[#e89151]/20' },
      shipped: { color: 'text-[#2eb5c2]', bg: 'bg-[#f0f9ff]', border: 'border-[#2eb5c2]/20' },
      delivered: { color: 'text-[#2eb5c2]', bg: 'bg-[#f0f9ff]', border: 'border-[#2eb5c2]/20' },
      cancelled: { color: 'text-[#d55b39]', bg: 'bg-[#fef5f5]', border: 'border-[#d55b39]/20' }
    } as const

    const config = statusConfig[status]

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.color} ${config.bg} ${config.border} border backdrop-blur-sm`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getStatusProgress = (status: Order['status']) => {
    if (status === 'cancelled') {
      return (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full bg-error" />
        </div>
      )
    }
    
    const progressSteps = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered'] as const
    const currentIndex = progressSteps.indexOf(status)
    
    return (
      <div className="flex items-center gap-2">
        {progressSteps.map((step, index) => (
          <div
            key={step}
            className={`flex-1 h-1 rounded-full ${
              index <= currentIndex ? 'bg-primary' : 'bg-stone-200'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto w-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary">Orders</h1>
          <p className="text-on-surface-variant mt-1">Track and manage your buying and selling orders</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2">
          <Icon name="add" />
          New Order
        </Button>
      </div>

      {/* Order Type Tabs */}
      <div className="flex gap-2">
        {(['all', 'buying', 'selling'] as const).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab)}
            className="capitalize"
          >
            {tab === 'all' ? 'All Orders' : `${tab} orders`}
          </Button>
        ))}
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={statusFilter === 'all' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setStatusFilter('all')}
        >
          All Status
        </Button>
        {(['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'] as const).map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setStatusFilter(status)}
            className="capitalize"
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#0b5d68]">All Orders</h2>
          <div className="text-sm text-[#666666]">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} found
          </div>
        </div>

        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-[#f0f0f0] overflow-hidden">
              <div className="flex flex-col lg:flex-row">
                {/* Left: Product Card (30% space) */}
                <div className="lg:w-[30%] p-6 border-r border-[#f0f0f0]">
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group border border-[#f0f0f0]">
                    {/* Product Image */}
                    <div className="h-48 relative bg-gradient-to-br from-[#f9f9f7] to-[#f5f5f3]">
                      {(() => {
                        const listing = mockListings.find(l => l.product === order.product)
                        if (listing?.image) {
                          return (
                            <img 
                              src={listing.image} 
                              alt={order.product}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          )
                        } else {
                          return (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-center">
                                <Icon name="shopping_cart" className="text-5xl text-[#2eb5c2]/30 mb-2" />
                                <p className="text-sm text-[#666666]">{order.product}</p>
                              </div>
                            </div>
                          )
                        }
                      })()}
                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        {getStatusBadge(order.status)}
                      </div>
                      {/* Order Type Badge */}
                      <div className="absolute top-4 left-4">
                        <Badge variant={order.type === 'buying' ? 'secondary' : 'primary'}>
                          {order.type === 'buying' ? 'Buying' : 'Selling'}
                        </Badge>
                      </div>
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Product Details */}
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-[#0b5d68] mb-2 leading-tight">{order.product}</h3>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-[#666666]">Order #{order.orderNumber}</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-y border-[#f0f0f0]">
                        <div>
                          <p className="text-xs text-[#666666] mb-1">Quantity</p>
                          <p className="text-lg font-bold text-[#0b5d68]">{order.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[#666666] mb-1">Amount</p>
                          <p className="text-lg font-bold text-[#2eb5c2]">{order.amount}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center py-2">
                        <div>
                          <p className="text-xs text-[#666666] mb-1">
                            {order.type === 'buying' ? 'Seller' : 'Buyer'}
                          </p>
                          <p className="text-sm font-medium text-[#0b5d68]">
                            {order.type === 'buying' ? order.seller : order.buyer}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[#666666] mb-1">Est. Delivery</p>
                          <p className="text-sm font-medium text-[#e89151]">
                            {order.estimatedDelivery || 'Not specified'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: 3 Rows (70-80% space) */}
                <div className="lg:w-[70%] p-6 space-y-6">
                  {/* Top Row: Seller Info (Left) & Buyer Info (Right) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Seller Info */}
                    <div className="bg-gradient-to-br from-[#f9f9f7] to-[#f5f5f3] rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-[#0b5d68] mb-3 flex items-center gap-2">
                        <Icon name="store" className="text-[#2eb5c2]" />
                        Seller Information
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-[#666666]">Company Name</p>
                          <p className="text-sm font-medium text-[#0b5d68]">
                            {order.type === 'buying' ? order.seller : 'Your Company'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#666666]">Contact Email</p>
                          <p className="text-sm font-medium text-[#0b5d68]">
                            {order.type === 'buying' ? 'seller@company.com' : 'your@company.com'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#666666]">Phone</p>
                          <p className="text-sm font-medium text-[#0b5d68]">
                            {order.type === 'buying' ? '+1 234-567-8901' : '+1 234-567-8902'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Buyer Info */}
                    <div className="bg-gradient-to-br from-[#fef9f5] to-[#fef5f0] rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-[#e89151] mb-3 flex items-center gap-2">
                        <Icon name="person" className="text-[#e89151]" />
                        Buyer Information
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-[#666666]">Company Name</p>
                          <p className="text-sm font-medium text-[#e89151]">
                            {order.type === 'buying' ? 'Your Company' : order.buyer}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#666666]">Contact Email</p>
                          <p className="text-sm font-medium text-[#e89151]">
                            {order.type === 'buying' ? 'your@company.com' : 'buyer@company.com'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#666666]">Phone</p>
                          <p className="text-sm font-medium text-[#e89151]">
                            {order.type === 'buying' ? '+1 234-567-8902' : '+1 234-567-8901'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Middle Row: Status Timeline */}
                  <div className="bg-gradient-to-br from-[#f0f9ff] to-[#e6f7ff] rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-[#0b5d68] mb-3 flex items-center gap-2">
                      <Icon name="timeline" className="text-[#2eb5c2]" />
                      Order Status Timeline
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs text-[#666666] mb-2">
                        <span>Order Progress</span>
                        <span>{getStatusBadge(order.status)}</span>
                      </div>
                      {getStatusProgress(order.status)}
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div className="text-center">
                          <Icon name="pending" className="text-[#666666] mb-1" />
                          <p>Pending</p>
                        </div>
                        <div className="text-center">
                          <Icon name="check_circle" className="text-[#2eb5c2] mb-1" />
                          <p>Confirmed</p>
                        </div>
                        <div className="text-center">
                          <Icon name="inventory" className="text-[#666666] mb-1" />
                          <p>Preparing</p>
                        </div>
                        <div className="text-center">
                          <Icon name="local_shipping" className="text-[#666666] mb-1" />
                          <p>Shipped</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Action Buttons */}
                  <div className="bg-gradient-to-br from-[#f5f5f5] to-[#f0f0f0] rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-[#0b5d68] mb-3 flex items-center gap-2">
                      <Icon name="settings" className="text-[#2eb5c2]" />
                      Order Actions
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <Button variant="outline" size="sm" className="hover:border-[#2eb5c2] hover:text-[#2eb5c2] transition-all duration-300 bg-white hover:bg-[#f9f9f7] border border-outline hover:border-[#2eb5c2] hover:shadow-lg transform hover:scale-105">
                        <Icon name="local_shipping" className="text-[#2eb5c2]" />
                        Track Shipment
                      </Button>
                      <Button variant="outline" size="sm" className="hover:border-[#e89151] hover:text-[#e89151] transition-all duration-300 bg-white hover:bg-[#fef9f5] border border-outline hover:border-[#e89151] hover:shadow-lg transform hover:scale-105">
                        <Icon name="gavel" className="text-[#e89151]" />
                        Raise Dispute
                      </Button>
                      <Button variant="outline" size="sm" className="hover:border-[#2eb5c2] hover:text-[#2eb5c2] transition-all duration-300 bg-white hover:bg-[#f9f9f7] border border-outline hover:border-[#2eb5c2] hover:shadow-lg transform hover:scale-105">
                        <Icon name="star" className="text-[#2eb5c2]" />
                        Leave Review
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <Icon name="shopping_cart" className="text-6xl text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-stone-600 mb-2">
            No orders found
          </h3>
          <p className="text-stone-500">
            {activeTab === 'all' 
              ? 'No orders match your current filters.'
              : `No ${activeTab} orders found.`
            }
          </p>
        </div>
      )}
    </div>
  )
}
