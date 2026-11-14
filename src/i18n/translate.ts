import languages from './languages.json';

export type Language = keyof typeof languages;
export type TranslationKey = keyof typeof languages.en.messages;
export type TranslationParams = Readonly<Record<string, string | number>>;
export const availableLanguages = (Object.keys(languages) as Language[]).map((code) => ({ code, name: languages[code].name }));

export function getLanguage(code: string): Language {
  return Object.prototype.hasOwnProperty.call(languages, code) ? code as Language : 'en';
}
export function createTranslator(code: string) {
  const language = getLanguage(code);
  const messages: Partial<Record<TranslationKey, string>> = languages[language].messages;
  return (key: TranslationKey, params: TranslationParams = {}): string => {
    const message = messages[key] || languages.en.messages[key] || key;
    return message.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
      Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : placeholder);
  };
}
export function languageLocale(language: Language): string { return languages[language].locale; }
