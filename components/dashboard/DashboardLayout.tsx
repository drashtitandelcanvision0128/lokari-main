'use client'

import { ReactNode, useState } from 'react'
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
        {/* Dashboard Topbar Section */}
        <div className="h-16 px-8 flex justify-between items-center bg-background/80 backdrop-blur-md sticky top-16 z-40 border-b border-outline">
          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-accent font-bold">
                {role === 'farmer' ? 'Farmer Access' : 
                 role === 'trader' ? 'Trader Access' :
                 role === 'warehouse' ? 'Warehouse Access' :
                 role === 'transporter' ? 'Transporter Access' : 'Dashboard Access'}
              </span>
              <h2 className="font-headline font-bold text-primary text-lg">
                {userName}
              </h2>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-6">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden lg:flex items-center gap-2 px-4 py-2 bg-surface-container rounded-full border border-outline">
              <span className="material-symbols-outlined text-sm text-on-surface-variant">
                search
              </span>
              <input
                className="bg-transparent border-none text-sm focus:ring-0 p-0 w-48 text-on-surface placeholder-on-surface-variant"
                placeholder="Search marketplace..."
                type="text"
                value={localSearchQuery}
                onChange={handleSearchInputChange}
              />
            </form>
          </div>
        </div>
        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
