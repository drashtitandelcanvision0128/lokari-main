import { AdminState, AdminUser, AdminListing, AdminOrder, AdminDispute, AdminAnalytics, AuditLogEntry } from '@/types/admin'

export const adminMock: AdminState = {
  tabs: {
    users: true,
    listings: true,
    orders: true,
    disputes: true,
    analytics: true,
    auditLog: true
  },
  user: {
    name: 'Admin User',
    email: 'admin@lokhari.com',
    role: 'Super Admin',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfWPT6QAYBEZkuMNEn5m9N_AOIzGZa3Dl1isEA9nQh_7jcLBebQ2UzcD1_5a6jfsl9T9KV8WEVLpuvJD4xWuWV8nnE0JWK4gvnmP2fAetJpjQOYI0ItmL5-4_sWZVAwY9No8jk_QgFxKbu0YtFuqNUTHSrV3D7FBrPrDpdGnpPN5tF9pP8u_27MG5OtyuQqjr04WZ0uDQGnY4MNCNVQykr6n5prGY8ifKAZbs8qMH-16KevbRHjD2B07Ja0nv74Lzf-B_tuBIQBZ4'
  },
  stats: {
    totalUsers: 1247,
    activeUsers: 342,
    totalListings: 892,
    pendingListings: 23,
    totalOrders: 456,
    disputedOrders: 5,
    totalRevenue: 125430.50,
    monthlyGrowth: 12.5
  }
}

export const mockAdminUsers: AdminUser[] = [
  {
    id: '1',
    name: 'John Farmer',
    email: 'john.farmer@lokhari.com',
    role: 'farmer',
    status: 'active',
    joinedAt: '2024-01-15',
    lastActive: '2024-01-20T10:30:00Z',
    listings: 12,
    orders: 45,
    revenue: '₹4,50,000',
    verificationStatus: 'verified',
    phone: '+254 712 345 678',
    location: 'Nairobi, Kenya',
    createdAt: 'string'
  },
  {
    id: '2',
    name: 'Sarah Trader',
    email: 'sarah.trader@lokhari.com',
    role: 'trader',
    status: 'active',
    joinedAt: '2024-01-20',
    lastActive: '2024-01-20T09:15:00Z',
    listings: 0,
    orders: 89,
    revenue: '₹3,20,000',
    verificationStatus: 'verified',
    phone: '+254 723 456 789',
    location: 'Chennai, Tamil Nadu',
    createdAt: 'string'
  },
  {
    id: '3',
    name: 'Mike Warehouse',
    email: 'mike.warehouse@lokhari.com',
    role: 'warehouse',
    status: 'pending',
    joinedAt: '2024-02-01',
    lastActive: '2024-01-19T14:20:00Z',
    listings: 5,
    orders: 12,
    revenue: '₹1,25,000',
    verificationStatus: 'pending',
    phone: '+254 734 567 890',
    location: 'Kisumu, Kenya',
    createdAt: 'string'
  },
  {
    id: '4',
    name: 'Lisa Transport',
    email: 'lisa.transport@lokhari.com',
    role: 'transporter',
    status: 'active',
    joinedAt: '2024-02-10',
    lastActive: '2024-01-20T11:45:00Z',
    listings: 8,
    orders: 67,
    revenue: '₹2,80,000',
    verificationStatus: 'verified',
    phone: '+254 745 678 901',
    location: 'Nakuru, Kenya',
    createdAt: 'string'
  },
  {
    id: '5',
    name: 'James Farmer',
    email: 'james.farmer@lokhari.com',
    role: 'farmer',
    status: 'suspended',
    joinedAt: '2024-01-05',
    lastActive: '2024-01-10T16:30:00Z',
    listings: 3,
    orders: 8,
    revenue: '₹45,000',
    verificationStatus: 'unverified',
    phone: '+254 756 789 012',
    location: 'Indore, Madhya Pradesh',
    createdAt: 'string'
  },
  {
    id: '6',
    name: 'Grace Trader',
    email: 'grace.trader@lokhari.com',
    role: 'trader',
    status: 'active',
    joinedAt: '2024-01-25',
    lastActive: '2024-01-20T08:00:00Z',
    listings: 0,
    orders: 34,
    revenue: '₹1,85,000',
    verificationStatus: 'verified',
    phone: '+254 767 890 123',
    location: 'Surat, Gujarat',
    createdAt: 'string'
  }
]

export const mockAdminListings: AdminListing[] = [
  {
    id: '1',
    title: 'Premium Arabica Coffee Beans',
    description: 'Grade A1, Moisture 12%, Sun-dried, Premium quality from central Kenya highlands',
    category: 'produce',
    seller: {
      id: '1',
      name: 'John Farmer',
      email: 'john.farmer@lokhari.com',
      location: 'Mumbai, Maharashtra',
    },
    price: 257.30,
    unit: 'kg',
    quantity: 500,
    location: 'Mumbai, Maharashtra',
    status: 'pending',
    createdAt: '2024-01-15',
    expiresAt: '2024-02-15',
    views: 145,
    inquiries: 8,
    reports: 0,
    featured: false,
    isBlocked: false,
    images: ['https://example.com/coffee1.jpg', 'https://example.com/coffee2.jpg']
  },
  {
    id: '2',
    title: 'Yellow Maize Bulk Harvest',
    description: 'Dry, well-graded yellow maize suitable for both human consumption and animal feed',
    category: 'produce',
    seller: {
      id: '1',
      name: 'John Farmer',
      email: 'john.farmer@lokhari.com',
      location: 'Mumbai, Maharashtra',
    },
    price: 120.35,
    unit: 'kg',
    quantity: 2500,
    location: 'Mumbai, Maharashtra',
    status: 'active',
    createdAt: '2024-01-14',
    expiresAt: '2024-02-14',
    views: 89,
    inquiries: 5,
    reports: 0,
    featured: true,
    isBlocked: false,
    images: ['https://example.com/maize1.jpg']
  },
  {
    id: '3',
    title: 'Climate-Controlled Warehouse Space',
    description: '1000 sq ft climate-controlled storage facility with 24/7 security and monitoring',
    category: 'warehouse',
    seller: {
      id: '3',
      name: 'Mike Warehouse',
      email: 'mike.warehouse@lokhari.com',
      location: 'Ahmedabad, Gujarat',
    },
    price: 41500,
    unit: 'month',
    quantity: 1,
    location: 'Pune, Maharashtra',
    status: 'flagged',
    createdAt: '2024-01-12',
    expiresAt: '2024-04-12',
    views: 67,
    inquiries: 2,
    reports: 1,
    featured: false,
    isBlocked: false,
    images: ['https://example.com/warehouse1.jpg', 'https://example.com/warehouse2.jpg']
  },
  {
    id: '4',
    title: 'Refrigerated Transport Service',
    description: 'Cold chain logistics for perishable goods, temperature controlled transport',
    category: 'transport',
    seller: {
      id: '4',
      name: 'Lisa Transport',
      email: 'lisa.transport@lokhari.com',
      location: 'Delhi, NCR',
    },
    price: 41.50,
    unit: 'km',
    quantity: 1,
    location: 'Nagpur, Maharashtra',
    status: 'active',
    createdAt: '2024-01-11',
    expiresAt: '2024-04-11',
    views: 124,
    inquiries: 6,
    reports: 0,
    featured: false,
    isBlocked: false,
    images: ['https://example.com/truck1.jpg']
  },
  {
    id: '5',
    title: 'Organic Tomatoes Fresh Harvest',
    description: 'Greenhouse grown, certified organic, no pesticides, perfect for restaurants',
    category: 'produce',
    seller: {
      id: '1',
      name: 'John Farmer',
      email: 'john.farmer@lokhari.com',
      location: 'Mumbai, Maharashtra',
    },
    price: 182.60,
    unit: 'kg',
    quantity: 200,
    location: 'Mumbai, Maharashtra',
    status: 'rejected',
    createdAt: '2024-01-05',
    expiresAt: '2024-02-05',
    views: 45,
    inquiries: 1,
    reports: 2,
    featured: false,
    isBlocked: false,
    images: ['https://example.com/tomatoes1.jpg']
  }
]

export const mockAdminOrders: AdminOrder[] = [
  {
    id: 'ORD-001',
    listingId: '1',
    listingTitle: 'Premium Arabica Coffee Beans',
    buyer: {
      id: '2',
      name: 'Sarah Trader',
      email: 'sarah.trader@lokhari.com'
    },
    seller: {
      id: '1',
      name: 'John Farmer',
      email: 'john.farmer@lokhari.com'
    },
    quantity: 100,
    unitPrice: 35.00,
    totalAmount: 3500.00,
    status: 'confirmed',
    paymentStatus: 'in_escrow',
    createdAt: '2024-01-18',
    updatedAt: '2024-01-19',
    deliveryDate: '2024-01-25',
    trackingNumber: 'TRK-2024-001'
  },
  {
    id: 'ORD-002',
    listingId: '2',
    listingTitle: 'Yellow Maize Bulk Harvest',
    buyer: {
      id: '6',
      name: 'Grace Trader',
      email: 'grace.trader@lokhari.com'
    },
    seller: {
      id: '1',
      name: 'John Farmer',
      email: 'john.farmer@lokhari.com'
    },
    quantity: 500,
    unitPrice: 25.00,
    totalAmount: 12500.00,
    status: 'shipped',
    paymentStatus: 'released',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    deliveryDate: '2024-01-22',
    trackingNumber: 'TRK-2024-002'
  },
  {
    id: 'ORD-003',
    listingId: '3',
    listingTitle: 'Climate-Controlled Warehouse Space',
    buyer: {
      id: '2',
      name: 'Sarah Trader',
      email: 'sarah.trader@lokhari.com'
    },
    seller: {
      id: '3',
      name: 'Mike Warehouse',
      email: 'mike.warehouse@lokhari.com'
    },
    quantity: 1,
    unitPrice: 12000.00,
    totalAmount: 12000.00,
    status: 'disputed',
    paymentStatus: 'in_escrow',
    createdAt: '2024-01-16',
    updatedAt: '2024-01-19',
    disputeId: 'DSP-001'
  },
  {
    id: 'ORD-004',
    listingId: '4',
    listingTitle: 'Refrigerated Transport Service',
    buyer: {
      id: '6',
      name: 'Grace Trader',
      email: 'grace.trader@lokhari.com'
    },
    seller: {
      id: '4',
      name: 'Lisa Transport',
      email: 'lisa.transport@lokhari.com'
    },
    quantity: 150,
    unitPrice: 18.00,
    totalAmount: 2700.00,
    status: 'delivered',
    paymentStatus: 'released',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18',
    deliveryDate: '2024-01-17',
    trackingNumber: 'TRK-2024-003'
  },
  {
    id: 'ORD-005',
    listingId: '1',
    listingTitle: 'Premium Arabica Coffee Beans',
    buyer: {
      id: '6',
      name: 'Grace Trader',
      email: 'grace.trader@lokhari.com'
    },
    seller: {
      id: '1',
      name: 'John Farmer',
      email: 'john.farmer@lokhari.com'
    },
    quantity: 50,
    unitPrice: 35.00,
    totalAmount: 1750.00,
    status: 'cancelled',
    paymentStatus: 'refunded',
    createdAt: '2024-01-08',
    updatedAt: '2024-01-12'
  }
]

export const mockAdminDisputes: AdminDispute[] = [
  {
    id: 'DSP-001',
    orderId: 'ORD-003',
    orderTitle: 'Climate-Controlled Warehouse Space',
    type: 'quality',
    status: 'open',
    priority: 'high',
    raisedBy: {
      id: '2',
      name: 'Sarah Trader',
      email: 'sarah.trader@lokhari.com',
      role: 'trader'
    },
    against: {
      id: '3',
      name: 'Mike Warehouse',
      email: 'mike.warehouse@lokhari.com',
      role: 'warehouse'
    },
    description: 'The warehouse space does not match the description. Temperature control is not working properly and there are security issues.',
    evidence: ['https://example.com/evidence1.jpg', 'https://example.com/evidence2.pdf'],
    createdAt: '2024-01-19',
    updatedAt: '2024-01-19',
    assignedTo: 'Admin User'
  },
  {
    id: 'DSP-002',
    orderId: 'ORD-001',
    orderTitle: 'Premium Arabica Coffee Beans',
    type: 'delivery',
    status: 'investigating',
    priority: 'medium',
    raisedBy: {
      id: '2',
      name: 'Sarah Trader',
      email: 'sarah.trader@lokhari.com',
      role: 'trader'
    },
    against: {
      id: '1',
      name: 'John Farmer',
      email: 'john.farmer@lokhari.com',
      role: 'farmer'
    },
    description: 'Delivery is delayed beyond the agreed date. No communication from seller regarding the delay.',
    evidence: ['https://example.com/chat_screenshot.png'],
    createdAt: '2024-01-18',
    updatedAt: '2024-01-20',
    assignedTo: 'Admin User'
  },
  {
    id: 'DSP-003',
    orderId: 'ORD-004',
    orderTitle: 'Refrigerated Transport Service',
    type: 'payment',
    status: 'resolved',
    priority: 'low',
    raisedBy: {
      id: '4',
      name: 'Lisa Transport',
      email: 'lisa.transport@lokhari.com',
      role: 'transporter'
    },
    against: {
      id: '6',
      name: 'Grace Trader',
      email: 'grace.trader@lokhari.com',
      role: 'trader'
    },
    description: 'Payment was not released on time despite successful delivery.',
    evidence: ['https://example.com/delivery_proof.jpg'],
    createdAt: '2024-01-17',
    updatedAt: '2024-01-19',
    resolvedAt: '2024-01-19',
    resolution: 'Payment released after verification of delivery proof.',
    assignedTo: 'Admin User'
  }
]

export const mockAdminAnalytics: AdminAnalytics = {
  overview: {
    totalRevenue: 125430.50,
    revenueGrowth: 12.5,
    activeUsers: 342,
    userGrowth: 8.3,
    totalTransactions: 456,
    transactionGrowth: 15.2,
    conversionRate: 3.8,
    avgOrderValue: 275.20
  },
  charts: {
    revenueChart: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [85000, 92000, 98000, 105000, 118000, 125430]
    },
    userGrowthChart: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [180, 220, 265, 298, 315, 342]
    },
    categoryBreakdown: {
      categories: ['Produce', 'Warehouse', 'Transport'],
      data: [65, 20, 15]
    }
  },
  topPerformers: {
    users: mockAdminUsers.slice(0, 3),
    listings: mockAdminListings.slice(0, 3)
  }
}

export const mockAuditLog: AuditLogEntry[] = [
  {
    id: 'LOG-001',
    userId: '1',
    userName: 'John Farmer',
    action: 'Created Listing',
    resource: 'Listing',
    resourceId: '1',
    details: 'Created new listing: Premium Arabica Coffee Beans',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: '2024-01-20T10:30:00Z',
    severity: 'info',
    category: 'listing'
  },
  {
    id: 'LOG-002',
    userId: '2',
    userName: 'Sarah Trader',
    action: 'Placed Order',
    resource: 'Order',
    resourceId: 'ORD-001',
    details: 'Placed order for 100kg of Premium Arabica Coffee Beans',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    timestamp: '2024-01-20T09:15:00Z',
    severity: 'info',
    category: 'order'
  },
  {
    id: 'LOG-003',
    userId: '3',
    userName: 'Mike Warehouse',
    action: 'Account Suspended',
    resource: 'User',
    resourceId: '3',
    details: 'Account suspended due to verification issues',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    timestamp: '2024-01-19T14:20:00Z',
    severity: 'warning',
    category: 'user'
  },
  {
    id: 'LOG-004',
    userId: 'system',
    userName: 'System',
    action: 'Payment Processed',
    resource: 'Payment',
    resourceId: 'PAY-001',
    details: 'Payment of ₹25,000 processed and placed in escrow',
    ipAddress: '127.0.0.1',
    userAgent: 'System',
    timestamp: '2024-01-19T16:45:00Z',
    severity: 'info',
    category: 'payment'
  },
  {
    id: 'LOG-005',
    userId: '2',
    userName: 'Sarah Trader',
    action: 'Dispute Raised',
    resource: 'Dispute',
    resourceId: 'DSP-001',
    details: 'Raised dispute regarding warehouse quality issues',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    timestamp: '2024-01-19T18:30:00Z',
    severity: 'warning',
    category: 'order'
  },
  {
    id: 'LOG-006',
    userId: 'admin',
    userName: 'Admin User',
    action: 'Login Attempt Failed',
    resource: 'Authentication',
    resourceId: 'AUTH-001',
    details: 'Failed login attempt from unknown IP address',
    ipAddress: '10.0.0.50',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: '2024-01-19T20:15:00Z',
    severity: 'error',
    category: 'security'
  },
  {
    id: 'LOG-007',
    userId: 'system',
    userName: 'System',
    action: 'Database Backup',
    resource: 'System',
    resourceId: 'BACKUP-001',
    details: 'Scheduled database backup completed successfully',
    ipAddress: '127.0.0.1',
    userAgent: 'System',
    timestamp: '2024-01-20T02:00:00Z',
    severity: 'info',
    category: 'system'
  }
]
