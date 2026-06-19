'use client';

import { createContext, useContext, type ReactNode } from 'react';

interface AdminShellContextValue {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const AdminShellContext = createContext<AdminShellContextValue>({
  searchQuery: '',
  setSearchQuery: () => {},
});

export function AdminShellProvider({
  children,
  searchQuery,
  setSearchQuery,
}: {
  children: ReactNode;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) {
  return (
    <AdminShellContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </AdminShellContext.Provider>
  );
}

export function useAdminShell() {
  return useContext(AdminShellContext);
}
