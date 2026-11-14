import { PrayerLocation, prayerNames } from '@/data/prayer-times';

export function getPrayerState(now: Date, location: PrayerLocation) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: location.timezone, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(now);
  const part = (type: string) => Number(parts.find((value) => value.type === type)?.value ?? 0);
  const seconds = part('hour') * 3600 + part('minute') * 60 + part('second');
  const schedule = location.times.map((time) => {
    const [hour, minute] = time.split(':').map(Number);
    return hour * 3600 + minute * 60;
  });
  // Sunrise is useful in the timetable, but is not one of the five prayers.
  const upcoming = schedule.findIndex((time, index) => index !== 1 && time > seconds);
  const nextIndex = upcoming === -1 ? 0 : upcoming;
  const remaining = schedule[nextIndex] + (upcoming === -1 ? 86400 : 0) - seconds;
  const countdown = [Math.floor(remaining / 3600), Math.floor((remaining % 3600) / 60), remaining % 60]
    .map((value) => String(value).padStart(2, '0')).join(':');
  return { nextIndex, nextName: prayerNames[nextIndex], countdown, tomorrow: upcoming === -1, seconds, schedule };
}
