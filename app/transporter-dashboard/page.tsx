'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { OverviewPage } from '@/components/dashboard/pages/OverviewPage'
import { LogisticsPage } from '@/components/dashboard/pages/LogisticsPage'
import { OrdersPage } from '@/components/dashboard/pages/OrdersPage'
import { TransactionsPage } from '@/components/dashboard/pages/TransactionsPage'
import { SettingsPage } from '@/components/dashboard/pages/SettingsPage'
import { transporterDashboardConfig } from '@/data/dashboardMock'
import { TabType } from '@/types/dashboard'
import { getCurrentUser, getUserDisplayName } from '@/lib/auth'
import { type User } from '@/lib/registration'
import { useRoleGuard } from '@/lib/authGuard'
import { SettingsProvider } from '@/lib/context/SettingsContext'

// Tab component mapping for Transporter
const TRANSPORTER_TAB_COMPONENTS = {
  overview: OverviewPage,
  logistics: LogisticsPage,
  orders: OrdersPage,
  transactions: TransactionsPage,
  settings: SettingsPage,
}

function TransporterDashboardContent() {
  // Protect route - only transporters can access this dashboard
  useRoleGuard('transporter')

  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [dashboardTabs, setDashboardTabs] = useState(transporterDashboardConfig.tabs)
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
    if (tabParam && transporterDashboardConfig.tabs[tabParam as TabType]) {
      setActiveTab(tabParam as TabType)
    }
  }, [searchParams])

  // Show loading state while user data is loading
  const userName = currentUser?.fullName || ''

  // Set dashboard tabs from transporter config
  useEffect(() => {
    setDashboardTabs(transporterDashboardConfig.tabs)

    // Set default active tab to first available one (only if no tab parameter)
    if (!searchParams.get('tab')) {
      const availableTabs = Object.entries(transporterDashboardConfig.tabs)
        .filter(([_, isVisible]) => isVisible)
        .map(([tab]) => tab as TabType)

      if (availableTabs.length > 0) {
        setActiveTab(availableTabs[0])
      }
    }
  }, [searchParams])

  // Get active component based on current tab
  const ActiveComponent = TRANSPORTER_TAB_COMPONENTS[activeTab as keyof typeof TRANSPORTER_TAB_COMPONENTS]

  return (
    <SettingsProvider>
      <DashboardLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        dashboardTabs={transporterDashboardConfig.tabs}
        userName={userName}
        userAvatar={currentUser?.avatar}
        role="transporter"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      >
        <ActiveComponent searchQuery={searchQuery} />
      </DashboardLayout>
    </SettingsProvider>
  )
}

export default function TransporterDashboard() {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <TransporterDashboardContent />
    </Suspense>
  )
}
