import { ReactNode } from 'react';
import { I18nContext, useI18nState } from '@/hooks/useI18n';

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const i18nState = useI18nState();

  return (
    <I18nContext.Provider value={i18nState}>
      {children}
    </I18nContext.Provider>
  );
}
