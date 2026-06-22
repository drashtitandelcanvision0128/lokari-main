'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

export type SettingsSection =
  | 'profile'
  | 'kyc'
  | 'addresses'
  | 'notifications'
  | 'security';

interface SettingsContextType {
  activeSection: SettingsSection;
  setActiveSection: (section: SettingsSection) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');

  return (
    <SettingsContext.Provider
      value={{
        activeSection,
        setActiveSection,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error('useSettings must be used inside SettingsProvider');
  }

  return context;
}
