'use client'

import { AdminTabs, TabType } from '@/types/admin'

interface AdminSidebarProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  adminTabs: AdminTabs
}

export function AdminSidebar({ activeTab, onTabChange, adminTabs }: AdminSidebarProps) {
  const getTabIcon = (tab: TabType): string => {
    const icons: Record<TabType, string> = {
      users: 'people',
      listings: 'inventory_2',
      orders: 'shopping_cart',
      disputes: 'gavel',
      analytics: 'analytics',
      auditLog: 'history'
    }
    return icons[tab] || 'dashboard'
  }

  const getTabLabel = (tab: TabType): string => {
    const labels: Record<TabType, string> = {
      users: 'Users',
      listings: 'Listings',
      orders: 'Orders',
      disputes: 'Disputes',
      analytics: 'Analytics',
      auditLog: 'Audit Log'
    }
    return labels[tab] || tab
  }

  const getTabBadge = (tab: TabType): number | null => {
    // Mock badge counts for demonstration
    const badges: Record<TabType, number | null> = {
      users: 3, // 3 pending users
      listings: 23, // 23 pending listings
      orders: 5, // 5 disputed orders
      disputes: 2, // 2 open disputes
      analytics: null,
      auditLog: null
    }
    return badges[tab] || null
  }

  return (
    <aside className="w-64 bg-surface-container border-r border-outline flex flex-col">
      {/* Admin Header */}
      <div className="p-6 border-b border-outline">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-error rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-on-error">admin_panel_settings</span>
          </div>
          <div>
            <h3 className="font-headline font-semibold text-on-surface">Admin Panel</h3>
            <p className="text-xs text-on-surface-variant">System Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {(Object.keys(adminTabs) as TabType[]).map((tab) => {
          if (!adminTabs[tab]) return null

          const isActive = activeTab === tab
          const badge = getTabBadge(tab)

          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group cursor-pointer ${
                isActive
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined ${
                  isActive ? 'text-on-primary-container' : 'text-on-surface-variant group-hover:text-on-surface'
                }`}>
                  {getTabIcon(tab)}
                </span>
                <span className="font-medium">{getTabLabel(tab)}</span>
              </div>
              
              {badge !== null && badge > 0 && (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  isActive
                    ? 'bg-on-primary-container text-primary-container'
                    : 'bg-error text-on-error'
                }`}>
                  {badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Admin Info */}
      <div className="p-4 border-t border-outline">
        <div className="bg-surface-container-high rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-sm text-tertiary">security</span>
            <span className="text-xs font-medium text-tertiary">Security Status</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-tertiary rounded-full animate-pulse"></div>
            <span className="text-xs text-on-surface-variant">All systems operational</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
