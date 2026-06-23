'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/Icon';
import { DashboardTabs, TabType } from '@/types/dashboard';
import { getUserRole } from '@/lib/auth';
import { usePostListingNavigation } from '@/hooks/usePostListingNavigation';
import { useSettings, type SettingsSection } from '@/lib/context/SettingsContext';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  dashboardTabs: DashboardTabs;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const tabConfig: Record<TabType, { icon: string; label: string }> = {
  overview: { icon: 'dashboard', label: 'Overview' },
  listings: { icon: 'inventory_2', label: 'Listings' },
  bids: { icon: 'gavel', label: 'Bids' },
  requirements: { icon: 'receipt_long', label: 'Requirements' },
  logistics: { icon: 'local_shipping', label: 'Logistics' },
  orders: { icon: 'shopping_cart', label: 'Orders' },
  transactions: { icon: 'payments', label: 'Transactions' },
  settings: { icon: 'settings', label: 'Settings' },
};

const settingsSubTabs = [
  { id: 'profile', label: 'Profile', icon: 'person' },
  { id: 'kyc', label: 'KYC Verification', icon: 'verified_user' },
  { id: 'addresses', label: 'Addresses', icon: 'location_on' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications' },
  { id: 'security', label: 'Reset Password', icon: 'lock' },
];

export function getDashboardTabLabel(tab: TabType): string {
  return tabConfig[tab]?.label ?? tab;
}

function SidebarNav({
  activeTab,
  onTabChange,
  dashboardTabs,
  isCollapsed,
  onToggleCollapse,
  onNavigate,
}: {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  dashboardTabs: DashboardTabs;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate?: () => void;
}) {
  const [userRole, setUserRole] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(activeTab === 'settings');
  const { navigateToCreateListing } = usePostListingNavigation();
  const { activeSection, setActiveSection } = useSettings();

  useEffect(() => {
    setUserRole(getUserRole());
  }, []);

  useEffect(() => {
    if (activeTab === 'settings') {
      setIsSettingsOpen(true);
    }
  }, [activeTab]);

  const handleTabChange = (tab: TabType) => {
    onTabChange(tab);
    onNavigate?.();
  };

  return (
    <>
      <div
        className={cn(
          'mb-6 transition-all duration-300 ease-in-out',
          isCollapsed ? 'px-3' : 'px-4 sm:px-6',
        )}
      >
        <div className={cn('flex items-center mb-4', isCollapsed ? 'justify-center' : 'gap-3')}>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 transition-colors hover:bg-accent/20 group"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Icon
              name="agriculture"
              className="text-accent transition-transform group-hover:scale-110"
            />
          </button>
          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className="font-headline text-lg font-bold leading-tight text-primary">
                Exchange Dashboard
              </h1>
              <p className="text-xs font-medium text-on-surface-variant">Verified Account</p>
            </div>
          )}
        </div>

        {userRole !== 'trader' && (
          <button
            type="button"
            onClick={() => {
              navigateToCreateListing();
              onNavigate?.();
            }}
            className={cn(
              'bg-[#e89151] font-body text-sm font-medium text-white transition-all hover:bg-[#e89151]/90 active:scale-[0.98]',
              isCollapsed
                ? 'mx-auto flex h-10 w-10 items-center justify-center rounded-md'
                : 'flex w-full items-center justify-center gap-2 rounded-md px-4 py-3',
            )}
            title="Post Listing"
          >
            <Icon name="add" />
            {!isCollapsed && <span>Post Listing</span>}
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 pb-4">
        {Object.entries(dashboardTabs).map(([tab, isVisible]) => {
          if (!isVisible) return null;

          const tabKey = tab as TabType;
          const config = tabConfig[tabKey];
          const isActive = activeTab === tabKey;

          if (tabKey === 'settings') {
            return (
              <div key="settings">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className={cn(
                    'flex w-full items-center rounded-md px-4 py-3 text-on-surface-variant hover:bg-accent/10',
                    isCollapsed && 'justify-center px-2',
                  )}
                >
                  <Icon name="settings" />
                  {!isCollapsed && (
                    <>
                      <span className="ml-3 flex-1 text-left">Settings</span>
                      <Icon name={isSettingsOpen ? 'expand_less' : 'expand_more'} />
                    </>
                  )}
                </button>
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-300 ease-out',
                    isSettingsOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
                  )}
                >
                  {!isCollapsed && isSettingsOpen && (
                    <div className="ml-8 mt-1 space-y-1">
                      {settingsSubTabs.map((item) => (
                        <button
                          className={cn(
                            'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-200 ease-out',
                            activeTab === 'settings' && activeSection === item.id
                              ? 'bg-primary text-white shadow-sm'
                              : 'hover:bg-accent/10 hover:translate-x-1',
                          )}
                          key={item.id}
                          onClick={() => {
                            onTabChange('settings');
                            setActiveSection(item.id as any);
                          }}
                        >
                          <Icon name={item.icon} />
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          }

          return (
            <button
              key={tabKey}
              type="button"
              onClick={() => handleTabChange(tabKey)}
              className={cn(
                'flex items-center rounded-md font-body text-sm font-medium transition-all',
                isCollapsed ? 'w-full justify-center px-2 py-3' : 'w-full gap-3 px-4 py-3',
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:bg-accent/10 hover:translate-x-1',
              )}
              title={isCollapsed ? config.label : undefined}
            >
              <Icon name={config.icon} />
              {!isCollapsed && <span>{config.label}</span>}
            </button>
          );
        })}
      </nav>
    </>
  );
}

export function Sidebar({
  activeTab,
  onTabChange,
  dashboardTabs,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  return (
    <>
      <aside
        className={cn(
          'sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 flex-col gap-2 border-r border-outline bg-surface py-6 transition-all duration-300 ease-in-out md:flex',
          isCollapsed ? 'w-20' : 'w-64',
        )}
      >
        <SidebarNav
          activeTab={activeTab}
          onTabChange={onTabChange}
          dashboardTabs={dashboardTabs}
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
        />
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            aria-label="Close navigation menu"
            onClick={onMobileClose}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[min(18rem,88vw)] flex-col border-r border-outline bg-surface py-6 shadow-xl">
            <div className="flex items-center justify-between px-4 pb-2">
              <p className="text-sm font-semibold text-on-surface">Menu</p>
              <button
                type="button"
                onClick={onMobileClose}
                className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container"
                aria-label="Close menu"
              >
                <Icon name="close" />
              </button>
            </div>
            <SidebarNav
              activeTab={activeTab}
              onTabChange={onTabChange}
              dashboardTabs={dashboardTabs}
              isCollapsed={false}
              onToggleCollapse={onToggleCollapse}
              onNavigate={onMobileClose}
            />
          </aside>
        </div>
      )}
    </>
  );
}
