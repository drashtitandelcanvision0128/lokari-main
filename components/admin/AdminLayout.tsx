'use client'

import { ReactNode, useState } from 'react'
import { AdminSidebar } from './AdminSidebar'
import { AdminTabs, TabType } from '@/types/admin'

interface AdminLayoutProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  adminTabs: AdminTabs
  userName: string
  userAvatar?: string
  children: ReactNode
  searchQuery?: string
  onSearchChange?: (query: string) => void
}

export function AdminLayout({
  activeTab,
  onTabChange,
  adminTabs,
  userName,
  userAvatar,
  children,
  searchQuery = '',
  onSearchChange
}: AdminLayoutProps) {
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

  const getTabTitle = (tab: TabType): string => {
    const titles: Record<TabType, string> = {
      users: 'User Management',
      listings: 'Listing Management',
      orders: 'Order Management',
      disputes: 'Dispute Resolution',
      analytics: 'Analytics Dashboard',
      auditLog: 'Audit Trail'
    }
    return titles[tab] || 'Admin Panel'
  }

  return (
    <div className="bg-surface text-on-surface flex min-h-screen pt-16">
      {/* Admin Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        adminTabs={adminTabs}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Admin Topbar Section */}
        <div className="h-16 px-8 flex justify-between items-center bg-background/80 backdrop-blur-md sticky top-16 z-40 border-b border-outline">
          {/* Page Title */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-error font-bold">
                Admin Access
              </span>
              <h2 className="font-headline font-bold text-primary text-lg">
                {getTabTitle(activeTab)}
              </h2>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-6">
            {/* Search Bar - Hidden for Analytics Tab */}
            {activeTab !== 'analytics' && (
              <form onSubmit={handleSearch} className="hidden lg:flex items-center gap-2 px-4 py-2 bg-surface-container rounded-full border border-outline">
                <span className="material-symbols-outlined text-sm text-on-surface-variant">
                  search
                </span>
                <input
                  className="bg-transparent border-none text-sm focus:ring-0 p-0 w-48 text-on-surface placeholder-on-surface-variant"
                  placeholder="Search admin data..."
                  type="text"
                  value={localSearchQuery}
                  onChange={handleSearchInputChange}
                />
              </form>
            )}

            {/* Admin Actions */}
            <div className="flex items-center gap-2">
              <button className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-sm">notifications</span>
              </button>
              <button className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-sm">settings</span>
              </button>
            </div>
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
