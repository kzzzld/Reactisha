import type { FontFamilyDefinition } from 'expo-font';

export const fontOptions = [
  { id: 'system', name: 'System', family: undefined, description: 'Your device’s default font' },
  { id: 'jetbrains', name: 'JetBrains Mono', family: 'JetBrainsMono', description: 'Clear, spacious monospace' },
  { id: 'iosevka', name: 'Iosevka', family: 'Iosevka', description: 'Slender, compact monospace' },
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
