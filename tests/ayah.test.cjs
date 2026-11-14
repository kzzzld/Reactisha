/* global __dirname */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Exercise the same pure TypeScript service used by the app, without a native runtime.
const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/services/ayah.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const service = {};
new Function('exports', code)(service);

function cloudPayload() {
  return { code: 200, data: ['quran-uthmani', 'en.pickthall'].map((identifier) => ({
    edition: { identifier }, number: 1, numberInSurah: 1,
    surah: { number: 1, englishName: 'Al-Faatiha' }, text: 'Fixture text',
  })) };
}

test('every global ayah maps to a continuous surah/verse reference', () => {
  assert.equal(service.AYAH_COUNT, 6236);
  assert.deepEqual(service.ayahReference(1), { surah: 1, verse: 1 });
  assert.deepEqual(service.ayahReference(7), { surah: 1, verse: 7 });
  assert.deepEqual(service.ayahReference(8), { surah: 2, verse: 1 });
  assert.deepEqual(service.ayahReference(6236), { surah: 114, verse: 6 });
  let previous = service.ayahReference(1);
  for (let number = 2; number <= 6236; number++) {
    const current = service.ayahReference(number);
    assert.ok((current.surah === previous.surah && current.verse === previous.verse + 1)
      || (current.surah === previous.surah + 1 && current.verse === 1));
    previous = current;
  }
  for (const invalid of [0, -1, 6237, 1.5, NaN]) assert.throws(() => service.ayahReference(invalid));
});

test('random selection stays in range and excludes the previous ayah', () => {
  const original = Math.random;
  try {
    for (const previous of [undefined, 1, 3000, 6236]) {
      for (const random of [0, 0.25, 0.5, 0.99999999]) {
        Math.random = () => random;
        const result = service.randomAyahNumber(previous);
        assert.ok(result >= 1 && result <= 6236);
        assert.notEqual(result, previous);
      }
    }
  } finally { Math.random = original; }
});

test('cloud parser pairs editions and rejects mismatched or empty verses', () => {
  const payload = cloudPayload();
  assert.equal(service.parseCloudAyah(payload, 1).surahName, 'Al-Faatiha');
  payload.data.reverse();
  assert.equal(service.parseCloudAyah(payload, 1).verse, 1);
  payload.data[0].numberInSurah = 2;
  assert.throws(() => service.parseCloudAyah(payload, 1));
  assert.throws(() => service.parseCloudAyah({ code: 200, data: [] }, 1));
  const empty = cloudPayload();
  empty.data[0].text = ' ';
  assert.throws(() => service.parseCloudAyah(empty, 1));
});

test('CDN parser rejects Arabic and translation reference mismatches', () => {
  const payload = { chapter: 1, verse: 1, text: 'Fixture text' };
  assert.equal(service.parseCdnAyah(payload, payload, 1).surah, 1);
  assert.throws(() => service.parseCdnAyah(payload, { ...payload, verse: 2 }, 1));
  assert.throws(() => service.parseCdnAyah({ ...payload, text: '' }, payload, 1));
});

test('network requests use only the chosen provider and pass cancellation signals', async () => {
  const original = global.fetch;
  const requests = [];
  const controller = new AbortController();
  global.fetch = async (url, options) => {
    requests.push(url);
    assert.equal(options.signal, controller.signal);
    return { ok: true, json: async () => url.includes('alquran.cloud') ? cloudPayload() : { chapter: 1, verse: 1, text: 'Fixture text' } };
  };
  try {
    await service.fetchAyah(service.ayahSources[0], 1, controller.signal);
    assert.equal(requests.length, 1);
    assert.match(requests[0], /api\.alquran\.cloud\/v1\/ayah\/1\/editions/);
    requests.length = 0;
    await service.fetchAyah(service.ayahSources[1], 1, controller.signal);
    assert.equal(requests.length, 2);
    assert.ok(requests.every((url) => url.startsWith('https://cdn.jsdelivr.net/')));
    global.fetch = async () => ({ ok: false, status: 503 });
    await assert.rejects(service.fetchAyah(service.ayahSources[0], 1, controller.signal), /503/);
  } finally { global.fetch = original; }
});
