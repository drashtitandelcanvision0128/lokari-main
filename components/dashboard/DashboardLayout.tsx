'use client';

import { ReactNode, useState } from 'react';
import { Sidebar, getDashboardTabLabel } from './Sidebar';
import { DashboardTabs, TabType } from '@/types/dashboard';
import { Icon } from '@/components/ui/Icon';
import Footer from '@/components/common/Footer';

interface DashboardLayoutProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  dashboardTabs: DashboardTabs;
  userName: string;
  userAvatar?: string;
  children: ReactNode;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  role?: string;
  onNewPost?: () => void;
}

export function DashboardLayout({
  activeTab,
  onTabChange,
  dashboardTabs,
  children,
  onNewPost,
}: DashboardLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-surface pt-16 text-on-surface">
      {/* Sidebar + content row */}
      <div className="flex flex-1">
        <Sidebar
          activeTab={activeTab}
          onTabChange={onTabChange}
          dashboardTabs={dashboardTabs}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          isMobileOpen={isMobileNavOpen}
          onMobileClose={() => setIsMobileNavOpen(false)}
          onNewPost={onNewPost}
        />

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="sticky top-16 z-40 flex items-center gap-3 border-b border-outline bg-surface/95 px-4 py-3 backdrop-blur-md md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-outline text-on-surface hover:bg-surface-container"
              aria-label="Open navigation menu"
            >
              <Icon name="menu" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-on-surface">
                {getDashboardTabLabel(activeTab)}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-auto">{children}</div>
        </main>
      </div>

      {/* Footer spans full width below sidebar + content */}
      <Footer />
    </div>
  );
}
