'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Shipment, TransportListing, TransportRequest, TransportQuote } from '@/types/dashboard'
import { mockShipments, mockTransportListings, mockTransportRequests, mockTransportQuotes } from '@/data/dashboardMock'
import { useDashboardSearch } from '@/hooks/useSearchFilter'

interface LogisticsPageProps {
  searchQuery?: string
}

export function LogisticsPage({ searchQuery = '' }: LogisticsPageProps) {
  const [activeSubTab, setActiveSubTab] = useState<'listings' | 'requests' | 'shipments' | 'quotes'>('shipments')
  const [shipments] = useState<Shipment[]>(mockShipments)

  // Filter shipments based on search query using the new search hook
  const filteredShipments = useDashboardSearch(shipments, searchQuery)

  const getStatusBadge = (status: Shipment['status']) => {
    const variants = {
      preparing: 'warning',
      in_transit: 'primary',
      delivered: 'success',
      delayed: 'error'
    } as const

    const labels = {
      preparing: 'Preparing',
      in_transit: 'In Transit',
      delivered: 'Delivered',
      delayed: 'Delayed'
    }

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    )
  }

  const getStatusIcon = (status: Shipment['status']) => {
    const icons = {
      preparing: 'inventory_2',
      in_transit: 'local_shipping',
      delivered: 'check_circle',
      delayed: 'warning'
    }
    return icons[status]
  }

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto w-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary">Logistics</h1>
          <p className="text-on-surface-variant mt-1">Manage shipments and logistics operations</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2">
          <Icon name="add" />
          New Shipment
        </Button>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-outline">
        {(['listings', 'requests', 'shipments', 'quotes'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`pb-3 px-1 capitalize font-medium text-sm transition-colors border-b-2 ${
              activeSubTab === tab
                ? 'text-accent border-accent'
                : 'text-on-surface-variant border-transparent hover:text-primary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content based on active sub-tab */}
      {activeSubTab === 'shipments' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange/10 rounded-lg text-orange">
                    <Icon name="inventory_2" />
                  </div>
                  <div>
                    <p className="text-sm text-on-surface-variant">Preparing</p>
                    <p className="text-2xl font-bold text-primary">3</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Icon name="local_shipping" />
                  </div>
                  <div>
                    <p className="text-sm text-stone-500">In Transit</p>
                    <p className="text-2xl font-bold text-primary">8</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success/10 rounded-lg text-success">
                    <Icon name="check_circle" />
                  </div>
                  <div>
                    <p className="text-sm text-stone-500">Delivered</p>
                    <p className="text-2xl font-bold text-primary">24</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-error/10 rounded-lg text-error">
                    <Icon name="warning" />
                  </div>
                  <div>
                    <p className="text-sm text-stone-500">Delayed</p>
                    <p className="text-2xl font-bold text-primary">2</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Shipments Table */}
          <Card>
            <CardHeader>
              <CardTitle>Active Shipments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] text-on-surface-variant uppercase tracking-widest border-b border-outline">
                      <th className="pb-4 font-bold">Tracking #</th>
                      <th className="pb-4 font-bold">Product</th>
                      <th className="pb-4 font-bold">From</th>
                      <th className="pb-4 font-bold">To</th>
                      <th className="pb-4 font-bold">Driver</th>
                      <th className="pb-4 font-bold">Vehicle</th>
                      <th className="pb-4 font-bold">Status</th>
                      <th className="pb-4 font-bold">Est. Delivery</th>
                      <th className="pb-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-medium divide-y divide-outline">
                    {filteredShipments.map((shipment) => (
                      <tr key={shipment.id}>
                        <td className="py-4">
                          <p className="text-primary font-mono">{shipment.trackingNumber}</p>
                        </td>
                        <td className="py-4">
                          <p className="text-primary">{shipment.product}</p>
                        </td>
                        <td className="py-4 text-stone-600">{shipment.from}</td>
                        <td className="py-4 text-stone-600">{shipment.to}</td>
                        <td className="py-4 text-stone-600">{shipment.driver || '-'}</td>
                        <td className="py-4 text-stone-600">{shipment.vehicle || '-'}</td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <Icon name={getStatusIcon(shipment.status)} className="text-sm" />
                            {getStatusBadge(shipment.status)}
                          </div>
                        </td>
                        <td className="py-4 text-stone-600">{shipment.estimatedDelivery}</td>
                        <td className="py-4 text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Button variant="ghost" size="sm">
                              <Icon name="visibility" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Icon name="edit" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeSubTab === 'listings' && (
        <Card>
          <CardHeader>
            <CardTitle>My Transport Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-on-surface-variant uppercase tracking-widest border-b border-outline">
                    <th className="pb-4 font-bold">Service Type</th>
                    <th className="pb-4 font-bold">Route</th>
                    <th className="pb-4 font-bold">Vehicle</th>
                    <th className="pb-4 font-bold">Capacity</th>
                    <th className="pb-4 font-bold">Price</th>
                    <th className="pb-4 font-bold">Status</th>
                    <th className="pb-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium divide-y divide-outline">
                  {mockTransportListings.map((listing) => (
                    <tr key={listing.id}>
                      <td className="py-4">
                        <p className="text-primary">{listing.serviceType}</p>
                      </td>
                      <td className="py-4 text-stone-600">{listing.route}</td>
                      <td className="py-4 text-stone-600">{listing.vehicle}</td>
                      <td className="py-4 text-stone-600">{listing.capacity}</td>
                      <td className="py-4 text-primary">{listing.price}</td>
                      <td className="py-4">
                        <Badge variant={listing.status === 'active' ? 'success' : 'default'}>
                          {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button variant="ghost" size="sm">
                            <Icon name="visibility" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Icon name="edit" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeSubTab === 'requests' && (
        <Card>
          <CardHeader>
            <CardTitle>Transport Requests I Made</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-on-surface-variant uppercase tracking-widest border-b border-outline">
                    <th className="pb-4 font-bold">Product</th>
                    <th className="pb-4 font-bold">From</th>
                    <th className="pb-4 font-bold">To</th>
                    <th className="pb-4 font-bold">Quantity</th>
                    <th className="pb-4 font-bold">Urgency</th>
                    <th className="pb-4 font-bold">Responses</th>
                    <th className="pb-4 font-bold">Status</th>
                    <th className="pb-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium divide-y divide-outline">
                  {mockTransportRequests.map((request) => (
                    <tr key={request.id}>
                      <td className="py-4">
                        <p className="text-primary">{request.product}</p>
                      </td>
                      <td className="py-4 text-stone-600">{request.from}</td>
                      <td className="py-4 text-stone-600">{request.to}</td>
                      <td className="py-4 text-stone-600">{request.quantity}</td>
                      <td className="py-4">
                        <Badge variant={request.urgency === 'urgent' ? 'error' : request.urgency === 'express' ? 'warning' : 'secondary'}>
                          {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-4 text-primary">{request.responses}</td>
                      <td className="py-4">
                        <Badge variant={request.status === 'open' ? 'primary' : request.status === 'accepted' ? 'success' : request.status === 'rejected' ? 'error' : 'default'}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button variant="ghost" size="sm">
                            <Icon name="visibility" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeSubTab === 'quotes' && (
        <Card>
          <CardHeader>
            <CardTitle>Quotes I've Submitted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-on-surface-variant uppercase tracking-widest border-b border-outline">
                    <th className="pb-4 font-bold">Request ID</th>
                    <th className="pb-4 font-bold">Price</th>
                    <th className="pb-4 font-bold">Est. Delivery</th>
                    <th className="pb-4 font-bold">Vehicle</th>
                    <th className="pb-4 font-bold">Status</th>
                    <th className="pb-4 font-bold">Submitted</th>
                    <th className="pb-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium divide-y divide-outline">
                  {mockTransportQuotes.map((quote) => (
                    <tr key={quote.id}>
                      <td className="py-4">
                        <p className="text-primary font-mono">#{quote.requestId}</p>
                      </td>
                      <td className="py-4 text-primary">{quote.price}</td>
                      <td className="py-4 text-stone-600">{quote.estimatedDelivery}</td>
                      <td className="py-4 text-stone-600">{quote.vehicle}</td>
                      <td className="py-4">
                        <Badge variant={quote.status === 'pending' ? 'warning' : quote.status === 'accepted' ? 'success' : 'error'}>
                          {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-4 text-stone-600">{quote.submittedAt}</td>
                      <td className="py-4 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          {quote.status === 'pending' && (
                            <Button variant="primary" size="sm">
                              <Icon name="edit" className="text-sm" />
                              Edit
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <Icon name="visibility" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
