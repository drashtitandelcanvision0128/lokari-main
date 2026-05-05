export type DashboardTabs = {
  overview: boolean
  listings: boolean
  bids: boolean
  requirements: boolean
  logistics: boolean
  orders: boolean
  transactions: boolean
  settings: boolean
}

export type DashboardState = {
  tabs: DashboardTabs
  user: {
    name: string
    email: string
    verified: boolean
    avatar?: string
  }
  stats: {
    activeListings: number
    pendingBids: number
    ongoingShipments: number
    totalEarnings: string
  }
}

export type TabType = keyof DashboardTabs

export type Listing = {
  id: string
  product: string
  description: string
  quantity: string
  bids: number
  views: number
  inquiries: number
  status: 'live' | 'reviewing' | 'paused' | 'sold' | 'expired'
  listingType: 'produce' | 'warehouse' | 'transport'
  price?: string
  image?: string
  createdAt: string
}

export type Bid = {
  id: string
  product: string
  currentBid: string
  highestBid: string
  timeLeft: string
  auctionState: 'active' | 'won' | 'lost'
  currentPosition: 'leading' | 'outbid'
  isHighPotential: boolean
  listingId: string
  listingTitle: string
}

export type Notification = {
  id: string
  type: 'payment' | 'bid' | 'shipment' | 'system'
  title: string
  message: string
  time: string
  read: boolean
}

export type Requirement = {
  id: string
  title: string
  description: string
  quantity: string
  budget: string
  status: 'open' | 'fulfilled' | 'expired'
  responses: number
  postedAt: string
}

export type Shipment = {
  id: string
  product: string
  from: string
  to: string
  status: 'preparing' | 'in_transit' | 'delivered' | 'delayed'
  trackingNumber: string
  estimatedDelivery: string
  driver?: string
  vehicle?: string
}

export type TransportListing = {
  id: string
  serviceType: string
  route: string
  vehicle: string
  capacity: string
  price: string
  status: 'active' | 'inactive'
  postedAt: string
}

export type TransportRequest = {
  id: string
  product: string
  from: string
  to: string
  quantity: string
  urgency: 'standard' | 'express' | 'urgent'
  status: 'open' | 'accepted' | 'rejected' | 'completed'
  responses: number
  postedAt: string
}

export type TransportQuote = {
  id: string
  requestId: string
  price: string
  estimatedDelivery: string
  vehicle: string
  status: 'pending' | 'accepted' | 'rejected'
  submittedAt: string
}

export type Transaction = {
  id: string
  type: 'payment' | 'refund' | 'payout'
  amount: string
  description: string
  status: 'completed' | 'pending' | 'failed' | 'in_escrow'
  date: string
  invoice?: string
  escrowReleaseDate?: string
}
