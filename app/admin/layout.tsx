'use client';

import { Suspense, useEffect, useState, type ReactNode } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminShellProvider } from '@/components/admin/AdminShellContext';
import { adminMock } from '@/data/adminMock';
import { AdminTabs, TabType } from '@/types/admin';
import { getCurrentUser } from '@/lib/auth';

const VALID_TABS: TabType[] = [
  'users',
  'listings',
  'orders',
  'disputes',
  'analytics',
  'auditLog',
];

function AdminLayoutShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [adminTabs, setAdminTabs] = useState<AdminTabs | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const isNotifications = pathname.startsWith('/admin/notifications');
  const tabParam = searchParams.get('tab') as TabType | null;
  const activeTab: TabType | null = isNotifications
    ? null
    : tabParam && VALID_TABS.includes(tabParam)
      ? tabParam
      : 'users';

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      router.replace('/admin-login');
      return;
    }
    setCheckingAuth(false);
    setAdminTabs(adminMock.tabs);
  }, [router]);

  const handleTabChange = (tab: TabType) => {
    router.push(`/admin?tab=${tab}`);
  };

  if (checkingAuth || !adminTabs) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-500">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminShellProvider searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
      <AdminLayout
        activeTab={activeTab}
        pageTitle={isNotifications ? 'Contact Inquiries' : undefined}
        hideSearch={isNotifications}
        onTabChange={handleTabChange}
        adminTabs={adminTabs}
        userName={adminMock.user.name}
        userAvatar={adminMock.user.avatar}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      >
        {children}
      </AdminLayout>
    </AdminShellProvider>
  );
}

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center pt-16">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminLayoutShell>{children}</AdminLayoutShell>
    </Suspense>
  );
}
