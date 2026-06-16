'use client'

import { AdminTabs, TabType } from '@/types/admin'

interface AdminSidebarProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  adminTabs: AdminTabs
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function AdminSidebar({ activeTab, onTabChange, adminTabs, isCollapsed, onToggleCollapse }: AdminSidebarProps) {
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
    <aside
      className={`
        bg-surface-container border-r border-outline flex flex-col
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Admin Header */}
      <div className={`border-b border-outline transition-all duration-300 ease-in-out ${isCollapsed ? 'p-3' : 'p-4'}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <button
            onClick={onToggleCollapse}
            className="w-10 h-10 bg-error rounded-lg flex items-center justify-center hover:bg-error/90 transition-colors cursor-pointer group flex-shrink-0"
          >
            <span className="material-symbols-outlined text-on-error group-hover:scale-110 transition-transform">
              admin_panel_settings
            </span>
          </button>
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
            <h3 className="font-headline font-semibold text-on-surface">Admin Panel</h3>
            <p className="text-xs text-on-surface-variant">System Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 space-y-1 transition-all duration-300 ease-in-out ${isCollapsed ? 'px-2 py-4' : 'p-4'}`}>
        {(Object.keys(adminTabs) as TabType[]).map((tab) => {
          if (!adminTabs[tab]) return null

          const isActive = activeTab === tab
          const badge = getTabBadge(tab)

          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`
                w-full flex items-center justify-between rounded-lg transition-all duration-200 group cursor-pointer
                ${isCollapsed ? 'px-2 py-3 justify-center' : 'px-4 py-3'}
                ${isActive
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }
              `}
              title={isCollapsed ? getTabLabel(tab) : undefined}
            >
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                <span className={`material-symbols-outlined ${isActive ? 'text-on-primary-container' : 'text-on-surface-variant group-hover:text-on-surface'
                  }`}>
                  {getTabIcon(tab)}
                </span>
                <span className={`font-medium transition-all duration-300 ease-in-out overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'
                  }`}>
                  {getTabLabel(tab)}
                </span>
              </div>

              {!isCollapsed && badge !== null && badge > 0 && (
                <span className={`px-2 py-1 text-xs font-medium rounded-full transition-all duration-300 ease-in-out ${isActive
                    ? 'bg-on-primary-container text-primary-container'
                    // : 'bg-error text-on-error'
                    : 'bg-error text-white'
                  }`}>
                  {badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Admin Info */}
      <div className={`border-t border-outline transition-all duration-300 ease-in-out ${isCollapsed ? 'p-2' : 'p-4'}`}>
        <div className="bg-surface-container-high rounded-lg transition-all duration-300 ease-in-out">
          <div className={`flex items-center gap-2 ${isCollapsed ? 'p-2 justify-center' : 'p-3'}`}>
            <span className="material-symbols-outlined text-sm text-tertiary">security</span>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'
              }`}>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-tertiary">Security Status</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-tertiary rounded-full animate-pulse"></div>
                  <span className="text-xs text-on-surface-variant">All systems operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
