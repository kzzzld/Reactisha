import type { PrayerLocation } from '../data/prayer-times';
import type { Language } from '../i18n/translate';

export const DEFAULT_CORNER_RADIUS = 12;
export const MAX_CORNER_RADIUS = 40;
export const PREFERENCES_KEY = 'salattimer.preferences.v1';
export type SavedPreferences = {
  version: 1; theme?: string; font?: string; ayahSource?: string;
  cornerRadius?: number; location?: PrayerLocation; language?: Language;
};
function object(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
function location(value: unknown): PrayerLocation | undefined {
  const item = object(value);
  if (typeof item.city !== 'string' || !item.city.trim() || typeof item.country !== 'string' || !item.country.trim()
    || typeof item.latitude !== 'number' || !Number.isFinite(item.latitude) || Math.abs(item.latitude) > 90
    || typeof item.longitude !== 'number' || !Number.isFinite(item.longitude) || Math.abs(item.longitude) > 180
    || typeof item.method !== 'number' || !Number.isInteger(item.method) || item.method < 0
    || typeof item.timezone !== 'string') return;
  try { new Intl.DateTimeFormat('en', { timeZone: item.timezone }); } catch { return; }
  return { city: item.city, country: item.country, latitude: item.latitude, longitude: item.longitude,
    method: item.method, timezone: item.timezone, lookupByCity: item.lookupByCity === true,
    ...(typeof item.state === 'string' ? { state: item.state } : {}) };
}
export function parsePreferences(raw: string | null): SavedPreferences {
  const result: SavedPreferences = { version: 1 };
  if (!raw) return result;
  let data: Record<string, unknown>;
  try { data = object(JSON.parse(raw)); } catch { return result; }
  if (data.version !== 1) return result;
  for (const key of ['theme', 'font', 'ayahSource'] as const) {
    if (typeof data[key] === 'string') result[key] = data[key];
  }
  if (typeof data.cornerRadius === 'number' && Number.isFinite(data.cornerRadius) && data.cornerRadius >= 0 && data.cornerRadius <= MAX_CORNER_RADIUS) result.cornerRadius = data.cornerRadius;
  if (data.language === 'en' || data.language === 'tr') result.language = data.language;
  const savedLocation = location(data.location);
  if (savedLocation) result.location = savedLocation;
  return result;
}

type Storage = { getItem: (key: string) => Promise<string | null>; setItem: (key: string, value: string) => Promise<unknown> };
export function createPreferencesStorage(storage: Storage) {
  let pending = Promise.resolve();
  return {
    async load() { return parsePreferences(await storage.getItem(PREFERENCES_KEY)); },
    save(preferences: SavedPreferences) {
      const snapshot = JSON.stringify(preferences);
      const write = pending.then(() => storage.setItem(PREFERENCES_KEY, snapshot));
      // A failed write must not block future changes; return its failure to the caller.
      pending = write.then(() => {}, () => {});
      return write;
    },
  };
}
