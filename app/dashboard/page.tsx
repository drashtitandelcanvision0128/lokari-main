'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { OverviewPage } from '@/components/dashboard/pages/OverviewPage'
import { ListingsPage } from '@/components/dashboard/pages/ListingsPage'
import { BidsPage } from '@/components/dashboard/pages/BidsPage'
import { RequirementsPage } from '@/components/dashboard/pages/RequirementsPage'
import { LogisticsPage } from '@/components/dashboard/pages/LogisticsPage'
import { OrdersPage } from '@/components/dashboard/pages/OrdersPage'
import { TransactionsPage } from '@/components/dashboard/pages/TransactionsPage'
import { SettingsPage } from '@/components/dashboard/pages/SettingsPage'
import { dashboardMock } from '@/data/dashboardMock'
import { TabType, DashboardTabs } from '@/types/dashboard'

// Tab component mapping
const TAB_COMPONENTS = {
  overview: OverviewPage,
  listings: ListingsPage,
  bids: BidsPage,
  requirements: RequirementsPage,
  logistics: LogisticsPage,
  orders: OrdersPage,
  transactions: TransactionsPage,
  settings: SettingsPage,
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [dashboardTabs, setDashboardTabs] = useState<DashboardTabs | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Simulate backend API call on component mount
  useEffect(() => {
    // This simulates fetching dashboard state from backend
    // In production, this would be: fetch('/api/dashboard-state')
    const fetchDashboardState = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Set dashboard tabs from mock data
        setDashboardTabs(dashboardMock.tabs)
        
        // Set default active tab to first available one
        const availableTabs = Object.entries(dashboardMock.tabs)
          .filter(([_, isVisible]) => isVisible)
          .map(([tab]) => tab as TabType)
        
        if (availableTabs.length > 0) {
          setActiveTab(availableTabs[0])
        }
      } catch (error) {
        console.error('Failed to fetch dashboard state:', error)
      }
    }

    fetchDashboardState()
  }, [])

  // Show loading state while fetching dashboard configuration
  if (!dashboardTabs) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Get active component based on current tab
  const ActiveComponent = TAB_COMPONENTS[activeTab]

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      dashboardTabs={dashboardTabs}
      userName={dashboardMock.user.name}
      userAvatar={dashboardMock.user.avatar}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      <ActiveComponent searchQuery={searchQuery} />
    </DashboardLayout>
  )
}
