import { I18nProvider } from '@/i18n/provider';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AppShell } from '@/components/app-shell';
import { PrayerTabs } from '@/components/prayer-tabs';

export default function RootLayout() {
  useEffect(() => { SplashScreen.hideAsync().catch(() => {}); }, []);
  return <I18nProvider><AppShell><PrayerTabs /></AppShell></I18nProvider>;
}
