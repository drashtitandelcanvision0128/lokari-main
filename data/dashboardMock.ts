import { DashboardState, Listing, Bid, Notification, Requirement, Shipment, Transaction, TransportListing, TransportRequest, TransportQuote } from '@/types/dashboard'
import { Fascinate_Inline } from 'next/font/google'

export const dashboardMock: DashboardState = {
  tabs: {
    overview: true,
    listings: true,
    bids: true,
    requirements: true,
    logistics: true,
    orders: false,
    transactions: true,
    settings: true
  },
  user: {
    name: 'Samuel K. Njoku',
    email: 'samuel.njoku@lokhari.com',
    verified: true,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtcgwObeViinNN0eoLWBwhhJ0GVy6Fb60CZTEB5YNI9pPmfAICJtPgUEEKnAbb3n2vXd1zqAcFit9CLpUsa3S_i_JOx0T9DWXhXN9TeO1Az3stLuWy2_epMdPJEC3zhh_jj9QrCdBgn7OOGXkqNmDrhyMO2LHUyI68R7llG227nMDW7_F1zLxQI3ovhA_b7OBauTXjBFpfPLxNwi2dZPNdcpQpv02nyAZVOvV1biO76xCpZDutKelMLqXbYGI2GjOHJyJZe8kskPo'
  },
  stats: {
    activeListings: 14,
    pendingBids: 42,
    ongoingShipments: 21,
    totalEarnings: 'Rs. 2.8L'
  }
}

export const mockListings: Listing[] = [
  {
    id: '1',
    product: 'Arabica Coffee',
    description: 'Grade A1, Moist 12%',
    quantity: '500 kg',
    bids: 12,
    views: 145,
    inquiries: 8,
    status: 'live',
    listingType: 'produce',
    price: '₹35/kg',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQIjKfTzGijrZqSOH6zWpkKJ9iPKYdKA_F5BJU_PbyrxU9EZkOaJ92uUgQTGOmD9kcn-bCqLrbucSBwC8RqN5FRdfQogRpTRD4mbBrVxV-c1WBBeGt8QYnnGJHCH5LayGp9wkUvXNVAQ0aKfAXA-F4h3UaHK_Zv-Tk8vjK1DLaUDG0EG7N4MV2S2ZQCPpG2sroIpPiqbUJYDbSoXqY0LFPMdVvwjoAZe9hQnU0GinwkTvnIwd18UX_0o5bsqpTIcggflODovI0hUI',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    product: 'Yellow Maize',
    description: 'Bulk Harvest, Dry',
    quantity: '2.5 Tons',
    bids: 8,
    views: 89,
    inquiries: 5,
    status: 'reviewing',
    listingType: 'produce',
    price: '₹25/kg',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA80wiM9QBoQyLnEJWU7Ceet9y55MytxSgG2xujCXf1YSBw4qMHx77EHS7fue8JG29JxjQBDGQp8Ia4r7d_zIdxHdgq2JN-ZT2RBbRkODajQGBtMtTXKcbtIeYhbWHv74ixGuEjwYMtxgQTxSwOZlGrUWsiNmNTJw6EYfwzyCF8xm4aNEiSGfLRjXEw-rYHLYerQKmUeM87NKJWvK5ZbpCB5hghE-V7XvB92A6tRYxuuIAmJOpEYt6qedeCWIsHLOa310k7u4n2KsM',
    createdAt: '2024-01-14'
  },
  {
    id: '3',
    product: 'Premium Cocoa Beans',
    description: 'Grade A, Fermented',
    quantity: '750 kg',
    bids: 15,
    views: 203,
    inquiries: 12,
    status: 'sold',
    listingType: 'produce',
    price: '₹28/kg',
    createdAt: '2024-01-13'
  },
  {
    id: '4',
    product: 'Warehouse Space - Mumbai Hub',
    description: 'Climate-controlled storage, 1000 sq ft',
    quantity: '1 Unit',
    bids: 3,
    views: 67,
    inquiries: 2,
    status: 'live',
    listingType: 'warehouse',
    price: '₹12,000/month',
    createdAt: '2024-01-12'
  },
  {
    id: '5',
    product: 'Refrigerated Transport Service',
    description: 'Cold chain logistics for perishables',
    quantity: 'Per Trip',
    bids: 7,
    views: 124,
    inquiries: 6,
    status: 'paused',
    listingType: 'transport',
    price: '₹18/km',
    createdAt: '2024-01-11'
  },
  {
    id: '6',
    product: 'Organic Tomatoes',
    description: 'Fresh harvest, greenhouse grown',
    quantity: '200 kg',
    bids: 0,
    views: 45,
    inquiries: 1,
    status: 'expired',
    listingType: 'produce',
    price: '₹32/kg',
    createdAt: '2024-01-05'
  }
]

export const mockBids: Bid[] = [
  {
    id: '1',
    product: 'Arabica Coffee',
    currentBid: '257.30',
    highestBid: '257.30',
    timeLeft: '04:12:30',
    auctionState: 'active',
    currentPosition: 'leading',
    isHighPotential: true,
    listingId: '1',
    listingTitle: 'Premium Arabica Coffee - Grade A1'
  },
  {
    id: '2',
    product: 'Yellow Maize',
    currentBid: '120.35',
    highestBid: '120.35',
    timeLeft: '18:45:00',
    auctionState: 'active',
    currentPosition: 'outbid',
    isHighPotential: false,
    listingId: '2',
    listingTitle: 'Bulk Yellow Maize - Dry Harvest'
  },
  {
    id: '3',
    product: 'Premium Cocoa Beans',
    currentBid: '236.55',
    highestBid: '236.55',
    timeLeft: '00:00:00',
    auctionState: 'won',
    currentPosition: 'leading',
    isHighPotential: true,
    listingId: '3',
    listingTitle: 'Premium Cocoa Beans - Grade A'
  },
  {
    id: '4',
    product: 'Organic Tomatoes',
    currentBid: '182.60',
    highestBid: '182.60',
    timeLeft: '00:00:00',
    auctionState: 'lost',
    currentPosition: 'outbid',
    isHighPotential: false,
    listingId: '6',
    listingTitle: 'Fresh Organic Tomatoes'
  },
  {
    id: '5',
    product: 'Warehouse Space',
    currentBid: '41500',
    highestBid: '41500',
    timeLeft: '12:30:15',
    auctionState: 'active',
    currentPosition: 'outbid',
    isHighPotential: false,
    listingId: '4',
    listingTitle: 'Mumbai Warehouse - Climate Controlled'
  },
  {
    id: '6',
    product: 'Refrigerated Transport',
    currentBid: '₹41.50',
    highestBid: '₹41.50',
    timeLeft: '02:15:30',
    auctionState: 'active',
    currentPosition: 'leading',
    isHighPotential: true,
    listingId: '5',
    listingTitle: 'Cold Chain Transport Service'
  }
]

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'payment',
    title: 'Payment Released',
    message: 'The payment for Shipment #WA-901 has been processed by the bank.',
    time: '2 mins ago',
    read: false
  },
  {
    id: '2',
    type: 'bid',
    title: 'New Outbid Notice',
    message: 'A new high bid of ₹35/kg was placed for your Arabica Beans.',
    time: '45 mins ago',
    read: false
  },
  {
    id: '3',
    type: 'system',
    title: 'Bid Ending Soon',
    message: 'Your listing "Grade B Cocoa" expires in 2 hours.',
    time: '1 hour ago',
    read: false
  }
]

export const mockRequirements: Requirement[] = [
  {
    id: '1',
    title: 'Organic Tomatoes Needed',
    description: 'Looking for certified organic tomatoes for restaurant supply',
    quantity: '500 kg',
    budget: '₹40/kg',
    status: 'open',
    responses: 8,
    postedAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Wheat Flour Bulk Order',
    description: 'Large scale bakery requires premium wheat flour',
    quantity: '5 Tons',
    budget: '₹24/kg',
    status: 'fulfilled',
    responses: 15,
    postedAt: '2024-01-10'
  }
]

export const mockShipments: Shipment[] = [
{
id: '1',
product: 'Arabica Coffee',
from: 'Mumbai',
to: 'Chennai',
status: 'in_transit',
trackingNumber: 'TRK-2024-001',
estimatedDelivery: '2024-01-20',
driver: 'John Kamau',
vehicle: 'Toyota Hilux - KBC 123A'
},
{
id: '2',
product: 'Yellow Maize',
from: 'Pune',
to: 'Mumbai',
status: 'preparing',
trackingNumber: 'TRK-2024-002',
estimatedDelivery: '2024-01-22',
driver: 'Mary Wanjiku',
vehicle: 'Isuzu Truck - KCD 456B'
}
]

export const mockTransactions: Transaction[] = [
{
id: '1',
type: 'payment',
amount: '₹45,000.00',
description: 'Payment for Arabica Coffee - Order #1234',
status: 'completed',
date: '2024-01-15',
invoice: 'INV-2024-001'
},
{
id: '2',
type: 'refund',
amount: '₹8,500.00',
description: 'Refund for cancelled order - Order #1233',
status: 'pending',
date: '2024-01-14',
invoice: 'REF-2024-001'
},
{
id: '3',
type: 'payment',
amount: '₹28,000.00',
description: 'Payment for Yellow Maize - Order #1235',
status: 'in_escrow',
date: '2024-01-16',
invoice: 'INV-2024-002',
escrowReleaseDate: '2024-01-20'
},
{
id: '4',
type: 'payout',
amount: '₹35,000.00',
description: 'Monthly payout - January 2024',
status: 'completed',
date: '2024-01-31'
},
{
id: '5',
type: 'payment',
amount: '₹12,500.00',
description: 'Payment for Organic Tomatoes - Order #1236',
status: 'in_escrow',
date: '2024-01-17',
invoice: 'INV-2024-003',
escrowReleaseDate: '2024-01-22'
}
]

export const mockTransportListings: TransportListing[] = [
  {
    id: '1',
    serviceType: 'Refrigerated Transport',
    route: 'Mumbai to Chennai',
    vehicle: 'Refrigerated Truck - 20 Ton',
    capacity: '20 Tons',
    price: '₹22/kg',
    status: 'active',
    postedAt: '2024-01-15'
  },
  {
    id: '2',
    serviceType: 'Dry Goods Transport',
    route: 'Pune to Mumbai',
    vehicle: 'Flatbed Truck - 15 Ton',
    capacity: '15 Tons',
    price: '₹20/kg',
    status: 'active',
    postedAt: '2024-01-14'
  }
]

export const mockTransportRequests: TransportRequest[] = [
  {
    id: '1',
    product: 'Fresh Vegetables',
    from: 'Nagpur',
    to: 'Mumbai',
    quantity: '5 Tons',
    urgency: 'express',
    status: 'open',
    responses: 3,
    postedAt: '2024-01-16'
  },
  {
    id: '2',
    product: 'Building Materials',
    from: 'Chennai',
    to: 'Mumbai',
    quantity: '10 Tons',
    urgency: 'standard',
    status: 'accepted',
    responses: 5,
    postedAt: '2024-01-15'
  }
]

export const mockTransportQuotes: TransportQuote[] = [
  {
    id: '1',
    requestId: '1',
    price: '₹45,000.00',
    estimatedDelivery: '2024-01-18',
    vehicle: 'Refrigerated Truck - 10 Ton',
    status: 'pending',
    submittedAt: '2024-01-16'
  },
  {
    id: '2',
    requestId: '2',
    price: '₹65,000.00',
    estimatedDelivery: '2024-01-20',
    vehicle: 'Flatbed Truck - 15 Ton',
    status: 'accepted',
    submittedAt: '2024-01-15'
  }
]

// Role-specific dashboard configurations
export const farmerDashboardConfig: DashboardState = {
  tabs: {
    overview: true,
    listings: true,
    bids: false,
    requirements: false,
    logistics: false,
    orders: true,
    transactions: true,
    settings: true
  },
  user: {
    name: 'John Farmer',
    email: 'john.farmer@lokhari.com',
    verified: true,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtcgwObeViinNN0eoLWBwhhJ0GVy6Fb60CZTEB5YNI9pPmfAICJtPgUEEKnAbb3n2vXd1zqAcFit9CLpUsa3S_i_JOx0T9DWXhXN9TeO1Az3stLuWy2_epMdPJEC3zhh_jj9QrCdBgn7OOGXkqNmDrhyMO2LHUyI68R7llG227nMDW7_F1zLxQI3ovhA_b7OBauTXjBFpfPLxNwi2dZPNdcpQpv02nyAZVOvV1biO76xCpZDutKelMLqXbYGI2GjOHJyJZe8kskPo'
  },
  stats: {
    activeListings: 14,
    pendingBids: 0,
    ongoingShipments: 21,
    totalEarnings: 'Rs. 2.8L'
  }
}

export const traderDashboardConfig: DashboardState = {
  tabs: {
    overview: true,
    listings: false,
    bids: true,
    requirements: false,
    logistics: false,
    orders: true,
    transactions: true,
    settings: true
  },
  user: {
    name: 'Sarah Trader',
    email: 'sarah.trader@lokhari.com',
    verified: true,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtcgwObeViinNN0eoLWBwhhJ0GVy6Fb60CZTEB5YNI9pPmfAICJtPgUEEKnAbb3n2vXd1zqAcFit9CLpUsa3S_i_JOx0T9DWXhXN9TeO1Az3stLuWy2_epMdPJEC3zhh_jj9QrCdBgn7OOGXkqNmDrhyMO2LHUyI68R7llG227nMDW7_F1zLxQI3ovhA_b7OBauTXjBFpfPLxNwi2dZPNdcpQpv02nyAZVOvV1biO76xCpZDutKelMLqXbYGI2GjOHJyJZe8kskPo'
  },
  stats: {
    activeListings: 0,
    pendingBids: 42,
    ongoingShipments: 15,
    totalEarnings: '₹1.9L'
  }
}

export const warehouseDashboardConfig: DashboardState = {
  tabs: {
    overview: true,
    listings: true,
    bids: false,
    requirements: false,
    logistics: false,
    orders: true,
    transactions: true,
    settings: true
  },
  user: {
    name: 'Mike Warehouse',
    email: 'mike.warehouse@lokhari.com',
    verified: true,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtcgwObeViinNN0eoLWBwhhJ0GVy6Fb60CZTEB5YNI9pPmfAICJtPgUEEKnAbb3n2vXd1zqAcFit9CLpUsa3S_i_JOx0T9DWXhXN9TeO1Az3stLuWy2_epMdPJEC3zhh_jj9QrCdBgn7OOGXkqNmDrhyMO2LHUyI68R7llG227nMDW7_F1zLxQI3ovhA_b7OBauTXjBFpfPLxNwi2dZPNdcpQpv02nyAZVOvV1biO76xCpZDutKelMLqXbYGI2GjOHJyJZe8kskPo'
  },
  stats: {
    activeListings: 8,
    pendingBids: 0,
    ongoingShipments: 5,
    totalEarnings: '₹3.5L'
  }
}

export const transporterDashboardConfig: DashboardState = {
  tabs: {
    overview: true,
    listings: false,
    bids: false,
    requirements: false,
    logistics: true,
    orders: true,
    transactions: true,
    settings: true
  },
  user: {
    name: 'Tom Transporter',
    email: 'tom.transporter@lokhari.com',
    verified: true,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtcgwObeViinNN0eoLWBwhhJ0GVy6Fb60CZTEB5YNI9pPmfAICJtPgUEEKnAbb3n2vXd1zqAcFit9CLpUsa3S_i_JOx0T9DWXhXN9TeO1Az3stLuWy2_epMdPJEC3zhh_jj9QrCdBgn7OOGXkqNmDrhyMO2LHUyI68R7llG227nMDW7_F1zLxQI3ovhA_b7OBauTXjBFpfPLxNwi2dZPNdcpQpv02nyAZVOvV1biO76xCpZDutKelMLqXbYGI2GjOHJyJZe8kskPo'
  },
  stats: {
    activeListings: 0,
    pendingBids: 0,
    ongoingShipments: 35,
    totalEarnings: '₹1.6L'
  }
}
