'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/Icon'
import { DashboardTabs, TabType } from '@/types/dashboard'
import { getUserRole } from '@/lib/auth'

interface SidebarProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  dashboardTabs: DashboardTabs
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

export function Sidebar({ activeTab, onTabChange, dashboardTabs }: SidebarProps) {
  const [userRole, setUserRole] = useState<string>('')

  useEffect(() => {
    const role = getUserRole()
    setUserRole(role)
  }, [])

  return (
    <aside className="hidden md:flex h-screen w-64 border-r border-outline bg-surface flex-col py-6 gap-2 sticky top-16 shrink-0">
      {/* Logo Section */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Icon name="agriculture" className="text-accent" />
          </div>
          <div>
            <h1 className="font-headline font-bold text-primary text-lg leading-tight">
              Exchange Dashboard
            </h1>
            <p className="text-xs text-on-surface-variant font-medium">Verified Account</p>
          </div>
        </div>
        {userRole !== 'trader' && (
          <button className="w-full bg-[#e89151] text-white py-3 px-4 rounded-md font-body text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#e89151]/90 transition-all active:scale-[0.98]">
            <Icon name="add" />
            Post Listing
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
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
                'mx-2 px-4 py-3 flex items-center gap-3 font-body text-sm font-medium transition-all rounded-md',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-on-surface-variant hover:bg-accent/10'
              )}
            >
              <Icon name={config.icon} />
              {config.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
