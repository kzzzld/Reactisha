import { useFonts } from 'expo-font';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { FontFamilyContext } from '@/components/app-text';
import { colorSchemes, type ColorScheme } from '@/data/color-schemes';
import { bundledFonts, fontOptions, type FontOption } from '@/data/fonts';
import { locations, type PrayerLocation } from '@/data/prayer-times';
import { ayahSources, type AyahSource } from '@/services/ayah';

export const DEFAULT_CORNER_RADIUS = 12;
export const MAX_CORNER_RADIUS = 40;
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
  const [colors, setColors] = useState<ColorScheme>(colorSchemes[0]);
  const [cornerRadius, setCornerRadius] = useState(DEFAULT_CORNER_RADIUS);
  const [location, setLocation] = useState<PrayerLocation>(locations[0]);
  const [ayahSource, setAyahSource] = useState<AyahSource>(ayahSources[0]);
  const [font, setFont] = useState<FontOption>(fontOptions[0]);
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
