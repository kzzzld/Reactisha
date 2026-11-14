# Reactisha

Prayer times and Quran ayahs built with Expo, TypeScript, and Expo Router for Android, iOS, and web. Includes searchable AlAdhan locations, English and Turkish, automatic device-language detection, and saved preferences.

## Development

```sh
npm install
npm start
```

Install Expo Go from Google Play on your Android phone. Connect the phone and computer to the same Wi-Fi network, then scan the terminal QR code from Expo Go. Use `npm run web` for the browser.

```sh
npm run lint
npm run typecheck
```

Edit screens in `src/app/`. Run `node --test tests/*.test.cjs` for service and localization checks.

## Android releases

Download the signed APK from [GitHub Releases](https://github.com/kzzzld/Reactisha/releases). Open it on your Android device and allow installation from your browser if prompted.

Create a signed standalone APK using Expo-managed Android credentials:

```sh
npx eas-cli@latest build --platform android --profile apk
```

The linked Expo project is **[Reactisha](https://expo.dev/accounts/kzzzld/projects/Reactisha)** (slug `Reactisha`). It reuses the original Android signing key and package so future APKs can update existing installations. The former `SalatTimer` Expo project was deleted after migration. The signed v1.0.0 APK remains available on [GitHub Releases](https://github.com/kzzzld/Reactisha/releases/tag/v1.0.0).

Signing keys and APK files are not stored in Git; APKs are attached to releases.

## Android tools on this Mac

- Android Studio
- Java 17 (Apple Silicon Homebrew installation)
- Android SDK at `~/Library/Android/sdk`
- Android SDK Platform 37.0, Build Tools 37.0.0, and platform tools
- Android NDK 27.1.12297006 and CMake 3.22.1
- Gradle 9.4.1 through the project's wrapper
- Watchman for file watching

The Android and Java environment variables are configured in `~/.zprofile`. Open a new terminal after setup. No emulator is installed; this setup uses a physical Android phone.

`npm start` is the simplest way to open the app in Expo Go on your phone. For USB testing, enable Developer options and USB debugging on the phone, connect it, and accept the debugging prompt. `adb devices` should list it as `device`.

`npm run android` opens Expo Go on a connected Android device. For a custom native development build, use `npm run android:build`; Gradle can download additional build dependencies on its first run.

## iOS

iOS remains configured, but Xcode and the iOS simulator are intentionally not installed. Local iOS builds require Xcode. Supported features can be previewed on a physical iPhone using Expo Go; cloud builds are another option.

## Dependency notes

The lockfile pins installed dependencies. The current Expo and ESLint dependency trees report a moderate minimatch advisory. Compatible automatic fixes did not resolve it; avoid `npm audit fix --force`, which proposes a breaking Expo downgrade. Recheck with `npm audit` when updating dependencies.
