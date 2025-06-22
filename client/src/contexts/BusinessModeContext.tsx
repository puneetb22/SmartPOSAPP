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
    queryFn: async () => {
      try {
        // Try to fetch from server first
        const response = await fetch('/api/business-config');
        if (response.ok) {
          const data = await response.json();
          return data;
        }
      } catch (error) {
        console.log('Server unavailable, using offline data');
      }
      
      // Fallback to offline storage
      const savedConfig = localStorage.getItem('pos_business_config');
      if (savedConfig) {
        try {
          return JSON.parse(savedConfig);
        } catch (error) {
          console.error('Failed to parse saved business config:', error);
        }
      }
      
      // Return default configuration for immediate POS access
      const defaultConfig = {
        id: 'default',
        businessType: 'restaurant',
        businessName: 'Demo Store',
        gstin: '',
        address: 'Setup your address in Settings',
        phone: '0000000000',
        email: '',
        userId: 'demo_user',
        isConfigured: true,
        factoryResetProtection: false,
        defaultLanguage: 'en',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Save default config to localStorage
      localStorage.setItem('pos_business_config', JSON.stringify(defaultConfig));
      return defaultConfig;
    },
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
    isConfigured: businessConfig?.isConfigured === true,
    isLoading,
    setBusinessMode,
  };

  return (
    <BusinessModeContext.Provider value={value}>
      {children}
    </BusinessModeContext.Provider>
  );
}
