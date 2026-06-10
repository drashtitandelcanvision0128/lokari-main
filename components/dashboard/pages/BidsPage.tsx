'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Bid } from '@/types/dashboard'
import { mockBids, mockListings } from '@/data/dashboardMock'
import { getCurrentUser } from '@/lib/auth'

interface BidsPageProps {
  searchQuery?: string
}

export function BidsPage({ searchQuery = '' }: BidsPageProps) {
  // const [bids, setBids] = useState<Bid[]>(mockBids)
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [auctionStateTab, setAuctionStateTab] = useState<'all' | 'active' | 'won' | 'lost'>('all')
  const [positionFilter, setPositionFilter] = useState<'all' | 'leading' | 'outbid'>('all')

  const getPositionBadge = (position: Bid['currentPosition']) => {
    const statusConfig = {
      leading: { color: 'text-[#2eb5c2]', bg: 'bg-[#f9f9f7]', border: 'border-[#2eb5c2]/20' },
      outbid: { color: 'text-[#e89151]', bg: 'bg-[#fef9f5]', border: 'border-[#e89151]/20' }
    } as const

    const labels = {
      leading: 'Leading',
      outbid: 'Outbid'
    }

    const config = statusConfig[position]

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.color} ${config.bg} ${config.border} border backdrop-blur-sm`}>
        {labels[position]}
      </span>
    )
  }

  const getAuctionStateBadge = (state: Bid['auctionState']) => {
    const statusConfig = {
      active: { color: 'text-[#2eb5c2]', bg: 'bg-[#f9f9f7]', border: 'border-[#2eb5c2]/20' },
      won: { color: 'text-[#2eb5c2]', bg: 'bg-[#f9f9f7]', border: 'border-[#2eb5c2]/20' },
      lost: { color: 'text-[#e89151]', bg: 'bg-[#fef9f5]', border: 'border-[#e89151]/20' }
    } as const

    const labels = {
      active: 'Active',
      won: 'Won',
      lost: 'Lost'
    }

    const config = statusConfig[state]

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.color} ${config.bg} ${config.border} border backdrop-blur-sm`}>
        {labels[state]}
      </span>
    )
  }

  const formatTimeLeft = (timeLeft: string) => {
    const [hours, minutes, seconds] = timeLeft.split(':').map(Number)
    const totalSeconds = hours * 3600 + minutes * 60 + seconds

    if (totalSeconds < 3600) {
      return `${minutes}m ${seconds}s`
    }

    return `${hours}h ${minutes}m`
  }


  useEffect(() => {
    const fetchBids = async () => {
      try {
        const currentUser = getCurrentUser()

        if (!currentUser?.id) {
          setBids([])
          return
        }

        const response = await fetch(
          `http://localhost:5000/listings/bids/user/${currentUser.id}`
        )

        const result = await response.json()

        if (result.success) {
          const mappedBids = result.data.map((bid: any) => {
            const auction = bid.auction
            const listing = auction?.listing

            const highestBid =
              auction?.current_highest_bid ||
              auction?.starting_bid ||
              bid.amount

            const endTime = new Date(auction?.end_time)
            const now = new Date()

            const diff = Math.max(
              0,
              Math.floor((endTime.getTime() - now.getTime()) / 1000)
            )

            const hours = Math.floor(diff / 3600)
            const minutes = Math.floor((diff % 3600) / 60)
            const seconds = diff % 60

            const timeLeft =
              `${String(hours).padStart(2, '0')}:` +
              `${String(minutes).padStart(2, '0')}:` +
              `${String(seconds).padStart(2, '0')}`

            return {
              id: bid.bid_id,
              product: listing?.title || 'Unknown Listing',
              currentBid: String(bid.amount),
              highestBid: String(highestBid),
              timeLeft,

              auctionState:
                bid.status === 'WON'
                  ? 'won'
                  : bid.status === 'LOST'
                    ? 'lost'
                    : 'active',

              currentPosition:
                bid.status === 'OUTBID'
                  ? 'outbid'
                  : 'leading',

              isHighPotential:
                bid.status === 'ACTIVE',

              listingId: listing?.listing_id,
              listingTitle: listing?.title || ''
            }
          })

          setBids(mappedBids)
        }
      } catch (error) {
        console.error('Failed to fetch bids:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBids()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading bids...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto w-full">
      {/* Header Section with Filters */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
        {/* Left: Title and Description */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-primary mb-2">My Bids</h1>
          <p className="text-on-surface-variant">Track your bidding activity and competition</p>
        </div>

        {/* Right: Filters and Action - Vertically Stacked */}
        <div className="flex flex-col gap-3 items-end">
          {/* Auction State Tabs - Top Row */}
          <div className="flex flex-wrap gap-2 justify-end">
            {(['all', 'active', 'won', 'lost'] as const).map((tab) => (
              <Button
                key={tab}
                variant={auctionStateTab === tab ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setAuctionStateTab(tab)}
                className={`capitalize ${auctionStateTab === tab ? 'bg-[#2eb5c2] text-white border-[#2eb5c2]' : 'text-primary border-outline'}`}
              >
                {tab}
              </Button>
            ))}
          </div>

          {/* Position Filters - Bottom Row */}
          <div className="flex flex-wrap gap-2 justify-end">
            {(['all', 'leading', 'outbid'] as const).map((position) => (
              <Button
                key={position}
                variant={positionFilter === position ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setPositionFilter(position)}
                className="capitalize"
              >
                {position === 'all' ? 'All Positions' : `${position} bids`}
              </Button>
            ))}
          </div>

          {/* Browse Listings Button */}
          <Button variant="primary" className="flex items-center gap-2">
            <Icon name="search" />
            Browse Listings
          </Button>
        </div>
      </div>

      {/* High Potential Bids Cards */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#0b5d68]">High Potential Bids</h2>
          <div className="text-sm text-[#666666]">
            {bids.filter(bid => {
              const matchesSearch = searchQuery === '' ||
                bid.product.toLowerCase().includes(searchQuery.toLowerCase())
              const matchesAuctionState = auctionStateTab === 'all' || bid.auctionState === auctionStateTab
              const matchesPosition = positionFilter === 'all' || bid.currentPosition === positionFilter
              return bid.isHighPotential && matchesSearch && matchesAuctionState && matchesPosition
            }).length} {bids.filter(bid => {
              const matchesSearch = searchQuery === '' ||
                bid.product.toLowerCase().includes(searchQuery.toLowerCase())
              const matchesAuctionState = auctionStateTab === 'all' || bid.auctionState === auctionStateTab
              const matchesPosition = positionFilter === 'all' || bid.currentPosition === positionFilter
              return bid.isHighPotential && matchesSearch && matchesAuctionState && matchesPosition
            }).length === 1 ? 'bid' : 'bids'} found
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {bids.filter(bid => {
            const matchesSearch = searchQuery === '' ||
              bid.product.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesAuctionState = auctionStateTab === 'all' || bid.auctionState === auctionStateTab
            const matchesPosition = positionFilter === 'all' || bid.currentPosition === positionFilter
            return bid.isHighPotential && matchesSearch && matchesAuctionState && matchesPosition
          }).map((bid) => (
            <div key={bid.id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group border border-[#f0f0f0]">
              {/* Product Image */}
              <div className="h-56 relative bg-gradient-to-br from-[#f9f9f7] to-[#f5f5f3]">
                {(() => {
                  const listing = mockListings.find(l => l.id === bid.listingId)
                  if (listing?.image) {
                    return (
                      <img
                        src={listing.image}
                        alt={bid.product}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )
                  } else {
                    return (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <Icon name="gavel" className="text-5xl text-[#2eb5c2]/30 mb-2" />
                          <p className="text-sm text-[#666666]">{bid.product}</p>
                        </div>
                      </div>
                    )
                  }
                })()}
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {getAuctionStateBadge(bid.auctionState)}
                </div>
                {/* Position Badge */}
                {bid.auctionState === 'active' && (
                  <div className="absolute top-4 left-4">
                    {getPositionBadge(bid.currentPosition)}
                  </div>
                )}
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Bid Details */}
              <div className="p-6 space-y-4">
                {/* Product Name and Time */}
                <div>
                  <h3 className="font-bold text-lg text-[#0b5d68] mb-2 leading-tight">{bid.product}</h3>
                  <div className="flex justify-between items-center">
                    <span className={`flex items-center gap-1 text-xs font-bold ${bid.timeLeft === '00:00:00' ? 'text-[#d55b39]' : 'text-[#e89151]'
                      }`}>
                      <Icon name="timer" className="text-sm" />
                      {formatTimeLeft(bid.timeLeft)}
                    </span>
                    {bid.auctionState === 'active' && getPositionBadge(bid.currentPosition)}
                  </div>
                </div>

                {/* Bid Amounts */}
                <div className="flex justify-between items-center py-3 border-y border-[#f0f0f0]">
                  <div>
                    <p className="text-xs text-[#666666] mb-1">Your Bid</p>
                    <p className="text-xl font-bold text-[#0b5d68]">&#8377;{bid.currentBid}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#666666] mb-1">Highest Bid</p>
                    <p className="text-xl font-bold text-[#2eb5c2]">&#8377;{bid.highestBid}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {bid.auctionState === 'active' && bid.currentPosition === 'outbid' && (
                    <Button variant="primary" size="sm" className="relative bg-gradient-to-r from-[#2eb5c2] via-[#1a9ba8] to-[#26a8b8] hover:from-[#26a8b8] hover:to-[#2eb5c2] text-white shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-0">
                      <Icon name="add" className="text-sm mr-1 relative z-10" />
                      <span className="ml-1 font-semibold">Increase Bid</span>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="relative hover:border-[#2eb5c2] hover:text-[#2eb5c2] transition-all duration-300 bg-white hover:bg-gradient-to-r hover:from-white hover:to-[#f9f9f7] border border-outline hover:border-[#2eb5c2] hover:shadow-lg transform hover:scale-105">
                    <Icon name="visibility" className="text-[#2eb5c2] relative z-10" />
                    <span className="ml-1 font-medium">View Details</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Bids Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#0b5d68]">All {auctionStateTab.charAt(0).toUpperCase() + auctionStateTab.slice(1)} Bids</h2>
          <div className="text-sm text-[#666666]">
            {bids.filter(bid => {
              const matchesAuctionState = auctionStateTab === 'all' || bid.auctionState === auctionStateTab
              const matchesPosition = positionFilter === 'all' || bid.currentPosition === positionFilter
              const matchesSearch = searchQuery === '' ||
                bid.product.toLowerCase().includes(searchQuery.toLowerCase())
              return matchesAuctionState && matchesPosition && matchesSearch
            }).length} {bids.filter(bid => {
              const matchesAuctionState = auctionStateTab === 'all' || bid.auctionState === auctionStateTab
              const matchesPosition = positionFilter === 'all' || bid.currentPosition === positionFilter
              const matchesSearch = searchQuery === '' ||
                bid.product.toLowerCase().includes(searchQuery.toLowerCase())
              return matchesAuctionState && matchesPosition && matchesSearch
            }).length === 1 ? 'bid' : 'bids'} found
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {bids.filter(bid => {
            const matchesAuctionState = auctionStateTab === 'all' || bid.auctionState === auctionStateTab
            const matchesPosition = positionFilter === 'all' || bid.currentPosition === positionFilter
            const matchesSearch = searchQuery === '' ||
              bid.product.toLowerCase().includes(searchQuery.toLowerCase())
            return matchesAuctionState && matchesPosition && matchesSearch
          }).map((bid) => (
            <div key={bid.id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group border border-[#f0f0f0]">
              {/* Product Image */}
              <div className="h-56 relative bg-gradient-to-br from-[#f9f9f7] to-[#f5f5f3]">
                {(() => {
                  const listing = mockListings.find(l => l.id === bid.listingId)
                  if (listing?.image) {
                    return (
                      <img
                        src={listing.image}
                        alt={bid.product}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )
                  } else {
                    return (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <Icon name="gavel" className="text-5xl text-[#2eb5c2]/30 mb-2" />
                          <p className="text-sm text-[#666666]">{bid.product}</p>
                        </div>
                      </div>
                    )
                  }
                })()}
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {getAuctionStateBadge(bid.auctionState)}
                </div>
                {/* Position Badge */}
                {bid.auctionState === 'active' && (
                  <div className="absolute top-4 left-4">
                    {getPositionBadge(bid.currentPosition)}
                  </div>
                )}
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Bid Details */}
              <div className="p-6 space-y-4">
                {/* Product Name and Time */}
                <div>
                  <h3 className="font-bold text-lg text-[#0b5d68] mb-2 leading-tight">{bid.product}</h3>
                  <div className="flex justify-between items-center">
                    <span className={`flex items-center gap-1 text-xs font-bold ${bid.timeLeft === '00:00:00' ? 'text-[#d55b39]' : 'text-[#e89151]'
                      }`}>
                      <Icon name="timer" className="text-sm" />
                      {formatTimeLeft(bid.timeLeft)}
                    </span>
                    {bid.auctionState === 'active' && getPositionBadge(bid.currentPosition)}
                  </div>
                </div>

                {/* Bid Amounts */}
                <div className="flex justify-between items-center py-3 border-y border-[#f0f0f0]">
                  <div>
                    <p className="text-xs text-[#666666] mb-1">Your Bid</p>
                    <p className="text-xl font-bold text-[#0b5d68]">&#8377;{bid.currentBid}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#666666] mb-1">Highest Bid</p>
                    <p className="text-xl font-bold text-[#2eb5c2]">&#8377;{bid.highestBid}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {bid.auctionState === 'active' && bid.currentPosition === 'outbid' && (
                    <Button variant="primary" size="sm" className="relative bg-gradient-to-r from-[#2eb5c2] via-[#1a9ba8] to-[#26a8b8] hover:from-[#26a8b8] hover:to-[#2eb5c2] text-white shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-0">
                      <Icon name="add" className="text-sm mr-1 relative z-10" />
                      <span className="ml-1 font-semibold">Increase Bid</span>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="relative hover:border-[#2eb5c2] hover:text-[#2eb5c2] transition-all duration-300 bg-white hover:bg-gradient-to-r hover:from-white hover:to-[#f9f9f7] border border-outline hover:border-[#2eb5c2] hover:shadow-lg transform hover:scale-105">
                    <Icon name="visibility" className="text-[#2eb5c2] relative z-10" />
                    <span className="ml-1 font-medium">View Details</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
