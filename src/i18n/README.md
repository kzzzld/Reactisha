# Translations

All app-owned display copy lives in `languages.json`. Each language has a native `name`, an Intl `locale`, and a flat `messages` dictionary with stable semantic keys. English (`en`) is the fallback and defines the TypeScript key union.

```tsx
const { t, locale } = useI18n();
<Text>{t('prayer.next', { prayer: t('prayer.Fajr') })}</Text>
```

Translate complete messages, using `{namedPlaceholders}` for runtime values. Translators can reorder placeholders; do not concatenate sentence fragments. Use `Intl.DateTimeFormat(locale, options)` and `Intl.NumberFormat(locale, options)` for localized dates and numbers. Clock times and countdown digits retain their 24-hour display.

To add a language, copy a language entry in `languages.json`, change its language code, native name and Intl locale, then translate every message while preserving its key and placeholder names. It appears automatically in Settings → Language. English and Turkish are included. Missing or empty translated messages fall back to English; unsupported language codes also fall back to English. Language choices currently last for the app session, like the other appearance preferences.

Data definitions use typed `nameKey`, `descriptionKey`, `cityKey`, and `countryKey` fields. Stable names and IDs are for lookups and API calls, not display. Accessibility labels/hints, search placeholders, validation, loading states, and empty states also use the catalog. Numeric preview data, code examples, URLs, API identifiers, and developer-only errors are not translated.

Network Quran text is displayed verbatim. UI language does not select an ayah translation edition: both current sources provide Arabic plus Pickthall’s English translation. Provider-supplied surah names remain proper names; app-generated reference labels use the catalog. Do not translate or paraphrase scripture to localize the interface.

Run `node --test tests/*.test.cjs` to check catalog key/placeholder parity, fallback behavior, interpolation, literal JSX copy, and the ayah service. Also run lint and typecheck. Before adding an RTL language, implement and verify RTL layout and appropriate font fallback; the shipped locales are LTR.
