/* global __dirname */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const service = {};
const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/services/preferences.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
new Function('exports', code)(service);
const location = { city: 'Paris', country: 'France', latitude: 48.85, longitude: 2.35, method: 12, timezone: 'Europe/Paris', lookupByCity: true };
const settings = { version: 1, theme: 'Nord', font: 'iosevka', ayahSource: 'quran-cdn', language: 'tr', cornerRadius: 0, location };

test('all configuration choices survive saving and a fresh storage instance', async () => {
  const values = new Map();
  const adapter = { getItem: async (key) => values.get(key) ?? null, setItem: async (key, value) => { values.set(key, value); } };
  await service.createPreferencesStorage(adapter).save(settings);
  assert.deepEqual(await service.createPreferencesStorage(adapter).load(), settings);
});
test('first launch preserves automatic device language and invalid data falls back safely', () => {
  for (const value of [null, '', 'invalid JSON', 'null', '[]', '{"version":2,"language":"tr"}']) {
    assert.deepEqual(service.parsePreferences(value), { version: 1 });
  }
  const restored = service.parsePreferences(JSON.stringify({ ...settings, language: 'de', cornerRadius: -1, location: { ...location, timezone: 'invalid' } }));
  assert.equal(restored.language, undefined);
  assert.equal(restored.cornerRadius, undefined);
  assert.equal(restored.location, undefined);
  assert.equal(restored.theme, 'Nord');
  for (const invalid of [{ latitude: 100 }, { longitude: 200 }, { method: 1.5 }, { city: '' }]) {
    assert.equal(service.parsePreferences(JSON.stringify({ ...settings, location: { ...location, ...invalid } })).location, undefined);
  }
});
test('rapid writes are serialized so the latest choice is restored', async () => {
  let value;
  let release;
  let calls = 0;
  const first = new Promise((resolve) => { release = resolve; });
  const store = service.createPreferencesStorage({ getItem: async () => value, setItem: async (_key, next) => {
    calls++;
    if (calls === 1) await first;
    value = next;
  } });
  const old = store.save({ version: 1, language: 'en' });
  const latest = store.save(settings);
  await Promise.resolve();
  assert.equal(calls, 1);
  release();
  await Promise.all([old, latest]);
  assert.deepEqual(await store.load(), settings);
});
test('storage failures propagate without blocking later saves', async () => {
  let fail = true;
  let value;
  const store = service.createPreferencesStorage({
    getItem: async () => { if (fail) throw new Error('read failure'); return value; },
    setItem: async (_key, next) => { if (fail) throw new Error('write failure'); value = next; },
  });
  await assert.rejects(store.load(), /read failure/);
  await assert.rejects(store.save(settings), /write failure/);
  fail = false;
  await store.save(settings);
  assert.deepEqual(await store.load(), settings);
});
