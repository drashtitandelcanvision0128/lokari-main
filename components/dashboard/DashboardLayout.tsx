'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { Sidebar } from './Sidebar'
import { DashboardTabs, TabType } from '@/types/dashboard'

interface DashboardLayoutProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  dashboardTabs: DashboardTabs
  userName: string
  userAvatar?: string
  children: ReactNode
  searchQuery?: string
  onSearchChange?: (query: string) => void
  role?: string
}

export function DashboardLayout({
  activeTab,
  onTabChange,
  dashboardTabs,
  userName,
  userAvatar,
  children,
  searchQuery = '',
  onSearchChange,
  role = 'farmer'
}: DashboardLayoutProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // The actual filtering will be handled by the individual pages
    // We just update the search state here
    if (onSearchChange) {
      onSearchChange(localSearchQuery)
    }
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setLocalSearchQuery(newQuery)
    if (onSearchChange) {
      onSearchChange(newQuery)
    }
  }

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }
  return (
    <div className="bg-surface text-on-surface flex min-h-screen pt-16">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        dashboardTabs={dashboardTabs}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">

        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
