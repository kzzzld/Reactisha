/* global __dirname */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const ts = require('typescript');
const catalog = require('../src/i18n/languages.json');
const sourcePath = path.join(__dirname, '../src/i18n/translate.ts');
const service = {};
const code = ts.transpileModule(fs.readFileSync(sourcePath, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText;
new Function('exports', 'require', code)(service, createRequire(sourcePath));
const placeholders = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();

test('each language contains the same nonempty messages and placeholders as English', () => {
  const englishKeys = Object.keys(catalog.en.messages).sort();
  for (const language of Object.values(catalog)) {
    assert.ok(language.name && language.locale);
    assert.doesNotThrow(() => new Intl.DateTimeFormat(language.locale));
    assert.deepEqual(Object.keys(language.messages).sort(), englishKeys);
    for (const key of englishKeys) {
      assert.ok(language.messages[key].trim(), key);
      assert.deepEqual(placeholders(language.messages[key]), placeholders(catalog.en.messages[key]), key);
    }
  }
});

test('the translator interpolates whole messages and preserves unknown placeholders', () => {
  assert.equal(service.createTranslator('en')('prayer.next', { prayer: 'Fajr' }), 'Fajr is next');
  assert.equal(service.createTranslator('tr')('prayer.next', { prayer: 'İmsak' }), 'Sıradaki namaz: İmsak');
  assert.equal(service.createTranslator('en')('rounding.summary', { radius: 0 }), 'Corner rounding · 0');
  assert.equal(service.createTranslator('en')('prayer.next'), '{prayer} is next');
  assert.equal(service.createTranslator('en')('prayer.next', { prayer: '$&' }), '$& is next');
});

test('unsupported languages and missing or empty messages fall back to English', () => {
  assert.equal(service.createTranslator('unsupported')('common.done'), 'Done');
  assert.equal(service.getLanguage('toString'), 'en');
  const original = catalog.tr.messages['common.done'];
  try {
    delete catalog.tr.messages['common.done'];
    assert.equal(service.createTranslator('tr')('common.done'), 'Done');
    catalog.tr.messages['common.done'] = '';
    assert.equal(service.createTranslator('tr')('common.done'), 'Done');
  } finally { catalog.tr.messages['common.done'] = original; }
});

test('JSON language entries automatically populate the language picker', () => {
  assert.deepEqual(service.availableLanguages.map((item) => item.code).sort(), Object.keys(catalog).sort());
  assert.equal(service.languageLocale('tr'), 'tr-TR');
});

test('JSX display copy and accessibility strings use the translation catalog', () => {
  const failures = [];
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const filename = path.join(directory, entry.name);
      if (entry.isDirectory()) { walk(filename); continue; }
      if (!filename.endsWith('.tsx')) continue;
      const file = ts.createSourceFile(filename, fs.readFileSync(filename, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      function report(node) {
        const { line } = file.getLineAndCharacterOfPosition(node.getStart(file));
        failures.push(`${path.relative(path.join(__dirname, '..'), filename)}:${line + 1}: ${node.getText(file).trim()}`);
      }
      function visit(node) {
        if (ts.isJsxText(node) && /\p{L}/u.test(node.text)) report(node);
        if (ts.isJsxExpression(node) && node.expression && ts.isStringLiteral(node.expression) && /\p{L}/u.test(node.expression.text)) report(node);
        if (ts.isJsxAttribute(node) && ['accessibilityLabel', 'accessibilityHint', 'placeholder', 'title', 'alt'].includes(node.name.getText(file))
          && node.initializer && ts.isStringLiteral(node.initializer) && /\p{L}/u.test(node.initializer.text)) report(node);
        ts.forEachChild(node, visit);
      }
      visit(file);
    }
  }
  walk(path.join(__dirname, '../src'));
  assert.deepEqual(failures, [], `Move rendered text to src/i18n/languages.json:\n${failures.join('\n')}`);
});


test('device language defaults to Turkish for Turkish locales and English for unsupported locales', () => {
  for (const locale of ['tr', 'tr-TR', 'tr-CY', 'TR-tr', 'tr_TR']) assert.equal(service.deviceLanguage(locale), 'tr');
  for (const locale of ['en', 'en-TR', 'en-US', 'de-DE', 'ar', '', null, undefined]) assert.equal(service.deviceLanguage(locale), 'en');
});
