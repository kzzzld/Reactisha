import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AppPreferencesProvider, useAppPreferences } from '@/context/app-preferences';
import { I18nProvider } from '@/i18n/provider';

export const unstable_settings = { anchor: '(tabs)' };

function RootNavigator() {
  const { colors } = useAppPreferences();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />;
}
export default function RootLayout() {
  useEffect(() => { SplashScreen.hideAsync().catch(() => {}); }, []);
  return <I18nProvider><AppPreferencesProvider><RootNavigator /></AppPreferencesProvider></I18nProvider>;
}
