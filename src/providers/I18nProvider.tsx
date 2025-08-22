import { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface I18nContextType {
  t: (key: string, options?: any) => string;
  tBatch: (keys: string[]) => Record<string, string>;
  changeLanguage: (lang: string) => Promise<void>;
  currentLang: string;
  isAmharic: boolean;
  isEnglish: boolean;
  ready: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

export const useI18nContext = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18nContext must be used within an I18nProvider');
  }
  return context;
};

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider = ({ children }: I18nProviderProps) => {
  const { t, i18n, ready } = useTranslation();

  const changeLanguage = useCallback(async (lang: string) => {
    await i18n.changeLanguage(lang);
  }, [i18n]);

  const tBatch = useCallback((keys: string[]): Record<string, string> => {
    const result: Record<string, string> = {};
    keys.forEach(key => {
      result[key] = t(key);
    });
    return result;
  }, [t]);

  const contextValue = useMemo(() => ({
    t,
    tBatch,
    changeLanguage,
    currentLang: i18n.language,
    isAmharic: i18n.language === 'am',
    isEnglish: i18n.language === 'en',
    ready,
  }), [t, tBatch, changeLanguage, i18n.language, ready]);

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
};

export default I18nProvider;