import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { createTranslator, languageLocale, type Language } from './translate';

type I18nContextValue = { language: Language; locale: string; setLanguage: (language: Language) => void; t: ReturnType<typeof createTranslator> };
const I18nContext = createContext<I18nContextValue | null>(null);
export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const value = useMemo(() => ({ language, setLanguage, locale: languageLocale(language), t: createTranslator(language) }), [language]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error('I18nProvider is missing.');
  return value;
}
