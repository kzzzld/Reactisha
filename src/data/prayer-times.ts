import type { TranslationKey } from '@/i18n/translate';
export const prayerNames = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

// Illustrative schedules for the UI. Replace with a prayer-time provider before release.
export const locations = [
  { city: 'Istanbul', country: 'Türkiye', cityKey: 'cities.istanbul' satisfies TranslationKey, countryKey: 'countries.turkiye' satisfies TranslationKey, timezone: 'Europe/Istanbul', times: ['06:21', '07:50', '12:54', '15:26', '17:48', '19:12'] },
  { city: 'Ankara', country: 'Türkiye', cityKey: 'cities.ankara' satisfies TranslationKey, countryKey: 'countries.turkiye' satisfies TranslationKey, timezone: 'Europe/Istanbul', times: ['06:06', '07:34', '12:38', '15:12', '17:31', '18:54'] },
  { city: 'Izmir', country: 'Türkiye', cityKey: 'cities.izmir' satisfies TranslationKey, countryKey: 'countries.turkiye' satisfies TranslationKey, timezone: 'Europe/Istanbul', times: ['06:25', '07:50', '13:01', '15:43', '18:02', '19:23'] },
  { city: 'London', country: 'United Kingdom', cityKey: 'cities.london' satisfies TranslationKey, countryKey: 'countries.unitedKingdom' satisfies TranslationKey, timezone: 'Europe/London', times: ['05:36', '07:17', '11:45', '13:45', '16:13', '17:49'] },
  { city: 'Makkah', country: 'Saudi Arabia', cityKey: 'cities.makkah' satisfies TranslationKey, countryKey: 'countries.saudiArabia' satisfies TranslationKey, timezone: 'Asia/Riyadh', times: ['05:12', '06:29', '12:06', '15:17', '17:43', '19:13'] },
  { city: 'Madinah', country: 'Saudi Arabia', cityKey: 'cities.madinah' satisfies TranslationKey, countryKey: 'countries.saudiArabia' satisfies TranslationKey, timezone: 'Asia/Riyadh', times: ['05:18', '06:39', '12:07', '15:13', '17:35', '19:05'] },
  { city: 'Dubai', country: 'United Arab Emirates', cityKey: 'cities.dubai' satisfies TranslationKey, countryKey: 'countries.unitedArabEmirates' satisfies TranslationKey, timezone: 'Asia/Dubai', times: ['05:13', '06:32', '12:04', '15:10', '17:33', '18:52'] },
  { city: 'New York', country: 'United States', cityKey: 'cities.newYork' satisfies TranslationKey, countryKey: 'countries.unitedStates' satisfies TranslationKey, timezone: 'America/New_York', times: ['05:20', '06:42', '11:40', '14:17', '16:39', '18:01'] },
] as const;
export type PrayerLocation = (typeof locations)[number];
