/* global __dirname */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function load(file, dependencies = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const result = {};
  new Function('exports', 'require', code)(result, (name) => dependencies[name]);
  return result;
}
const service = load('../src/services/prayer-times.ts');
const names = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const timer = load('../src/utils/prayer-time.ts', { '../data/prayer-times': { prayerNames: names } });
function payload() {
  return { code: 200, data: {
    date: { gregorian: { date: '14-11-2026' } },
    meta: { timezone: 'Europe/Istanbul', method: { name: 'Test method' } },
    timings: Object.fromEntries(names.map((name, index) => [name, `2026-11-14T${['06:15', '07:43', '12:53', '15:31', '17:53', '19:16'][index]}:00+03:00`])),
  } };
}
test('city dates follow the selected timezone and cross month/year boundaries', () => {
  const now = new Date('2026-12-31T22:30:00Z');
  assert.equal(service.cityDate(now, 'Europe/Istanbul'), '01-01-2027');
  assert.equal(service.cityDate(now, 'America/New_York'), '31-12-2026');
  assert.equal(service.cityDate(now, 'America/New_York', 1), '01-01-2027');
});
test('provider data requires the requested date, timezone and six valid ordered times', () => {
  const data = payload();
  const parsed = service.parsePrayerTimes(data, '14-11-2026', 'Europe/Istanbul');
  assert.equal(parsed.times[0], '06:15');
  assert.equal(parsed.timestamps[0], Date.parse('2026-11-14T03:15:00Z'));
  assert.throws(() => service.parsePrayerTimes(data, '15-11-2026', 'Europe/Istanbul'));
  assert.throws(() => service.parsePrayerTimes(data, '14-11-2026', 'Europe/London'));
  delete data.data.timings.Asr;
  assert.throws(() => service.parsePrayerTimes(data, '14-11-2026', 'Europe/Istanbul'));
});
test('countdown skips sunrise and uses tomorrow’s actual Fajr across DST', () => {
  const today = { times: ['06:00', '07:00', '12:00', '15:00', '17:00', '19:00'], timestamps: [6, 7, 12, 15, 17, 19].map((hour) => Date.parse(`2026-10-24T${String(hour).padStart(2, '0')}:00:00+01:00`)) };
  const tomorrow = { times: ['06:02'], timestamps: [Date.parse('2026-10-25T06:02:00+00:00')] };
  assert.equal(timer.getPrayerState(new Date('2026-10-24T06:30:00+01:00'), today, tomorrow).nextName, 'Dhuhr');
  const state = timer.getPrayerState(new Date('2026-10-24T20:00:00+01:00'), today, tomorrow);
  assert.equal(state.countdown, '11:02:00');
  assert.equal(state.nextTime, '06:02');
  assert.equal(state.tomorrow, true);
});
test('requests carry coordinates, method, timezone and cancellation; failures propagate', async () => {
  const original = global.fetch;
  const controller = new AbortController();
  const location = { latitude: 41.0082, longitude: 28.9784, method: 13, timezone: 'Europe/Istanbul' };
  try {
    global.fetch = async (url, options) => {
      const request = new URL(url);
      assert.equal(request.searchParams.get('method'), '13');
      assert.equal(request.searchParams.get('iso8601'), 'true');
      assert.equal(request.searchParams.get('timezonestring'), location.timezone);
      assert.equal(options.signal, controller.signal);
      return { ok: true, json: async () => payload() };
    };
    await service.fetchPrayerTimes(location, '14-11-2026', controller.signal);
    global.fetch = async () => ({ ok: false, status: 503 });
    await assert.rejects(service.fetchPrayerTimes(location, '14-11-2026', controller.signal), /503/);
  } finally { global.fetch = original; }
});
