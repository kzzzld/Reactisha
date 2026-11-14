import { useSavedPreferences } from '@/context/saved-preferences';
import { useLocales } from 'expo-localization';
import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { createTranslator, deviceLanguage, languageLocale, type Language } from './translate';

type I18nContextValue = { language: Language; locale: string; setLanguage: (language: Language) => void; t: ReturnType<typeof createTranslator> };
const I18nContext = createContext<I18nContextValue | null>(null);
export function I18nProvider({ children }: { children: ReactNode }) {
  const locales = useLocales();
  const { preferences, update } = useSavedPreferences();
  const selectedLanguage = preferences.language;
  const setLanguage = useCallback((language: Language) => update('language', language), [update]);
  const language = selectedLanguage ?? deviceLanguage(locales[0]?.languageCode ?? locales[0]?.languageTag);
  const value = useMemo(() => ({ language, setLanguage, locale: languageLocale(language), t: createTranslator(language) }), [language, setLanguage]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error('I18nProvider is missing.');
  return value;
}
