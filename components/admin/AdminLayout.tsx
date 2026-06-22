'use client'

import { ReactNode, useState, useEffect } from 'react'
import { AdminSidebar } from './AdminSidebar'
import { AdminTabs, TabType } from '@/types/admin'

interface AdminLayoutProps {
  activeTab?: TabType | null
  onTabChange: (tab: TabType) => void
  adminTabs: AdminTabs
  userName: string
  userAvatar?: string
  children: ReactNode
  searchQuery?: string
  onSearchChange?: (query: string) => void
  role?: string
  pageTitle?: string
  hideSearch?: boolean
}

export function AdminLayout({
  activeTab = null,
  onTabChange,
  adminTabs,
  userName,
  userAvatar,
  children,
  searchQuery = '',
  onSearchChange,
  role = 'farmer',
  pageTitle,
  hideSearch = false,
}: AdminLayoutProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  
  // State from HEAD: Sidebar management
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  useEffect(() => {
    setLocalSearchQuery(searchQuery)
  }, [searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
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

  const getTabTitle = (tab: TabType | null): string => {
    if (pageTitle) return pageTitle
    if (!tab) return 'Admin Panel'

    const titles: Record<TabType, string> = {
      users: 'User Management',
      listings: 'Listing Management',
      orders: 'Order Management',
      disputes: 'Dispute Resolution',
      analytics: 'Analytics Dashboard',
      auditLog: 'Audit Trail',
    }
    return titles[tab]
  }

  const headerTitle = pageTitle ?? (activeTab ? getTabTitle(activeTab) : 'Admin Panel')

  return (
    <div className="bg-surface text-on-surface flex min-h-screen pt-16">
      {/* Admin Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        adminTabs={adminTabs}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        isMobileOpen={isMobileNavOpen}
        onMobileClose={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Admin Topbar Section */}
        <div className="min-h-16 px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 bg-background/80 backdrop-blur-md sticky top-16 z-40 border-b border-outline py-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-outline text-on-surface hover:bg-surface-container md:hidden"
              aria-label="Open admin navigation menu"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase tracking-widest text-error font-bold">
                Admin Access
              </span>
              <h2 className="font-headline font-bold text-primary text-base sm:text-lg truncate">
                {headerTitle}
              </h2>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex w-full sm:w-auto items-center gap-4 sm:gap-6">
            {/* Search Bar - Hidden for Analytics Tab */}
            {!hideSearch && activeTab !== 'analytics' && (
              <form onSubmit={handleSearch} className="flex w-full sm:w-auto items-center gap-2 px-3 sm:px-4 py-2 bg-surface-container rounded-full border border-outline lg:min-w-[16rem]">
                <span className="material-symbols-outlined text-sm text-on-surface-variant shrink-0">
                  search
                </span>
                <input
                  className="bg-transparent border-none text-sm focus:ring-0 p-0 w-full sm:w-48 text-on-surface placeholder-on-surface-variant min-w-0"
                  placeholder="Search admin data..."
                  type="text"
                  value={localSearchQuery}
                  onChange={handleSearchInputChange}
                />
              </form>
            )}
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
