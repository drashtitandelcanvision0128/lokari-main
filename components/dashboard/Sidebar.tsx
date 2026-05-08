'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/Icon'
import { DashboardTabs, TabType } from '@/types/dashboard'
import { getUserRole } from '@/lib/auth'
import { usePostListingNavigation } from '@/hooks/usePostListingNavigation'

interface SidebarProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  dashboardTabs: DashboardTabs
  isCollapsed: boolean
  onToggleCollapse: () => void
}

const tabConfig = {
  overview: { icon: 'dashboard', label: 'Overview' },
  listings: { icon: 'inventory_2', label: 'Listings' },
  bids: { icon: 'gavel', label: 'Bids' },
  requirements: { icon: 'receipt_long', label: 'Requirements' },
  logistics: { icon: 'local_shipping', label: 'Logistics' },
  orders: { icon: 'shopping_cart', label: 'Orders' },
  transactions: { icon: 'payments', label: 'Transactions' },
  settings: { icon: 'settings', label: 'Settings' }
}

export function Sidebar({ activeTab, onTabChange, dashboardTabs, isCollapsed, onToggleCollapse }: SidebarProps) {
  const [userRole, setUserRole] = useState<string>('')
  const { navigateToCreateListing, createListingPath } = usePostListingNavigation()

  useEffect(() => {
    const role = getUserRole()
    setUserRole(role)
  }, [])

  return (
    <aside 
      className={`
        hidden md:flex h-screen border-r border-outline bg-surface flex-col py-6 gap-2 sticky top-16 shrink-0
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Logo Section */}
      <div className={`mb-8 transition-all duration-300 ease-in-out ${isCollapsed ? 'px-3' : 'px-6'}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} mb-4`}>
          <button 
            onClick={onToggleCollapse}
            className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center hover:bg-accent/20 transition-colors cursor-pointer group flex-shrink-0"
          >
            <Icon name="agriculture" className="text-accent group-hover:scale-110 transition-transform" />
          </button>
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
            <h1 className="font-headline font-bold text-primary text-lg leading-tight">
              Exchange Dashboard
            </h1>
            <p className="text-xs text-on-surface-variant font-medium">Verified Account</p>
          </div>
        </div>
        {userRole !== 'trader' && !isCollapsed && (
          <button 
            onClick={navigateToCreateListing}
            className="w-full bg-[#e89151] text-white py-3 px-4 rounded-md font-body text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#e89151]/90 transition-all active:scale-[0.98]"
          >
            <Icon name="add" />
            Post Listing
          </button>
        )}
        {userRole !== 'trader' && isCollapsed && (
          <button 
            onClick={navigateToCreateListing}
            className="w-10 h-10 bg-[#e89151] text-white rounded-md font-body text-sm font-medium flex items-center justify-center hover:bg-[#e89151]/90 transition-all active:scale-[0.98]"
            title="Post Listing"
          >
            <Icon name="add" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 space-y-1 transition-all duration-300 ease-in-out ${isCollapsed ? 'px-2' : ''}`}>
        {Object.entries(dashboardTabs).map(([tab, isVisible]) => {
          if (!isVisible) return null
          
          const tabKey = tab as TabType
          const config = tabConfig[tabKey]
          const isActive = activeTab === tabKey
          
          return (
            <button
              key={tabKey}
              onClick={() => onTabChange(tabKey)}
              className={cn(
                'flex items-center font-body text-sm font-medium transition-all rounded-md',
                isCollapsed ? 'px-2 py-3 justify-center' : 'mx-2 px-4 py-3 gap-3',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-on-surface-variant hover:bg-accent/10'
              )}
              title={isCollapsed ? config.label : undefined}
            >
              <Icon name={config.icon} />
              <span className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'
              }`}>
                {config.label}
              </span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
