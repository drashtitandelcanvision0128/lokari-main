'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { OverviewPage } from '@/components/dashboard/pages/OverviewPage'
import { BidsPage } from '@/components/dashboard/pages/BidsPage'
import { OrdersPage } from '@/components/dashboard/pages/OrdersPage'
import { TransactionsPage } from '@/components/dashboard/pages/TransactionsPage'
import { SettingsPage } from '@/components/dashboard/pages/SettingsPage'
import { traderDashboardConfig } from '@/data/dashboardMock'
import { TabType } from '@/types/dashboard'
import { getCurrentUser, getUserDisplayName } from '@/lib/auth'
import { type User } from '@/lib/registration'
import { useRoleGuard } from '@/lib/authGuard'

// Tab component mapping for Trader
const TRADER_TAB_COMPONENTS = {
  overview: OverviewPage,
  bids: BidsPage,
  orders: OrdersPage,
  transactions: TransactionsPage,
  settings: SettingsPage,
}

function TraderDashboardContent() {
  // Protect route - only traders can access this dashboard
  useRoleGuard('trader')

  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [dashboardTabs, setDashboardTabs] = useState(traderDashboardConfig.tabs)
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
    if (tabParam && traderDashboardConfig.tabs[tabParam as TabType]) {
      setActiveTab(tabParam as TabType)
    }
  }, [searchParams])

  // Show loading state while user data is loading
  const userName = currentUser?.fullName || ''

  // Set dashboard tabs from trader config
  useEffect(() => {
    setDashboardTabs(traderDashboardConfig.tabs)
    
    // Set default active tab to first available one (only if no tab parameter)
    if (!searchParams.get('tab')) {
      const availableTabs = Object.entries(traderDashboardConfig.tabs)
        .filter(([_, isVisible]) => isVisible)
        .map(([tab]) => tab as TabType)
      
      if (availableTabs.length > 0) {
        setActiveTab(availableTabs[0])
      }
    }
  }, [searchParams])

  // Get active component based on current tab
  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      dashboardTabs={traderDashboardConfig.tabs}
      userName={userName}
      userAvatar={currentUser?.avatar}
      role="trader"
    >
      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewPage />}
      {activeTab === 'bids' && <BidsPage />}
      {activeTab === 'orders' && <OrdersPage />}
      {activeTab === 'transactions' && <TransactionsPage />}
      {activeTab === 'settings' && <SettingsPage />}
    </DashboardLayout>
  )
}

export default function TraderDashboard() {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <TraderDashboardContent />
    </Suspense>
  )
}
