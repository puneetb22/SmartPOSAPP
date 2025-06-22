import React, { createContext, useContext, ReactNode } from 'react';
import { useOfflineAuth } from '@/hooks/useOfflineAuth';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';

interface OfflineContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (name: string, role?: 'admin' | 'cashier' | 'waiter' | 'kitchen') => any;
  logout: () => void;
  syncStatus: any;
  addPendingSync: (data: any) => void;
  triggerSync: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

interface OfflineProviderProps {
  children: ReactNode;
}

export function OfflineProvider({ children }: OfflineProviderProps) {
  const auth = useOfflineAuth();
  const storage = useOfflineStorage();

  const value: OfflineContextType = {
    ...auth,
    ...storage,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}