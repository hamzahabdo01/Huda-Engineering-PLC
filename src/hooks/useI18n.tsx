import { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

// Cache for translation keys to avoid repeated lookups
const translationCache = new Map<string, string>();

export const useI18n = () => {
  const { t, i18n, ready } = useTranslation();
  const currentLang = useRef(i18n.language);

  // Memoized translation function with caching
  const translate = useCallback((key: string, options?: any): string => {
    const cacheKey = `${currentLang.current}:${key}:${JSON.stringify(options || {})}`;
    
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }
    
    const result = t(key, options);
    translationCache.set(cacheKey, result);
    return result;
  }, [t]);

  // Clear cache when language changes
  const changeLanguage = useCallback(async (lang: string) => {
    if (currentLang.current !== lang) {
      translationCache.clear();
      currentLang.current = lang;
      await i18n.changeLanguage(lang);
    }
  }, [i18n]);

  // Memoized language info
  const languageInfo = useMemo(() => ({
    current: currentLang.current,
    isRTL: ['ar', 'he', 'fa'].includes(currentLang.current),
    isAmharic: currentLang.current === 'am',
    isEnglish: currentLang.current === 'en',
  }), [currentLang.current]);

  // Batch translation for multiple keys
  const translateBatch = useCallback((keys: string[]): Record<string, string> => {
    const result: Record<string, string> = {};
    keys.forEach(key => {
      result[key] = translate(key);
    });
    return result;
  }, [translate]);

  return {
    t: translate,
    tBatch: translateBatch,
    i18n,
    ready,
    changeLanguage,
    languageInfo,
    currentLang: currentLang.current,
  };
};

export default useI18n;