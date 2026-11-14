import catalog from '../data/aladhan-cities.json';
import type { PrayerLocation } from '../data/prayer-times';
import { cityDate } from './prayer-times';

export type City = { id: string; city: string; country: string; state?: string };
export const aladhanCities: City[] = catalog.cities;
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/ı/g, 'i');
export function searchCities(query: string) {
  const terms = normalize(query).trim().split(/\s+/);
  return aladhanCities.filter((city) => terms.every((term) => normalize(`${city.id} ${city.country}`).includes(term)));
}
export function parseCityLocation(payload: unknown, city: City): PrayerLocation {
  const result = payload as { code?: number; data?: { meta?: { latitude?: number; longitude?: number; timezone?: string; method?: { id?: number } } } };
  const meta = result?.data?.meta;
  if (result?.code !== 200 || !meta || typeof meta.latitude !== 'number' || !Number.isFinite(meta.latitude) || Math.abs(meta.latitude) > 90
    || typeof meta.longitude !== 'number' || !Number.isFinite(meta.longitude) || Math.abs(meta.longitude) > 180
    || !meta.timezone || !Number.isInteger(meta.method?.id)) throw new Error('Invalid city lookup response');
  new Intl.DateTimeFormat('en', { timeZone: meta.timezone });
  return { city: city.city, country: city.country, lookupByCity: true, ...(city.state ? { state: city.state } : {}), latitude: meta.latitude, longitude: meta.longitude, timezone: meta.timezone, method: meta.method!.id! };
}
export async function resolveCity(city: City, signal: AbortSignal): Promise<PrayerLocation> {
  const query = new URLSearchParams({ city: city.city, country: city.country });
  if (city.state) query.set('state', city.state);
  const response = await fetch(`https://api.aladhan.com/v1/timingsByCity/${cityDate(new Date(), 'UTC')}?${query}`, { signal });
  if (!response.ok) throw new Error(`City lookup returned ${response.status}`);
  return parseCityLocation(await response.json(), city);
}
