export type AdminTabs = {
  users: boolean
  listings: boolean
  orders: boolean
  disputes: boolean
  analytics: boolean
  auditLog: boolean
}

export type AdminState = {
  tabs: AdminTabs
  user: {
    name: string
    email: string
    role: string
    avatar?: string
  }
  stats: {
    totalUsers: number
    activeUsers: number
    totalListings: number
    pendingListings: number
    totalOrders: number
    disputedOrders: number
    totalRevenue: number
    monthlyGrowth: number
  }
}

export type TabType = keyof AdminTabs

export type AdminUser = {
  id: string
  name: string
  email: string
  role: 'farmer' | 'trader' | 'warehouse' | 'transporter' | 'admin'
  status: 'active' | 'pending' | 'suspended' | 'banned'
  joinedAt: string
  lastActive: string
  listings: number
  orders: number
  revenue: string
  verificationStatus: 'verified' | 'pending' | 'unverified'
  phone?: string
  location?: string
  createdAt: string
}

export type AdminListing = {
  id: string
  title: string
  description: string
  category: 'produce' | 'warehouse' | 'transport'
  seller: {
    id: string
    name: string
    email: string
    location: string
  }
  price: number
  unit: string
  quantity: number
  location: string
  status: 'active' | 'pending' | 'approved' | 'rejected' | 'expired' | 'flagged'
  isBlocked: boolean
  createdAt: string
  expiresAt: string
  views: number
  inquiries: number
  reports: number
  featured: boolean
  image?: string;
  images?: string[]
}

export type AdminOrder = {
  id: string
  listingId: string
  listingTitle: string
  buyer: {
    id: string
    name: string
    email: string
  }
  seller: {
    id: string
    name: string
    email: string
  }
  quantity: number
  unitPrice: number
  totalAmount: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'disputed'
  paymentStatus: 'pending' | 'paid' | 'in_escrow' | 'released' | 'refunded'
  createdAt: string
  updatedAt: string
  deliveryDate?: string
  trackingNumber?: string
  disputeId?: string
}

export type AdminDispute = {
  id: string
  orderId: string
  orderTitle: string
  type: 'quality' | 'delivery' | 'payment' | 'fraud' | 'other'
  status: 'open' | 'investigating' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  raisedBy: {
    id: string
    name: string
    email: string
    role: string
  }
  against: {
    id: string
    name: string
    email: string
    role: string
  }
  description: string
  evidence: string[]
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  resolution?: string
  assignedTo?: string
}

export type AdminAnalytics = {
  overview: {
    totalRevenue: number
    revenueGrowth: number
    activeUsers: number
    userGrowth: number
    totalTransactions: number
    transactionGrowth: number
    conversionRate: number
    avgOrderValue: number
  }
  charts: {
    revenueChart: {
      labels: string[]
      data: number[]
    }
    userGrowthChart: {
      labels: string[]
      data: number[]
    }
    categoryBreakdown: {
      categories: string[]
      data: number[]
    }
  }
  topPerformers: {
    users: AdminUser[]
    listings: AdminListing[]
  }
}

export type AuditLogEntry = {
  id: string
  userId?: string
  userName?: string
  action: string
  resource: string
  resourceId: string
  details: string
  ipAddress: string
  userAgent: string
  timestamp: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  category: 'user' | 'listing' | 'order' | 'payment' | 'system' | 'security'
}
