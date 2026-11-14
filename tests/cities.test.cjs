/* global __dirname */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const catalog = require('../src/data/aladhan-cities.json');
const service = {};
const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/services/cities.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText;
new Function('exports', 'require', code)(service, (name) => name.endsWith('.json') ? catalog : { cityDate: () => '14-11-2026' });
const paris = { id: 'Paris, France', city: 'Paris', country: 'France' };
const payload = () => ({ code: 200, data: { meta: { latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris', method: { id: 3 } } } });

test('AlAdhan directory contains unique entries and supports country and accent-insensitive searches', () => {
  assert.equal(service.aladhanCities.length, 276);
  assert.equal(new Set(service.aladhanCities.map((city) => city.id)).size, 276);
  assert.ok(service.searchCities('Paris France').some((city) => city.city === 'Paris'));
  assert.ok(service.searchCities('İstanbul').some((city) => city.city === 'Istanbul'));
  assert.ok(service.searchCities('United States').some((city) => city.city === 'New York' && city.state === 'NY'));
  assert.equal(service.searchCities('no-such-city-123').length, 0);
});
test('city selection uses provider coordinates, timezone and method and rejects invalid metadata', () => {
  assert.deepEqual(service.parseCityLocation(payload(), paris), { city: 'Paris', country: 'France', lookupByCity: true, latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris', method: 3 });
  for (const change of [{ latitude: 91 }, { longitude: NaN }, { timezone: 'invalid' }, { method: {} }]) {
    const data = payload(); Object.assign(data.data.meta, change);
    assert.throws(() => service.parseCityLocation(data, paris));
  }
  assert.throws(() => service.parseCityLocation({ code: 400 }, paris));
});
test('lookup encodes city, country and state and propagates cancellation and HTTP failures', async () => {
  const original = global.fetch;
  const controller = new AbortController();
  try {
    global.fetch = async (url, options) => {
      const request = new URL(url);
      assert.equal(request.pathname, '/v1/timingsByCity/14-11-2026');
      assert.equal(request.searchParams.get('city'), 'New York');
      assert.equal(request.searchParams.get('country'), 'United States');
      assert.equal(request.searchParams.get('state'), 'NY');
      assert.equal(options.signal, controller.signal);
      return { ok: true, json: async () => payload() };
    };
    await service.resolveCity({ id: 'New York', city: 'New York', country: 'United States', state: 'NY' }, controller.signal);
    global.fetch = async () => ({ ok: false, status: 429 });
    await assert.rejects(service.resolveCity(paris, controller.signal), /429/);
  } finally { global.fetch = original; }
});
