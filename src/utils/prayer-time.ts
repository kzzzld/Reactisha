import { prayerNames } from '../data/prayer-times';
import type { DailyPrayers } from '../services/prayer-times';

export function getPrayerState(now: Date, today: DailyPrayers, tomorrow: DailyPrayers) {
  const seconds = now.getTime();
  // Sunrise is useful in the timetable, but is not one of the five prayers.
  const upcoming = today.timestamps.findIndex((time, index) => index !== 1 && time > seconds);
  const nextIndex = upcoming === -1 ? 0 : upcoming;
  const target = upcoming === -1 ? tomorrow.timestamps[0] : today.timestamps[nextIndex];
  const remaining = Math.max(0, Math.ceil((target - seconds) / 1000));
  const countdown = [Math.floor(remaining / 3600), Math.floor((remaining % 3600) / 60), remaining % 60]
    .map((value) => String(value).padStart(2, '0')).join(':');
  return { nextIndex, nextName: prayerNames[nextIndex], nextTime: upcoming === -1 ? tomorrow.times[0] : today.times[nextIndex], countdown, tomorrow: upcoming === -1, seconds, schedule: today.timestamps };
}
