import type { Language, TranslationKey } from '@/i18n/translate';
export const ayahSources = [
  { id: 'alquran-cloud', name: 'Al Quran Cloud', nameKey: 'sources.alquranCloud.name' satisfies TranslationKey, descriptionKey: 'sources.alquranCloud.description' satisfies TranslationKey },
  { id: 'quran-cdn', name: 'Quran API · jsDelivr', nameKey: 'sources.quranCdn.name' satisfies TranslationKey, descriptionKey: 'sources.quranCdn.description' satisfies TranslationKey },
] as const;
export type AyahSource = (typeof ayahSources)[number];
export type Ayah = { number: number; surah: number; verse: number; surahName: string | null; arabic: string; translation: string; attributionKey: TranslationKey; language: Language };

// Explicit provider editions: scripture translations always come from the network.
export const translationEditions = {
  en: { cloud: 'en.pickthall', cdn: 'eng-mohammedmarmadu', attributionKey: 'ayah.translation.english' },
  tr: { cloud: 'tr.diyanet', cdn: 'tur-diyanetisleri', attributionKey: 'ayah.translation.turkish' },
} as const satisfies Record<Language, { cloud: string; cdn: string; attributionKey: TranslationKey }>;

// Standard Hafs verse counts in surah order; 6,236 ayahs across 114 surahs.
const verseCounts = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];
export const AYAH_COUNT = verseCounts.reduce((sum, count) => sum + count, 0);

export function ayahReference(number: number) {
  if (!Number.isInteger(number) || number < 1 || number > AYAH_COUNT) throw new Error('Invalid ayah number.');
  let verse = number;
  for (let index = 0; index < verseCounts.length; index++) {
    if (verse <= verseCounts[index]) return { surah: index + 1, verse };
    verse -= verseCounts[index];
  }
  throw new Error('Invalid ayah number.');
}
export function randomAyahNumber(previous?: number) {
  const validPrevious = previous !== undefined && previous >= 1 && previous <= AYAH_COUNT;
  const choice = Math.floor(Math.random() * (AYAH_COUNT - (validPrevious ? 1 : 0))) + 1;
  return validPrevious && choice >= previous ? choice + 1 : choice;
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid ayah response.');
  return value as Record<string, unknown>;
}
function text(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) throw new Error('The source returned an empty ayah.');
  return value;
}
export function parseCloudAyah(payload: unknown, number: number, language: Language = 'en'): Ayah {
  const body = record(payload);
  if (body.code !== 200 || !Array.isArray(body.data)) throw new Error('Invalid ayah response.');
  const editions = body.data.map(record);
  const arabic = editions.find((item) => record(item.edition).identifier === 'quran-uthmani');
  const translation = editions.find((item) => record(item.edition).identifier === translationEditions[language].cloud);
  const reference = ayahReference(number);
  if (!arabic || !translation || arabic.number !== number || translation.number !== number) throw new Error('Mismatched ayah response.');
  for (const edition of [arabic, translation]) {
    if (record(edition.surah).number !== reference.surah || edition.numberInSurah !== reference.verse) throw new Error('Mismatched verse reference.');
  }
  return { number, ...reference, surahName: text(record(arabic.surah).englishName), arabic: text(arabic.text), translation: text(translation.text), attributionKey: translationEditions[language].attributionKey, language };
}
export function parseCdnAyah(arabicPayload: unknown, translationPayload: unknown, number: number, language: Language = 'en'): Ayah {
  const arabic = record(arabicPayload);
  const translation = record(translationPayload);
  const reference = ayahReference(number);
  for (const edition of [arabic, translation]) {
    if (edition.chapter !== reference.surah || edition.verse !== reference.verse) throw new Error('Mismatched verse reference.');
  }
  return { number, ...reference, surahName: null, arabic: text(arabic.text), translation: text(translation.text), attributionKey: translationEditions[language].attributionKey, language };
}
async function fetchJson(url: string, signal: AbortSignal): Promise<unknown> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Ayah source returned HTTP ${response.status}.`);
  return response.json();
}
export async function fetchAyah(source: AyahSource, number: number, signal: AbortSignal, language: Language = 'en'): Promise<Ayah> {
  const reference = ayahReference(number);
  if (source.id === 'alquran-cloud') {
    const payload = await fetchJson(`https://api.alquran.cloud/v1/ayah/${number}/editions/quran-uthmani,${translationEditions[language].cloud}`, signal);
    return parseCloudAyah(payload, number, language);
  }
  const base = 'https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions';
  const [arabic, translation] = await Promise.all([
    fetchJson(`${base}/ara-quranuthmanihaf/${reference.surah}/${reference.verse}.json`, signal),
    fetchJson(`${base}/${translationEditions[language].cdn}/${reference.surah}/${reference.verse}.json`, signal),
  ]);
  return parseCdnAyah(arabic, translation, number, language);
}
