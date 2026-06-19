'use client';

import { useState } from 'react';
import { AdminSettingsModal } from '@/components/admin/AdminSettingsModal';
import { useAppSelector } from '@/lib/store/hooks';
import { selectCurrentUser, selectUserDisplayName } from '@/lib/store/slices/authSlice';

export function AdminHeaderSettings({ isDark = false }: { isDark?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [savedProfile, setSavedProfile] = useState<{ username: string; email: string } | null>(
    null,
  );
  const currentUser = useAppSelector(selectCurrentUser);
  const userName = useAppSelector(selectUserDisplayName);

  const initialUsername =
    savedProfile?.username ?? userName ?? currentUser?.fullName ?? 'Admin';
  const initialEmail = savedProfile?.email ?? currentUser?.email ?? 'admin@lokhari.com';

  return (
    <>
      <button
        type="button"
        id="admin-open-settings"
        onClick={() => setIsOpen(true)}
        title="Admin Settings"
        className={`p-2 rounded-lg transition-colors cursor-pointer ${
          isDark
            ? 'text-gray-200 hover:text-white hover:bg-white/10'
            : 'text-[#0b5d68] hover:bg-black/5'
        }`}
      >
        <span className="material-symbols-outlined">settings</span>
      </button>

      <AdminSettingsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initialUsername={initialUsername}
        initialEmail={initialEmail}
        onSave={(profile) => setSavedProfile(profile)}
      />
    </>
  );
}
