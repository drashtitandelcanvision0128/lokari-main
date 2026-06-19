'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { UsersPanel } from '@/components/admin/panels/UsersPanel';
import { ListingsPanel } from '@/components/admin/panels/ListingsPanel';
import { OrdersPanel } from '@/components/admin/panels/OrdersPanel';
import { DisputesPanel } from '@/components/admin/panels/DisputesPanel';
import { AnalyticsPanel } from '@/components/admin/panels/AnalyticsPanel';
import { AuditLogPanel } from '@/components/admin/panels/AuditLogPanel';
import { useAdminShell } from '@/components/admin/AdminShellContext';
import { TabType } from '@/types/admin';

const TAB_COMPONENTS = {
  users: UsersPanel,
  listings: ListingsPanel,
  orders: OrdersPanel,
  disputes: DisputesPanel,
  analytics: AnalyticsPanel,
  auditLog: AuditLogPanel,
} as const;

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const { searchQuery } = useAdminShell();

  const tabParam = searchParams.get('tab') as TabType | null;
  const activeTab: TabType =
    tabParam && tabParam in TAB_COMPONENTS ? tabParam : 'users';

  const ActiveComponent = TAB_COMPONENTS[activeTab];

  return <ActiveComponent searchQuery={searchQuery} />;
}

export default function AdminPage() {
  return (
    <Suspense fallback={null}>
      <AdminDashboardContent />
    </Suspense>
  );
}
