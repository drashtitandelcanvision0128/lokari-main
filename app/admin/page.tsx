'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { UsersPanel } from '@/components/admin/panels/UsersPanel'
import { ListingsPanel } from '@/components/admin/panels/ListingsPanel'
import { OrdersPanel } from '@/components/admin/panels/OrdersPanel'
import { DisputesPanel } from '@/components/admin/panels/DisputesPanel'
import { AnalyticsPanel } from '@/components/admin/panels/AnalyticsPanel'
import { AuditLogPanel } from '@/components/admin/panels/AuditLogPanel'
import { adminMock } from '@/data/adminMock'
import { TabType, AdminTabs } from '@/types/admin'

// Tab component mapping
const TAB_COMPONENTS = {
  users: UsersPanel,
  listings: ListingsPanel,
  orders: OrdersPanel,
  disputes: DisputesPanel,
  analytics: AnalyticsPanel,
  auditLog: AuditLogPanel,
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('users')
  const [adminTabs, setAdminTabs] = useState<AdminTabs | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Simulate backend API call on component mount
  useEffect(() => {
    // This simulates fetching admin state from backend
    // In production, this would be: fetch('/api/admin-state')
    const fetchAdminState = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Set admin tabs from mock data
        setAdminTabs(adminMock.tabs)
        
        // Set default active tab to first available one
        const availableTabs = Object.entries(adminMock.tabs)
          .filter(([_, isVisible]) => isVisible)
          .map(([tab]) => tab as TabType)
        
        if (availableTabs.length > 0) {
          setActiveTab(availableTabs[0])
        }
      } catch (error) {
        console.error('Failed to fetch admin state:', error)
      }
    }

    fetchAdminState()
  }, [])

  // Show loading state while fetching admin configuration
  if (!adminTabs) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-500">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  // Get active component based on current tab
  const ActiveComponent = TAB_COMPONENTS[activeTab]

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      adminTabs={adminTabs}
      userName={adminMock.user.name}
      userAvatar={adminMock.user.avatar}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      <ActiveComponent searchQuery={searchQuery} />
    </AdminLayout>
  )
}
