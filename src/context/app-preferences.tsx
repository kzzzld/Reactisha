import { useFonts } from 'expo-font';
import { createContext, useContext, type ReactNode } from 'react';
import { FontFamilyContext } from '@/components/app-text';
import { colorSchemes, type ColorScheme } from '@/data/color-schemes';
import { bundledFonts, fontOptions, type FontOption } from '@/data/fonts';
import { locations, type PrayerLocation } from '@/data/prayer-times';
import { ayahSources, type AyahSource } from '@/services/ayah';

import { useSavedPreferences } from './saved-preferences';
import { DEFAULT_CORNER_RADIUS } from '@/services/preferences';
export { DEFAULT_CORNER_RADIUS, MAX_CORNER_RADIUS } from '@/services/preferences';
type Preferences = {
  colors: ColorScheme; setColors: (colors: ColorScheme) => void;
  cornerRadius: number; setCornerRadius: (radius: number) => void;
  location: PrayerLocation; setLocation: (location: PrayerLocation) => void;
  ayahSource: AyahSource; setAyahSource: (source: AyahSource) => void;
  font: FontOption; setFont: (font: FontOption) => void;
  fontsLoaded: boolean; fontError: Error | null; fontFamily: string | undefined;
};
const AppPreferencesContext = createContext<Preferences | null>(null);
export function AppPreferencesProvider({ children }: { children: ReactNode }) {
  const { preferences, update } = useSavedPreferences();
  const colors = colorSchemes.find((item) => item.name === preferences.theme) ?? colorSchemes[0];
  const cornerRadius = preferences.cornerRadius ?? DEFAULT_CORNER_RADIUS;
  const storedLocation = preferences.location;
  const location = storedLocation
    ? locations.find((item) => item.city === storedLocation.city && item.country === storedLocation.country && !storedLocation.lookupByCity) ?? storedLocation
    : locations[0];
  const ayahSource = ayahSources.find((item) => item.id === preferences.ayahSource) ?? ayahSources[0];
  const font = fontOptions.find((item) => item.id === preferences.font) ?? fontOptions[0];
  const setColors = (value: ColorScheme) => update('theme', value.name);
  const setCornerRadius = (value: number) => update('cornerRadius', value);
  const setLocation = (value: PrayerLocation) => update('location', value);
  const setAyahSource = (value: AyahSource) => update('ayahSource', value.id);
  const setFont = (value: FontOption) => update('font', value.id);
  const [fontsLoaded, fontError] = useFonts(bundledFonts);
  const fontFamily = fontsLoaded ? font.family : undefined;
  return (
    <AppPreferencesContext.Provider value={{ colors, setColors, cornerRadius, setCornerRadius, location, setLocation, ayahSource, setAyahSource, font, setFont, fontsLoaded, fontError, fontFamily }}>
      <FontFamilyContext.Provider value={fontFamily}>{children}</FontFamilyContext.Provider>
    </AppPreferencesContext.Provider>
  );
}
export function useAppPreferences() {
  const preferences = useContext(AppPreferencesContext);
  if (!preferences) throw new Error('App preferences provider is missing.');
  return preferences;
}
