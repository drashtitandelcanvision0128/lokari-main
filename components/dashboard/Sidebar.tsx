'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/Icon';
import { DashboardTabs, TabType } from '@/types/dashboard';
import { getUserRole } from '@/lib/auth';
import { usePostListingNavigation } from '@/hooks/usePostListingNavigation';
import { useSettings, type SettingsSection } from '@/lib/context/SettingsContext';

// ─── Config ──────────────────────────────────────────────────────────────────

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  dashboardTabs: DashboardTabs;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  onNewPost?: () => void;
}

const tabConfig: Record<TabType, { icon: string; label: string; group: 'main' | 'account' }> = {
  overview: { icon: 'dashboard', label: 'Overview', group: 'main' },
  listings: { icon: 'inventory_2', label: 'Listings', group: 'main' },
  bids: { icon: 'gavel', label: 'Bids', group: 'main' },
  requirements: { icon: 'receipt_long', label: 'Requirements', group: 'main' },
  logistics: { icon: 'local_shipping', label: 'Logistics', group: 'main' },
  orders: { icon: 'shopping_bag', label: 'Orders', group: 'main' },
  transactions: { icon: 'payments', label: 'Transactions', group: 'account' },
  settings: { icon: 'tune', label: 'Settings', group: 'account' },
};

const settingsSubTabs: { id: SettingsSection; label: string; icon: string }[] = [
  { id: 'profile',   label: 'Profile',  icon: 'person'        },
  { id: 'security',  label: 'Reset Password', icon: 'lock_reset' },
  { id: 'kyc',       label: 'KYC',      icon: 'verified_user' },
];

export function getDashboardTabLabel(tab: TabType): string {
  return tabConfig[tab]?.label ?? tab;
}

// ─── Inner nav ───────────────────────────────────────────────────────────────

function SidebarNav({
  activeTab,
  onTabChange,
  dashboardTabs,
  isCollapsed,
  onToggleCollapse,
  onNavigate,
  onNewPost,
}: {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  dashboardTabs: DashboardTabs;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate?: () => void;
  onNewPost?: () => void;
}) {
  const [userRole, setUserRole] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(activeTab === 'settings');
  const { navigateToCreateListing } = usePostListingNavigation();
  const { activeSection, setActiveSection } = useSettings();
  useEffect(() => {
    setUserRole(getUserRole());
  }, []);
  useEffect(() => {
    if (activeTab === 'settings') setIsSettingsOpen(true);
  }, [activeTab]);

  const handleTabChange = (tab: TabType) => {
    onTabChange(tab);
    onNavigate?.();
  };

  const visibleMainTabs = Object.entries(dashboardTabs)
    .filter(([t, v]) => v && tabConfig[t as TabType]?.group === 'main')
    .map(([t]) => t as TabType);
  const visibleAccountTabs = Object.entries(dashboardTabs)
    .filter(([t, v]) => v && tabConfig[t as TabType]?.group === 'account')
    .map(([t]) => t as TabType);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ── Brand header ─────────────────────────────────────────── */}
      <div
        className={cn(
          'relative flex shrink-0 items-center gap-2.5 px-3 pb-4 pt-1',
          isCollapsed && 'justify-center px-2',
        )}
      >
        <button
          type="button"
          onClick={onToggleCollapse}
          className={cn(
            'relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
            'bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2] shadow-md',
            'transition-transform duration-200 hover:scale-105 active:scale-95',
          )}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Icon name="agriculture" className="text-[1rem] text-white" />
        </button>

        {!isCollapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate font-headline text-[13px] font-bold leading-tight text-[#0b5d68] dark:text-[#2eb5c2]">
              Lokhari
            </p>
            <p className="truncate text-[10px] font-medium tracking-wide text-on-surface-variant">
              Exchange Dashboard
            </p>
          </div>
        )}

        {!isCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
            aria-label="Collapse sidebar"
          >
            <Icon name="chevron_left" className="text-[0.9rem]" />
          </button>
        )}
      </div>

      {/* ── Post Listing CTA ─────────────────────────────────────── */}
      {userRole !== 'trader' && (
        <div className={cn('mb-3 px-3', isCollapsed && 'px-2')}>
          <button
            type="button"
            onClick={() => {
              if (onNewPost) {
                onNewPost();
                onNavigate?.();
              } else {
                navigateToCreateListing();
                onNavigate?.();
              }
            }}
            title="New Post"
            className={cn(
              'group relative overflow-hidden rounded-lg font-body text-xs font-semibold text-white',
              'bg-gradient-to-r from-[#e89151] to-[#d55b39] shadow-sm',
              'transition-all duration-200 hover:shadow-md hover:brightness-105 active:scale-[0.97]',
              isCollapsed
                ? 'mx-auto flex h-8 w-8 items-center justify-center'
                : 'flex w-full items-center gap-1.5 px-3 py-2',
            )}
          >
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
            <Icon name="add_circle" className="shrink-0 text-[1rem]" />
            {!isCollapsed && <span>New Post</span>}
          </button>
        </div>
      )}

      {/* ── Nav ─────────────────────────────────────────── */}
      <nav className="flex-1 space-y-px overflow-y-auto px-2 pb-4 scrollbar-thin">
        {visibleMainTabs.map((tabKey) => {
          const config = tabConfig[tabKey];
          const isActive = activeTab === tabKey;
          return (
            <NavItem
              key={tabKey}
              icon={config.icon}
              label={config.label}
              isActive={isActive}
              isCollapsed={isCollapsed}
              onClick={() => handleTabChange(tabKey)}
            />
          );
        })}


        {visibleAccountTabs.map((tabKey) => {
          if (tabKey === 'settings') {
            return (
              <div key="settings">
                <NavItem
                  icon={tabConfig.settings.icon}
                  label="Settings"
                  isActive={activeTab === 'settings'}
                  isCollapsed={isCollapsed}
                  onClick={() => {
                    if (!isCollapsed) setIsSettingsOpen((p) => !p);
                    handleTabChange('settings');
                  }}
                  trailingIcon={
                    !isCollapsed ? (isSettingsOpen ? 'expand_less' : 'expand_more') : undefined
                  }
                />

                {/* Settings sub-items */}
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-300 ease-out',
                    !isCollapsed && isSettingsOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0',
                  )}
                >
                  <div className="ml-2.5 mt-0.5 space-y-px border-l-2 border-[#2eb5c2]/30 pl-2.5">
                    {settingsSubTabs.map((item) => {
                      const isSubActive = activeTab === 'settings' && activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            onTabChange('settings');
                            setActiveSection(item.id as SettingsSection);
                            onNavigate?.();
                          }}
                          className={cn(
                            'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-all duration-150',
                            isSubActive
                              ? 'bg-[#2eb5c2]/15 text-[#0b5d68] dark:text-[#2eb5c2]'
                              : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
                          )}
                        >
                          <Icon name={item.icon} className="text-[0.85rem]" />
                          {item.label}
                          {isSubActive && (
                            <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#2eb5c2]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          }

          const config = tabConfig[tabKey];
          const isActive = activeTab === tabKey;
          return (
            <NavItem
              key={tabKey}
              icon={config.icon}
              label={config.label}
              isActive={isActive}
              isCollapsed={isCollapsed}
              onClick={() => handleTabChange(tabKey)}
            />
          );
        })}
      </nav>
    </div>
  );
}

// ─── Reusable nav item ────────────────────────────────────────────────────────

function NavItem({
  icon,
  label,
  isActive,
  isCollapsed,
  onClick,
  trailingIcon,
}: {
  icon: string;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
  trailingIcon?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={isCollapsed ? label : undefined}
      className={cn(
        'group relative flex w-full items-center rounded-lg text-[13px] font-medium transition-all duration-150',
        isCollapsed ? 'justify-center px-1.5 py-2' : 'gap-2.5 px-2.5 py-2',
        isActive
          ? 'bg-gradient-to-r from-[#0b5d68] to-[#2eb5c2] text-white shadow-sm'
          : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
      )}
    >
      {/* Active left bar */}
      {isActive && !isCollapsed && (
        <div className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-white/60" />
      )}

      {/* Icon */}
      <span
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-all duration-150',
          isActive ? 'bg-white/20' : 'group-hover:bg-surface-container-high',
        )}
      >
        <Icon name={icon} className="text-[1rem]" />
      </span>

      {!isCollapsed && (
        <>
          <span className="flex-1 text-left font-body">{label}</span>
          {trailingIcon && <Icon name={trailingIcon} className="text-[0.9rem] opacity-60" />}
        </>
      )}
    </button>
  );
}

// ─── Sidebar shell ────────────────────────────────────────────────────────────

export function Sidebar({
  activeTab,
  onTabChange,
  dashboardTabs,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onMobileClose,
  onNewPost,
}: SidebarProps) {
  const sharedNavProps = { activeTab, onTabChange, dashboardTabs, isCollapsed, onToggleCollapse, onNewPost };

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 flex-col',
          'border-r border-outline/50 bg-surface py-4',
          'transition-all duration-300 ease-in-out md:flex',
          isCollapsed ? 'w-[4.5rem]' : 'w-64',
        )}
      >
        <SidebarNav {...sharedNavProps} />
      </aside>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            aria-label="Close navigation menu"
            onClick={onMobileClose}
          />

          {/* Drawer panel */}
          <aside
            className={cn(
              'absolute left-0 top-0 flex h-full w-[min(17rem,90vw)] flex-col',
              'border-r border-outline/50 bg-surface py-4 shadow-2xl',
            )}
          >
            {/* Mobile drawer header */}
            <div className="mb-2 flex items-center justify-between px-4">
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Navigation
              </span>
              <button
                type="button"
                onClick={onMobileClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                aria-label="Close menu"
              >
                <Icon name="close" className="text-base" />
              </button>
            </div>

            <SidebarNav {...sharedNavProps} isCollapsed={false} onNavigate={onMobileClose} />
          </aside>
        </div>
      )}
    </>
  );
}
