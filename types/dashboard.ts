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
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
  quantity: string
  bids: number
  views: number
  inquiries: number
  status: 'live' | 'reviewing' | 'paused' | 'sold' | 'expired'
  listingType: 'produce' | 'warehouse' | 'transport'
  price?: string
  image?: string

  product_images?: string[]
  createdAt: string
  priceType?: string
  listingLocation?: string

  address?: {
    street?: string
    city?: string
    state?: string
    pincode?: string
    country?: string
  } | null
  farmerProduce?: {
    crop_type?: string
    variety?: string
    quantity?: number
    unit?: string
    harvest_date?: string
    expiry_date?: string
    quality_grade?: string
  } | null
  warehouse?: {
    capacity?: number
    capacity_unit?: string
    available_from?: string
    available_to?: string
    climate_controlled?: boolean
  } | null
  transport?: {
    vehicle_type?: string
    capacity?: number
    capacity_unit?: string
    available_from?: string
    available_to?: string
    is_refrigerated?: boolean
  } | null
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

