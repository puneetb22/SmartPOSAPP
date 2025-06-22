import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { BusinessConfig } from '@shared/schema';

type BusinessMode = 'restaurant' | 'pharmacy' | 'agri';

interface BusinessModeContextType {
  businessMode: BusinessMode | null;
  businessConfig: BusinessConfig | null;
  isConfigured: boolean;
  isLoading: boolean;
  setBusinessMode: (mode: BusinessMode) => void;
}

const BusinessModeContext = createContext<BusinessModeContextType | undefined>(undefined);

export function useBusinessMode() {
  const context = useContext(BusinessModeContext);
  if (!context) {
    throw new Error('useBusinessMode must be used within a BusinessModeProvider');
  }
  return context;
}

interface BusinessModeProviderProps {
  children: ReactNode;
}

export function BusinessModeProvider({ children }: BusinessModeProviderProps) {
  const [businessMode, setBusinessModeState] = useState<BusinessMode | null>(null);

  const { data: businessConfig, isLoading } = useQuery({
    queryKey: ['/api/business-config'],
    retry: false,
  });

  useEffect(() => {
    if (businessConfig) {
      setBusinessModeState(businessConfig.businessType as BusinessMode);
    }
  }, [businessConfig]);

  const setBusinessMode = (mode: BusinessMode) => {
    if (businessConfig?.factoryResetProtection) {
      throw new Error('Business mode is protected. Factory reset required to change mode.');
    }
    setBusinessModeState(mode);
  };

  const value: BusinessModeContextType = {
    businessMode,
    businessConfig,
    isConfigured: businessConfig?.isConfigured || false,
    isLoading,
    setBusinessMode,
  };

  return (
    <BusinessModeContext.Provider value={value}>
      {children}
    </BusinessModeContext.Provider>
  );
}
