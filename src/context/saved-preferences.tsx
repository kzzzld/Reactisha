import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPreferencesStorage, type SavedPreferences } from '@/services/preferences';

const storage = createPreferencesStorage(AsyncStorage);
type SavedPreferencesContextValue = {
  preferences: SavedPreferences;
  update: <K extends keyof SavedPreferences>(key: K, value: SavedPreferences[K]) => void;
};
const SavedPreferencesContext = createContext<SavedPreferencesContextValue | null>(null);
export function SavedPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<SavedPreferences | null>(null);
  const lastSnapshot = useRef<string | null>(null);
  useEffect(() => {
    let active = true;
    storage.load().catch((error: unknown) => {
      console.warn('Could not restore preferences', error);
      return { version: 1 } as SavedPreferences;
    }).then((saved) => {
      if (active) { lastSnapshot.current = JSON.stringify(saved); setPreferences(saved); }
    });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!preferences || JSON.stringify(preferences) === lastSnapshot.current) return;
    lastSnapshot.current = JSON.stringify(preferences);
    void storage.save(preferences).catch((error: unknown) => console.warn('Could not save preferences', error));
  }, [preferences]);
  const update = useCallback(<K extends keyof SavedPreferences>(key: K, value: SavedPreferences[K]) => {
    setPreferences((current) => current ? { ...current, [key]: value } : current);
  }, []);
  if (!preferences) return null;
  return <SavedPreferencesContext.Provider value={{ preferences, update }}>{children}</SavedPreferencesContext.Provider>;
}
export function useSavedPreferences() {
  const value = useContext(SavedPreferencesContext);
  if (!value) throw new Error('Saved preferences provider is missing.');
  return value;
}
