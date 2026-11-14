import type { TranslationKey } from '@/i18n/translate';
export const prayerNames = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

// City centres and regional AlAdhan calculation methods.
export const locations = [
  { city: 'Istanbul', country: 'Türkiye', cityKey: 'cities.istanbul' satisfies TranslationKey, countryKey: 'countries.turkiye' satisfies TranslationKey, timezone: 'Europe/Istanbul', latitude: 41.0082, longitude: 28.9784, method: 13 },
  { city: 'Ankara', country: 'Türkiye', cityKey: 'cities.ankara' satisfies TranslationKey, countryKey: 'countries.turkiye' satisfies TranslationKey, timezone: 'Europe/Istanbul', latitude: 39.9334, longitude: 32.8597, method: 13 },
  { city: 'Izmir', country: 'Türkiye', cityKey: 'cities.izmir' satisfies TranslationKey, countryKey: 'countries.turkiye' satisfies TranslationKey, timezone: 'Europe/Istanbul', latitude: 38.4237, longitude: 27.1428, method: 13 },
  { city: 'London', country: 'United Kingdom', cityKey: 'cities.london' satisfies TranslationKey, countryKey: 'countries.unitedKingdom' satisfies TranslationKey, timezone: 'Europe/London', latitude: 51.5074, longitude: -0.1278, method: 3 },
  { city: 'Makkah', country: 'Saudi Arabia', cityKey: 'cities.makkah' satisfies TranslationKey, countryKey: 'countries.saudiArabia' satisfies TranslationKey, timezone: 'Asia/Riyadh', latitude: 21.3891, longitude: 39.8579, method: 4 },
  { city: 'Madinah', country: 'Saudi Arabia', cityKey: 'cities.madinah' satisfies TranslationKey, countryKey: 'countries.saudiArabia' satisfies TranslationKey, timezone: 'Asia/Riyadh', latitude: 24.5247, longitude: 39.5692, method: 4 },
  { city: 'Dubai', country: 'United Arab Emirates', cityKey: 'cities.dubai' satisfies TranslationKey, countryKey: 'countries.unitedArabEmirates' satisfies TranslationKey, timezone: 'Asia/Dubai', latitude: 25.2048, longitude: 55.2708, method: 16 },
  { city: 'New York', country: 'United States', cityKey: 'cities.newYork' satisfies TranslationKey, countryKey: 'countries.unitedStates' satisfies TranslationKey, timezone: 'America/New_York', latitude: 40.7128, longitude: -74.006, method: 2 },
] as const;
export type PrayerLocation = {
  city: string; country: string; timezone: string; latitude: number; longitude: number; method: number;
  cityKey?: TranslationKey; countryKey?: TranslationKey;
  lookupByCity?: boolean; state?: string;
};
