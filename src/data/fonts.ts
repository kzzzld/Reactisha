import type { TranslationKey } from '@/i18n/translate';
import type { FontFamilyDefinition } from 'expo-font';

export const fontOptions = [
  { id: 'system', name: 'System', nameKey: 'fonts.system.name' satisfies TranslationKey, family: undefined, descriptionKey: 'fonts.system.description' satisfies TranslationKey },
  { id: 'jetbrains', name: 'JetBrains Mono', nameKey: 'fonts.jetbrainsMono.name' satisfies TranslationKey, family: 'JetBrainsMono', descriptionKey: 'fonts.jetbrainsMono.description' satisfies TranslationKey },
  { id: 'iosevka', name: 'Iosevka', nameKey: 'fonts.iosevka.name' satisfies TranslationKey, family: 'Iosevka', descriptionKey: 'fonts.iosevka.description' satisfies TranslationKey },
] as const;
export type FontOption = (typeof fontOptions)[number];

export const bundledFonts: FontFamilyDefinition[] = [
  { fontFamily: 'JetBrainsMono', fontDefinitions: [
    { path: require('@/assets/fonts/JetBrainsMono-Variable.ttf'), weight: '100 800' },
  ] },
  { fontFamily: 'Iosevka', fontDefinitions: [
    { path: require('@/assets/fonts/Iosevka-Light.ttf'), weight: 300 },
    { path: require('@/assets/fonts/Iosevka-Regular.ttf'), weight: 400 },
    { path: require('@/assets/fonts/Iosevka-Medium.ttf'), weight: 500 },
    { path: require('@/assets/fonts/Iosevka-SemiBold.ttf'), weight: 600 },
  ] },
];
