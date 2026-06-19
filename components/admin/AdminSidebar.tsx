'use client';

import { AdminTabs, TabType } from '@/types/admin';

interface AdminSidebarProps {
  activeTab: TabType | null;
  onTabChange: (tab: TabType) => void;
  adminTabs: AdminTabs;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const TAB_META: Record<
  TabType,
  { label: string; icon: string; section: 'operations' | 'insights' }
> = {
  users: { label: 'Users', icon: 'people', section: 'operations' },
  listings: { label: 'Listings', icon: 'inventory_2', section: 'operations' },
  orders: { label: 'Orders', icon: 'shopping_cart', section: 'operations' },
  disputes: { label: 'Disputes', icon: 'gavel', section: 'operations' },
  analytics: { label: 'Analytics', icon: 'analytics', section: 'insights' },
  auditLog: { label: 'Audit Log', icon: 'history', section: 'insights' },
};

const TAB_BADGES: Partial<Record<TabType, number>> = {
  users: 3,
  listings: 23,
  orders: 5,
  disputes: 2,
};

export function AdminSidebar({
  activeTab,
  onTabChange,
  adminTabs,
  isCollapsed,
  onToggleCollapse,
}: AdminSidebarProps) {
  const operationsTabs = (Object.keys(adminTabs) as TabType[]).filter(
    (tab) => adminTabs[tab] && TAB_META[tab].section === 'operations',
  );
  const insightsTabs = (Object.keys(adminTabs) as TabType[]).filter(
    (tab) => adminTabs[tab] && TAB_META[tab].section === 'insights',
  );

  const renderNavButton = (tab: TabType) => {
    const { label, icon } = TAB_META[tab];
    const isActive = activeTab === tab;
    const badge = TAB_BADGES[tab];

    return (
      <button
        key={tab}
        type="button"
        onClick={() => onTabChange(tab)}
        title={isCollapsed ? label : undefined}
        className={`group relative flex w-full items-center rounded-xl transition-all duration-200 ${
          isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
        } ${
          isActive
            ? 'bg-[#0b5d68]/10 text-[#0b5d68] shadow-sm'
            : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
        }`}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-[#2eb5c2]" />
        )}

        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
            isActive
              ? 'bg-[#0b5d68] text-white shadow-sm'
              : 'bg-surface-container-high text-on-surface-variant group-hover:bg-surface group-hover:text-[#0b5d68]'
          }`}
        >
          <span className="material-symbols-outlined text-[1.25rem]">{icon}</span>
        </span>

        {!isCollapsed && (
          <>
            <span className="flex-1 text-left text-sm font-medium">{label}</span>
            {badge != null && badge > 0 && (
              <span
                className={`min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold ${
                  isActive ? 'bg-[#0b5d68] text-white' : 'bg-[#2eb5c2]/15 text-[#0b5d68]'
                }`}
              >
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </>
        )}
      </button>
    );
  };

  const renderSection = (title: string, tabs: TabType[]) => {
    if (tabs.length === 0) return null;

    return (
      <div className="space-y-1">
        {!isCollapsed && (
          <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant/70">
            {title}
          </p>
        )}
        {tabs.map(renderNavButton)}
      </div>
    );
  };

  return (
    <aside
      className={`sticky top-16 z-30 flex h-[calc(100vh-4rem)] shrink-0 flex-col border-r border-outline bg-surface shadow-sm transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-[4.75rem]' : 'w-64'
      }`}
    >
      {/* Header */}
      <div
        className={`relative overflow-hidden border-b border-outline/60 ${
          isCollapsed ? 'px-3 py-4' : 'px-4 py-5'
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0b5d68]/8 via-transparent to-[#2eb5c2]/10" />

        <div className={`relative flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2] shadow-md shadow-[#0b5d68]/20">
            <span className="material-symbols-outlined text-2xl text-white">admin_panel_settings</span>
          </div>

          {!isCollapsed && (
            <p className="min-w-0 flex-1 text-sm font-medium text-on-surface-variant">System management</p>
          )}

          {!isCollapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
              aria-label="Collapse sidebar"
            >
              <span className="material-symbols-outlined text-xl">chevron_left</span>
            </button>
          )}
        </div>

        {isCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="relative mt-3 flex w-full items-center justify-center rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
            aria-label="Expand sidebar"
          >
            <span className="material-symbols-outlined text-xl">chevron_right</span>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 space-y-4 overflow-y-auto ${isCollapsed ? 'px-2 py-4' : 'px-3 py-4'}`}>
        {renderSection('Operations', operationsTabs)}
        {renderSection('Insights', insightsTabs)}
      </nav>

      {/* Footer */}
      <div className={`border-t border-outline/60 ${isCollapsed ? 'p-2' : 'p-3'}`}>
        <div
          className={`rounded-xl border border-outline/50 bg-gradient-to-br from-surface-container to-surface-container-high ${
            isCollapsed ? 'p-2' : 'p-3'
          }`}
        >
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2eb5c2]/15 text-[#0b5d68]">
              <span className="material-symbols-outlined text-base">verified_user</span>
            </span>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-semibold text-on-surface">Secure session</p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[11px] text-on-surface-variant">All systems operational</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
