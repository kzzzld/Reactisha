This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## Git commits

- After completing and validating each logical change, create a focused Git commit automatically. Do not ask for confirmation to commit; the user has authorized local commits as part of the normal workflow.
- Keep unrelated changes in separate commits. Use concise, descriptive commit messages that explain the resulting behavior.
- Run lint and typecheck before committing code changes. Fix failures introduced by your work before committing; report any pre-existing failures.
- Inspect the working tree and staged diff before committing. Stage only files or hunks belonging to your change; preserve unrelated user work and never commit secrets, generated build output, or local environment files.
- If unrelated work is already present, leave it uncommitted unless the user explicitly asks to include it.
- Do not amend, reset, squash, or otherwise rewrite existing commits unless explicitly requested. Do not push to a remote unless requested.
- Before ending the task, confirm your changes are committed and report the commit hashes and any remaining uncommitted work. If permissions or Git configuration prevent a commit, explain the blocker instead of claiming completion.

## Translations and user-facing text

- Put every new or changed app-owned user-facing string in `src/i18n/languages.json` and render it through `useI18n().t(...)`. This applies to all screens, components, tabs, menus, settings, picker labels/descriptions, accessibility labels/hints, placeholders, validation, loading, error, and empty states. Do this automatically as part of each change, without waiting for the user to request translations.
- Use stable, semantic translation keys. Update every supported language with the same keys and named placeholders. If a translation cannot be supplied reliably, explicitly use the English fallback text and report that limitation; never invent a translation you cannot support.
- Translate complete messages with named placeholders, such as `t('prayer.next', { prayer })`. Do not concatenate translated fragments or embed English words in interpolated UI text. Keep internal IDs, API identifiers, routes, and lookup names stable; display their catalog keys instead.
- Format dates and locale-sensitive numbers with the selected locale from `useI18n()`. Preserve intentional clock/countdown formats. Allow translated labels to wrap and respect text scaling.
- Display network-provided scripture and translations verbatim, with their source/edition attribution. UI localization does not authorize translating, paraphrasing, or changing an ayah or its translation. Proper names supplied by a provider, numeric data, URLs, code examples, and developer-only errors do not need catalog entries.
- Follow `src/i18n/README.md` when adding a language. Implement and verify RTL support before adding an RTL locale.
- Run `node --test tests/*.test.cjs` plus lint and typecheck before committing localization or UI-copy changes. Check for hardcoded rendered strings, matching catalog keys/placeholders, English fallback, and behavior after switching languages.
