import { createContext, useContext } from 'react';
import type { ColorScheme } from '@/data/color-schemes';
import type { PrayerLocation } from '@/data/prayer-times';
import type { AyahSource } from '@/services/ayah';

type Preferences = { colors: ColorScheme; cornerRadius: number; location: PrayerLocation; ayahSource: AyahSource };
export const AppPreferencesContext = createContext<Preferences | null>(null);
export function useAppPreferences() {
  const preferences = useContext(AppPreferencesContext);
  if (!preferences) throw new Error('App preferences provider is missing.');
  return preferences;
}
