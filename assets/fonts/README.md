# Bundled fonts

- JetBrains Mono: official variable font from https://github.com/JetBrains/JetBrainsMono (master, downloaded 2026-11-14). See JetBrainsMono-OFL.txt.
- Iosevka: official static Light, Regular, Medium, and SemiBold from release 34.9.1 at https://github.com/be5invis/Iosevka/releases/tag/v34.9.1. See Iosevka-LICENSE.md.

Iosevka files are subsetted to U+0000–024F, U+0300–036F, U+2000–206F, U+20AC, U+2122, U+2192, and U+2212 for the English interface and Latin city names (including Turkish). Other scripts use platform font fallback. No glyph outlines were altered.

Fonts load from bundled assets using expo-font; no runtime font download is needed. System uses the platform default. Font choices currently last for the app session, matching the color scheme picker.
