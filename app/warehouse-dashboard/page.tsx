'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { OverviewPage } from '@/components/dashboard/pages/OverviewPage'
import { RequirementsPage } from '@/components/dashboard/pages/RequirementsPage'
import { OrdersPage } from '@/components/dashboard/pages/OrdersPage'
import { TransactionsPage } from '@/components/dashboard/pages/TransactionsPage'
import { SettingsPage } from '@/components/dashboard/pages/SettingsPage'
import { warehouseDashboardConfig } from '@/data/dashboardMock'
import { TabType } from '@/types/dashboard'
import { getCurrentUser, getUserDisplayName } from '@/lib/auth'
import { type User } from '@/lib/registration'
import { useRoleGuard } from '@/lib/authGuard'
import { SettingsProvider } from '@/backend/src/context/SettingsContext'

// Tab component mapping for Warehouse Owner
const WAREHOUSE_TAB_COMPONENTS = {
  overview: OverviewPage,
  requirements: RequirementsPage,
  orders: OrdersPage,
  transactions: TransactionsPage,
  settings: SettingsPage,
}

function WarehouseDashboardContent() {
  // Protect route - only warehouse owners can access this dashboard
  useRoleGuard('warehouse')

  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [dashboardTabs, setDashboardTabs] = useState(warehouseDashboardConfig.tabs)
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
    if (tabParam && warehouseDashboardConfig.tabs[tabParam as TabType]) {
      setActiveTab(tabParam as TabType)
    }
  }, [searchParams])

  // Show loading state while user data is loading
  const userName = currentUser?.fullName || ''

  // Set dashboard tabs from warehouse config
  useEffect(() => {
    setDashboardTabs(warehouseDashboardConfig.tabs)

    // Set default active tab to first available one (only if no tab parameter)
    if (!searchParams.get('tab')) {
      const availableTabs = Object.entries(warehouseDashboardConfig.tabs)
        .filter(([_, isVisible]) => isVisible)
        .map(([tab]) => tab as TabType)

      if (availableTabs.length > 0) {
        setActiveTab(availableTabs[0])
      }
    }
  }, [searchParams])

  // Get active component based on current tab
  const ActiveComponent = WAREHOUSE_TAB_COMPONENTS[activeTab as keyof typeof WAREHOUSE_TAB_COMPONENTS]

  return (
    <SettingsProvider>
      <DashboardLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        dashboardTabs={warehouseDashboardConfig.tabs}
        userName={userName}
        userAvatar={currentUser?.avatar}
        role="warehouse"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      >
        <ActiveComponent searchQuery={searchQuery} />
      </DashboardLayout>
    </SettingsProvider>
  )
}

export default function WarehouseDashboard() {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <WarehouseDashboardContent />
    </Suspense>
  )
}
