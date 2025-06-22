import { useState, useEffect, createContext, useContext } from 'react';
import { translations, type Language, type TranslationKey } from '@/lib/translations';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export function useI18nState() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('pos-language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('pos-language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    let text = translations[language][key] || key;
    
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(`{{${param}}}`, String(value));
      });
    }
    
    return text;
  };

  return { language, setLanguage, t };
}
