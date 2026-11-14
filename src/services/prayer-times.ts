import type { PrayerLocation } from '../data/prayer-times';

const names = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
export type DailyPrayers = { times: string[]; timestamps: number[]; method: string };

export function cityDate(now: Date, timezone: string, offset = 0) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  const date = new Date(Date.UTC(value('year'), value('month') - 1, value('day') + offset));
  return `${String(date.getUTCDate()).padStart(2, '0')}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${date.getUTCFullYear()}`;
}

export function parsePrayerTimes(payload: unknown, date: string, timezone: string): DailyPrayers {
  const data = (payload as { code?: number; data?: { timings?: Record<string, string>; date?: { gregorian?: { date?: string } }; meta?: { timezone?: string; method?: { name?: string } } } });
  if (data?.code !== 200 || data.data?.date?.gregorian?.date !== date || data.data?.meta?.timezone !== timezone) throw new Error('Prayer date or timezone mismatch');
  const times = names.map((name) => data.data?.timings?.[name]);
  if (times.some((time) => !time || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?[+-]\d{2}:\d{2}$/.test(time) || !Number.isFinite(Date.parse(time)))) throw new Error('Invalid prayer timings');
  const timestamps = times.map((time) => Date.parse(time!));
  if (timestamps.some((time, index) => index > 0 && time <= timestamps[index - 1])) throw new Error('Unordered prayer timings');
  const method = data.data?.meta?.method?.name;
  if (!method) throw new Error('Missing calculation method');
  return { times: times.map((time) => time!.slice(11, 16)), timestamps, method };
}

export async function fetchPrayerTimes(location: PrayerLocation, date: string, signal: AbortSignal) {
  const query = new URLSearchParams({ latitude: String(location.latitude), longitude: String(location.longitude), method: String(location.method), timezonestring: location.timezone, iso8601: 'true' });
  const response = await fetch(`https://api.aladhan.com/v1/timings/${date}?${query}`, { signal });
  if (!response.ok) throw new Error(`Prayer provider returned ${response.status}`);
  return parsePrayerTimes(await response.json(), date, location.timezone);
}
