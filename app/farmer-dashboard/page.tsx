'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { OverviewPage } from '@/components/dashboard/pages/OverviewPage'
import { ListingsPage } from '@/components/dashboard/pages/ListingsPage'
import { OrdersPage } from '@/components/dashboard/pages/OrdersPage'
import { TransactionsPage } from '@/components/dashboard/pages/TransactionsPage'
import { SettingsPage } from '@/components/dashboard/pages/SettingsPage'
import { farmerDashboardConfig } from '@/data/dashboardMock'
import { TabType } from '@/types/dashboard'
import { getCurrentUser, getUserDisplayName } from '@/lib/auth'
import { type User } from '@/lib/registration'
import { useRoleGuard } from '@/lib/authGuard'

// Tab component mapping for Farmer
const FARMER_TAB_COMPONENTS = {
  overview: OverviewPage,
  listings: ListingsPage,
  orders: OrdersPage,
  transactions: TransactionsPage,
  settings: SettingsPage,
}

function FarmerDashboardContent() {
  // Protect route - only farmers can access this dashboard
  useRoleGuard('farmer')

  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [dashboardTabs, setDashboardTabs] = useState(farmerDashboardConfig.tabs)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  // Load user data on client side only
  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
  }, [])

  // Handle URL parameter for direct tab navigation
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && farmerDashboardConfig.tabs[tabParam as TabType]) {
      setActiveTab(tabParam as TabType)
    }
  }, [searchParams])

  // Show loading state while user data is loading
  const userName = currentUser?.fullName || ''

  // Set dashboard tabs from farmer config
  useEffect(() => {
    setDashboardTabs(farmerDashboardConfig.tabs)
    
    // Set default active tab to first available one (only if no tab parameter)
    if (!searchParams.get('tab')) {
      const availableTabs = Object.entries(farmerDashboardConfig.tabs)
        .filter(([_, isVisible]) => isVisible)
        .map(([tab]) => tab as TabType)
      
      if (availableTabs.length > 0) {
        setActiveTab(availableTabs[0])
      }
    }
  }, [searchParams])

  // Get active component based on current tab
  const ActiveComponent = FARMER_TAB_COMPONENTS[activeTab as keyof typeof FARMER_TAB_COMPONENTS]

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      dashboardTabs={dashboardTabs}
      userName={userName}
      userAvatar={currentUser?.avatar || farmerDashboardConfig.user.avatar}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      <ActiveComponent searchQuery={searchQuery} />
    </DashboardLayout>
  )
}

export default function FarmerDashboard() {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <FarmerDashboardContent />
    </Suspense>
  )
}
