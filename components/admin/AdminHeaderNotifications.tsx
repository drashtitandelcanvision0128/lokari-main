'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { fetchContactInquiryUnreadCount } from '@/lib/admin/contactInquiries';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  selectContactInquiryUnreadCount,
  setContactInquiryUnreadCount,
} from '@/lib/store/slices/adminNotificationsSlice';

export function AdminHeaderNotifications({ isDark = false }: { isDark?: boolean }) {
  const unreadCount = useAppSelector(selectContactInquiryUnreadCount);
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    fetchContactInquiryUnreadCount()
      .then((count) => {
        if (!cancelled) dispatch(setContactInquiryUnreadCount(count));
      })
      .catch(() => {
        if (!cancelled) dispatch(setContactInquiryUnreadCount(0));
      });

    return () => {
      cancelled = true;
    };
  }, [pathname, dispatch]);

  return (
    <Link
      href="/admin/notifications"
      className={`relative p-2 rounded-lg transition-colors ${
        isDark
          ? 'text-gray-200 hover:text-white hover:bg-white/10'
          : 'text-[#0b5d68] hover:bg-black/5'
      }`}
      aria-label="Notifications"
    >
      <span className="material-symbols-outlined">notifications</span>
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
