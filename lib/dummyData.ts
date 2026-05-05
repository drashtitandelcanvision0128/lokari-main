export interface Listing {
  id: string
  title: string
  type: 'produce' | 'warehouse' | 'transport'
  category: string
  description: string
  price: number
  quantity: number
  unit: string
  location: string
  seller: {
    name: string
    rating: number
    verified: boolean
  }
  images: string[]
  postedAt: string
  status: 'active' | 'pending' | 'sold'
  bids?: Bid[]
  priceType?: 'fixed' | 'negotiable' | 'auction'
  auctionEnd?: string
  reservePrice?: number
  // Produce specific
  cropName?: string
  variety?: string
  qualityGrade?: string
  harvestDate?: string
  storageTemp?: string
  storageHumidity?: string
  minOrderQuantity?: number
  // Warehouse specific
  facilityName?: string
  storageTypes?: string[]
  capacity?: number
  availableCapacity?: number
  temperatureRange?: string
  pricingModel?: string
  availableFrom?: string
  availableTo?: string
  amenities?: string[]
  certifications?: string[]
  // Transport specific
  vehicleType?: string
  numberPlate?: string
  pricePerKm?: number
  refrigeration?: boolean
  routes?: {
    from: string
    to: string
  }
}

export interface Bid {
  id: string
  listingId: string
  bidder: {
    name: string
    rating: number
  }
  amount: number
  quantity: number
  message: string
  createdAt: string
  status: 'pending' | 'accepted' | 'rejected'
}

export interface Transaction {
  id: string
  listingId: string
  listingTitle: string
  buyer: {
    name: string
    rating: number
  }
  seller: {
    name: string
    rating: number
  }
  amount: number
  quantity: number
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled'
  escrowStatus: 'pending' | 'funded' | 'released' | 'disputed'
  createdAt: string
  updatedAt: string
  trackingNumber?: string
}

export interface User {
  id: string
  name: string
  email: string
  role: 'farmer' | 'trader' | 'warehouse' | 'transporter'
  rating: number
  verified: boolean
  location: string
  joinedAt: string
  listings: string[]
  transactions: string[]
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
}

// Dummy data
export const dummyListings: Listing[] = [
  {
    id: '1',
    title: 'Fresh Organic Tomatoes',
    type: 'produce',
    category: 'Vegetables',
    description: 'Premium quality organic tomatoes grown without pesticides. Perfect for restaurants and households.',
    price: 35.00,
    quantity: 500,
    unit: 'kg',
    location: 'Pune, Maharashtra',
    seller: {
      name: 'Green Valley Farms',
      rating: 4.8,
      verified: true
    },
    images: ['https://picsum.photos/seed/tomatoes/400/300.jpg'],
    postedAt: '2024-01-15T10:00:00Z',
    status: 'active',
    priceType: 'auction',
    auctionEnd: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
    bids: [
      {
        id: 'b1',
        listingId: '1',
        bidder: {
          name: 'Fresh Market Co',
          rating: 4.5
        },
        amount: 2.30,
        quantity: 200,
        message: 'Interested in bulk purchase for our stores',
        createdAt: '2024-01-15T14:30:00Z',
        status: 'pending'
      }
    ]
  },
  {
    id: '2',
    title: 'Premium Wheat Grains',
    type: 'produce',
    category: 'Grains',
    description: 'High-quality wheat grains suitable for flour production. Moisture content below 12%.',
    price: 25.00,
    quantity: 2000,
    unit: 'kg',
    location: 'Ahmedabad, Gujarat',
    seller: {
      name: 'Sunrise Agriculture',
      rating: 4.6,
      verified: true
    },
    images: ['wheat.jpg'],
    postedAt: '2024-01-14T09:00:00Z',
    status: 'active',
    priceType: 'fixed'
  },
  {
    id: '3',
    title: 'Cold Storage Warehouse',
    type: 'warehouse',
    category: 'Storage',
    description: 'Modern cold storage facility with temperature control. Available for agricultural produce.',
    price: 15.00,
    quantity: 1000,
    unit: 'sq ft',
    location: 'Jaipur, Rajasthan',
    seller: {
      name: 'Rajasthan Storage Solutions',
      rating: 4.7,
      verified: true
    },
    images: ['warehouse.jpg'],
    postedAt: '2024-01-13T11:00:00Z',
    status: 'active',
    priceType: 'fixed'
  },
  {
    id: '4',
    title: 'Refrigerated Transport Service',
    type: 'transport',
    category: 'Logistics',
    description: 'Refrigerated truck transport service available for perishable goods. Coverage across Midwest.',
    price: 1.20,
    quantity: 500,
    unit: 'mile',
    location: 'Karnataka, India',
    seller: {
      name: 'QuickHaul Logistics',
      rating: 4.4,
      verified: true
    },
    images: ['truck.jpg'],
    postedAt: '2024-01-12T16:00:00Z',
    status: 'active',
    priceType: 'fixed'
  },
  {
    id: '5',
    title: 'Organic Apples',
    type: 'produce',
    category: 'Fruits',
    description: 'Fresh organic apples, crisp and sweet. Perfect for direct consumption or processing.',
    price: 120.00,
    quantity: 300,
    unit: 'kg',
    location: 'Shimla, Himachal Pradesh',
    seller: {
      name: 'Orchard Heights Farm',
      rating: 4.9,
      verified: true
    },
    images: ['https://picsum.photos/seed/apples/400/300.jpg'],
    postedAt: '2024-01-11T08:00:00Z',
    status: 'active',
    priceType: 'fixed'
  },
  {
    id: '6',
    title: 'A-Grade Wheat',
    type: 'produce',
    category: 'Grains',
    description: 'Premium quality A-grade wheat harvest with excellent protein content. Ideal for flour production.',
    price: 2200.00,
    quantity: 450,
    unit: 'ton',
    location: 'Madhya Pradesh, Central India',
    seller: {
      name: 'Heartland Grain Co',
      rating: 4.7,
      verified: true
    },
    images: ['https://picsum.photos/seed/wheat/400/300.jpg'],
    postedAt: '2024-01-16T09:00:00Z',
    status: 'active',
    priceType: 'fixed'
  },
  {
    id: '7',
    title: 'Cold Storage Unit B-4',
    type: 'warehouse',
    category: 'Storage',
    description: 'Modern cold storage facility with -20°C deep freeze capability. Perfect for temperature-sensitive agricultural products.',
    price: 8500.00,
    quantity: 12000,
    unit: 'cu ft',
    location: 'Mumbai Port, Maharashtra',
    seller: {
      name: 'Pacific Cold Storage',
      rating: 4.8,
      verified: true
    },
    images: ['cold-storage.jpg'],
    postedAt: '2024-01-15T14:00:00Z',
    status: 'active',
    priceType: 'fixed'
  },
  {
    id: '8',
    title: 'Bulk Grain Hauler',
    type: 'transport',
    category: 'Logistics',
    description: 'Pneumatic tanker truck service for bulk grain transport. Immediate availability for regional Midwest routes.',
    price: 25.00,
    quantity: 1,
    unit: 'mi',
    location: 'Delhi-Mumbai Industrial Corridor',
    seller: {
      name: 'Midwest Hauling Inc',
      rating: 4.6,
      verified: true
    },
    images: ['grain-truck.jpg'],
    postedAt: '2024-01-14T11:00:00Z',
    status: 'active',
    priceType: 'fixed'
  },
  // Demo Auction Listings
  {
    id: '9',
    title: 'Premium Organic Corn - Live Auction',
    type: 'produce',
    category: 'Grains',
    description: 'High-quality organic corn harvest, non-GMO certified. Perfect for direct consumption or processing. Current bid active!',
    price: 22.00,
    quantity: 1500,
    unit: 'kg',
    location: 'Punjab, India',
    seller: {
      name: 'Golden Fields Farm',
      rating: 4.9,
      verified: true
    },
    images: ['corn.jpg'],
    postedAt: '2024-01-17T08:00:00Z',
    status: 'active',
    priceType: 'auction',
    auctionEnd: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    reservePrice: 25.00,
    cropName: 'Corn',
    variety: 'Golden Sweet',
    qualityGrade: 'Premium',
    harvestDate: '2024-01-15',
    storageTemp: '4°C',
    minOrderQuantity: 100,
    bids: [
      {
        id: 'b2',
        listingId: '9',
        bidder: {
          name: 'Fresh Market Co',
          rating: 4.5
        },
        amount: 0.82,
        quantity: 500,
        message: 'Competitive bid for retail distribution',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        status: 'pending'
      },
      {
        id: 'b3',
        listingId: '9',
        bidder: {
          name: 'Global Food Traders',
          rating: 4.7
        },
        amount: 0.88,
        quantity: 800,
        message: 'Strong bid for international export',
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
        status: 'pending'
      }
    ]
  },
  {
    id: '10',
    title: 'Heritage Potatoes - Auction Ending Soon',
    type: 'produce',
    category: 'Vegetables',
    description: 'Rare heritage variety potatoes, organically grown. Excellent for gourmet restaurants. Auction ends in 1 hour!',
    price: 1.20,
    quantity: 800,
    unit: 'kg',
    location: 'Uttarakhand, India',
    seller: {
      name: 'Mountain Valley Farms',
      rating: 4.8,
      verified: true
    },
    images: ['potatoes.jpg'],
    postedAt: '2024-01-17T06:00:00Z',
    status: 'active',
    priceType: 'auction',
    auctionEnd: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
    reservePrice: 40.00,
    cropName: 'Potatoes',
    variety: 'Heritage Russet',
    qualityGrade: 'A-Grade',
    harvestDate: '2024-01-16',
    storageTemp: '8°C',
    minOrderQuantity: 50,
    bids: [
      {
        id: 'b4',
        listingId: '10',
        bidder: {
          name: 'Gourmet Kitchen Supply',
          rating: 4.6
        },
        amount: 1.25,
        quantity: 300,
        message: 'Premium bid for restaurant chain',
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
        status: 'pending'
      },
      {
        id: 'b5',
        listingId: '10',
        bidder: {
          name: 'Organic Food Distributors',
          rating: 4.9
        },
        amount: 1.32,
        quantity: 400,
        message: 'Final bid for organic market',
        createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(), // 20 minutes ago
        status: 'pending'
      },
      {
        id: 'b6',
        listingId: '10',
        bidder: {
          name: 'Farm-to-Table Co',
          rating: 4.4
        },
        amount: 1.28,
        quantity: 200,
        message: 'Bid for local distribution',
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
        status: 'pending'
      }
    ]
  },
  {
    id: '11',
    title: 'Fresh Strawberries - Hot Auction',
    type: 'produce',
    category: 'Fruits',
    description: 'Sweet, juicy strawberries picked this morning. Perfect for desserts and direct consumption. Multiple active bids!',
    price: 85.00,
    quantity: 200,
    unit: 'kg',
    location: 'Pune, Maharashtra',
    seller: {
      name: 'Berry Sweet Farms',
      rating: 4.7,
      verified: true
    },
    images: ['strawberries.jpg'],
    postedAt: '2024-01-17T09:30:00Z',
    status: 'active',
    priceType: 'auction',
    auctionEnd: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
    reservePrice: 90.00,
    cropName: 'Strawberries',
    variety: 'Albion',
    qualityGrade: 'Premium',
    harvestDate: '2024-01-17',
    storageTemp: '2°C',
    minOrderQuantity: 25,
    bids: [
      {
        id: 'b7',
        listingId: '11',
        bidder: {
          name: 'Sweet Treats Bakery',
          rating: 4.8
        },
        amount: 3.60,
        quantity: 100,
        message: 'Need for premium dessert line',
        createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 minutes ago
        status: 'pending'
      },
      {
        id: 'b8',
        listingId: '11',
        bidder: {
          name: 'Fresh Market Chain',
          rating: 4.5
        },
        amount: 3.72,
        quantity: 150,
        message: 'Competitive bid for retail',
        createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(), // 12 minutes ago
        status: 'pending'
      }
    ]
  },
  {
    id: '12',
    title: 'Durum Wheat',
    type: 'produce',
    category: 'Grains',
    description: 'Premium quality durum wheat with high protein content. Ideal for pasta and semolina production.',
    price: 34860.00,
    quantity: 120,
    unit: 'ton',
    location: 'Punjab, IN',
    seller: {
      name: 'Punjab Grain Mills',
      rating: 4.7,
      verified: true
    },
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuBbWL41VUZZ52UwNK1jj17RrN8lpBtb1htUK7daWe1IrGt5N0il31C-eNG6NIsMAC-N-mUndYLUB_rgwRaOkiLtVHfHkBmsj8h-TsfMCmoomYrfNH2mEaPURld9oYV_JiK4vL33l6sU9GRTYKm5kaqY3S7O_6nn1zT1TDAQ0evz5CCZCynv7-Zx0JalKFQU6-qYcZhe485imaPu68X9jQmL49c_0U7baWRRpMRlo1PYCXyTMslox9ujgGIgZBT1STrVRQ-p3HoQUIk'],
    postedAt: '2024-01-17T10:00:00Z',
    status: 'active',
    priceType: 'fixed',
    cropName: 'Wheat',
    variety: 'Durum',
    qualityGrade: 'Premium Grade',
    harvestDate: '2024-01-10',
    storageTemp: 'Room temperature',
    minOrderQuantity: 10
  },
  {
    id: '13',
    title: 'Mustard Seed',
    type: 'produce',
    category: 'Grains',
    description: 'High-quality mustard seeds with excellent oil content. Perfect for oil extraction and spice production.',
    price: 48140.00,
    quantity: 45,
    unit: 'ton',
    location: 'Rajasthan, IN',
    seller: {
      name: 'Rajasthan Spices Co',
      rating: 4.6,
      verified: true
    },
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuCntfrXe0AmTNrDTTb4AjIFxLuEyWdCrkBnDXNE9crfFkdxjtdpC-_XltQKkDMflv7hjzUFnh7M0zKmLNoCRMWzwso9mKgh1AGDWVm36nh5F6je8ESXOdMB1mebnI4XRlxTjXZ7RvQsxDnHdwZwOziTBLN1zI3a25gdr-6cILW0TYRiZ5IkHlEdUosRr_BSRjKF4HuCRZQNMttAtzwtMiWmVxdr-BBrMesCd59B3oijDtgI9PP1BMsEXkntrh5veiQzyxlzVMip5yc'],
    postedAt: '2024-01-17T08:30:00Z',
    status: 'active',
    priceType: 'fixed',
    cropName: 'Mustard',
    variety: 'Yellow Mustard',
    qualityGrade: 'A-Grade',
    harvestDate: '2024-01-12',
    storageTemp: 'Room temperature',
    minOrderQuantity: 5
  },
  {
    id: '14',
    title: 'Cold Storage Unit 4',
    type: 'warehouse',
    category: 'Storage',
    description: 'Modern cold storage facility with temperature control and humidity monitoring. Available for immediate use.',
    price: 996.00,
    quantity: 2500,
    unit: 'sq ft',
    location: 'Gujarat, IN',
    seller: {
      name: 'Gujarat Cold Chain',
      rating: 4.8,
      verified: true
    },
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuCXeDmeZwUegHs4iiR1A4KGm3uwoQDIMOQzG0fx9cLfmbP3N730p_wLe9VI6mIoVHemgC_Jp1LK-VRxnRfoGRgYIXXeW8V7qaV49gPeTBiFNYzwDiU71tuWMdjJW5DWHDgQ0SoQYGCYEoP9tmp72XqFcAk90UYl8jMfOab0jsFwUTEnQz4cwTb2_EeNwyVPcQCPtLuehFGyBv9DE29nKay5zF1LoMYuI4XtEGsEGIvDcwmniOqSAAyBEQ-NhrN5ntutsuc9B9_hXcI'],
    postedAt: '2024-01-16T14:00:00Z',
    status: 'active',
    priceType: 'fixed',
    facilityName: 'Cold Storage Unit 4',
    storageTypes: ['Cold Storage', 'Temperature Controlled'],
    capacity: 5000,
    availableCapacity: 2500,
    temperatureRange: '-2°C to 4°C',
    pricingModel: 'Per Square Foot',
    availableFrom: '2024-01-16',
    availableTo: '2024-12-31',
    amenities: ['24/7 Security', 'Backup Power', 'Pest Control', 'Fire Safety'],
    certifications: ['FSSAI', 'ISO 22000']
  },
  {
    id: '15',
    title: 'Basmati Rice (Long)',
    type: 'produce',
    category: 'Grains',
    description: 'Premium long-grain basmati rice with exceptional aroma and taste. Aged to perfection for best cooking results.',
    price: 91300.00,
    quantity: 300,
    unit: 'ton',
    location: 'Haryana, IN',
    seller: {
      name: 'Haryana Rice Exporters',
      rating: 4.9,
      verified: true
    },
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuCrv1X4l-V9Y-DM5LgGI6TVIvBNMLTcdRTNG8HWlutEt-VFFvlSiqTg6JNz3D9dl5gkd5Z4Hsu7x-Wx7jLswA2uWVJF2-cw4Ny9qdzcimgA5jWyYgelBZT7HgcVsfJ-oOpbYMlbSURsEtz74R5yD16eoYFVpvk_Y4Azx8jmTNldB9xhvRgdZSUduNsha7K6WjHJ6djkjkkijcDdfMp3RVBf_9nzMXifRgtDhl0LEzFUBdUiY259Sp_8qVnetbPUyb_MzfvfSG3Xxbs'],
    postedAt: '2024-01-17T09:00:00Z',
    status: 'active',
    priceType: 'fixed',
    cropName: 'Rice',
    variety: 'Basmati Long Grain',
    qualityGrade: 'Premium Export Quality',
    harvestDate: '2024-01-08',
    storageTemp: 'Room temperature',
    minOrderQuantity: 25
  },
  {
    id: '16',
    title: 'Premium Soybeans - Fixed Price Deal',
    type: 'produce',
    category: 'Grains',
    description: 'High-protein soybeans perfect for oil extraction and animal feed. Available for immediate purchase at fixed price.',
    price: 28.00,
    quantity: 3000,
    unit: 'kg',
    location: 'Karnataka, India',
    seller: {
      name: 'Prairie Grain Co',
      rating: 4.6,
      verified: true
    },
    images: ['soybeans.jpg'],
    postedAt: '2024-01-17T07:00:00Z',
    status: 'active',
    priceType: 'fixed',
    cropName: 'Soybeans',
    variety: 'High-Protein',
    qualityGrade: 'Grade A',
    harvestDate: '2024-01-14',
    storageTemp: 'Room temperature',
    minOrderQuantity: 500
  }
]

export const dummyTransactions: Transaction[] = [
  {
    id: 't1',
    listingId: '5',
    listingTitle: 'Organic Apples',
    buyer: {
      name: 'Healthy Foods Inc',
      rating: 4.6
    },
    seller: {
      name: 'Orchard Heights Farm',
      rating: 4.9
    },
    amount: 960,
    quantity: 300,
    status: 'in_transit',
    escrowStatus: 'funded',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T14:00:00Z',
    trackingNumber: 'TRK123456789'
  },
  {
    id: 't2',
    listingId: '1',
    listingTitle: 'Fresh Organic Tomatoes',
    buyer: {
      name: 'Restaurant Supply Co',
      rating: 4.3
    },
    seller: {
      name: 'Green Valley Farms',
      rating: 4.8
    },
    amount: 500,
    quantity: 200,
    status: 'completed',
    escrowStatus: 'released',
    createdAt: '2024-01-05T09:00:00Z',
    updatedAt: '2024-01-08T16:00:00Z'
  },
  {
    id: 't3',
    listingId: '3',
    listingTitle: 'Cold Storage Warehouse',
    buyer: {
      name: 'Farm Fresh Produce',
      rating: 4.7
    },
    seller: {
      name: 'Rajasthan Storage Solutions',
      rating: 4.7
    },
    amount: 100,
    quantity: 1000,
    status: 'pending',
    escrowStatus: 'pending',
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2024-01-15T11:00:00Z'
  }
]

export const dummyUser: User = {
  id: 'u1',
  name: 'John Farmer',
  email: 'john@lokhari.com',
  role: 'farmer',
  rating: 4.8,
  verified: true,
  location: 'Pune, Maharashtra',
  joinedAt: '2023-06-15T00:00:00Z',
  listings: ['1', '2'],
  transactions: ['t1', 't2']
}

export const dummyNotifications: Notification[] = [
  {
    id: 'n1',
    userId: 'u1',
    title: 'New Bid Received',
    message: 'Fresh Market Co placed a bid on your listing "Fresh Organic Tomatoes"',
    type: 'info',
    read: false,
    createdAt: '2024-01-15T14:30:00Z'
  },
  {
    id: 'n2',
    userId: 'u1',
    title: 'Payment Released',
    message: 'Payment for transaction #t2 has been released to your account',
    type: 'success',
    read: false,
    createdAt: '2024-01-08T16:00:00Z'
  },
  {
    id: 'n3',
    userId: 'u1',
    title: 'Listing Sold',
    message: 'Your listing "Organic Apples" has been sold successfully',
    type: 'success',
    read: true,
    createdAt: '2024-01-10T10:00:00Z'
  },
  {
    id: 'n4',
    userId: 'u1',
    title: 'Profile Verification',
    message: 'Your profile has been verified. You now have a verified badge',
    type: 'success',
    read: true,
    createdAt: '2023-06-20T09:00:00Z'
  }
]
