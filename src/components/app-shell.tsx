import { availableLanguages } from '@/i18n/translate';
import { useI18n } from '@/i18n/provider';
import { useFonts } from 'expo-font';
import { useMemo, useState, type ReactNode } from 'react';
import {
  Modal, Platform, Pressable, ScrollView, StatusBar, StyleSheet, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText as Text, FontFamilyContext } from '@/components/app-text';
import { bundledFonts, fontOptions, type FontOption } from '@/data/fonts';
import { colorSchemes, ColorScheme } from '@/data/color-schemes';
import { locations, PrayerLocation } from '@/data/prayer-times';
import { AppPreferencesContext } from '@/context/app-preferences';
import { ayahSources, type AyahSource } from '@/services/ayah';


const DEFAULT_CORNER_RADIUS = 12;
const MAX_CORNER_RADIUS = 40;

export function AppShell({ children }: { children: ReactNode }) {
  const { t, language, setLanguage } = useI18n();
  const [ayahSource, setAyahSource] = useState<AyahSource>(ayahSources[0]);
  const [sourcePickerOpen, setSourcePickerOpen] = useState(false);
  const [fontsLoaded, fontError] = useFonts(bundledFonts);
  const [font, setFont] = useState<FontOption>(fontOptions[0]);
  const [fontPickerOpen, setFontPickerOpen] = useState(false);
  const fontFamily = fontsLoaded ? font.family : undefined;
  const [colors, setColors] = useState<ColorScheme>(colorSchemes[0]);
  const [cornerRadius, setCornerRadius] = useState(DEFAULT_CORNER_RADIUS);
  const [cornerInput, setCornerInput] = useState(String(DEFAULT_CORNER_RADIUS));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const normalizedCornerInput = cornerInput.trim().replace(',', '.');
  const parsedCornerRadius = Number(normalizedCornerInput);
  const validCornerInput = /^\d+(\.\d+)?$/.test(normalizedCornerInput)
    && Number.isFinite(parsedCornerRadius) && parsedCornerRadius >= 0 && parsedCornerRadius <= MAX_CORNER_RADIUS;
  const styles = useMemo(() => createStyles(colors, cornerRadius), [colors, cornerRadius]);
  function updateCornerInput(value: string) {
    setCornerInput(value);
    const normalized = value.trim().replace(',', '.');
    const radius = Number(normalized);
    if (/^\d+(\.\d+)?$/.test(normalized) && Number.isFinite(radius) && radius >= 0 && radius <= MAX_CORNER_RADIUS) {
      setCornerRadius(radius);
    }
  }
  function closeSettings() {
    setCornerInput(String(cornerRadius));
    setSettingsOpen(false);
  }
  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const [location, setLocation] = useState<PrayerLocation>(locations[0]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState('');
  const results = locations.filter((item) => `${item.city} ${item.country} ${t(item.cityKey)} ${t(item.countryKey)}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));

  return (
    <AppPreferencesContext.Provider value={{ colors, cornerRadius, location, ayahSource }}>
    <FontFamilyContext.Provider value={fontFamily}>
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={colors.dark ? "light-content" : "dark-content"} />
      <View style={styles.shell}>
        <View style={styles.header}>
          <Text accessibilityRole="header" style={styles.brand}>{t('app.name')}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={t('menu.open')} accessibilityState={{ expanded: menuOpen }} onPress={() => setMenuOpen(true)} style={({ pressed }) => [styles.menuButton, pressed && styles.pressed]}>
            <View style={styles.dots}>{[0, 1, 2].map((dot) => <View key={dot} style={styles.dot} />)}</View>
          </Pressable>
        </View>
        {children}
      </View>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('menu.close')} style={styles.menuBackdrop} onPress={() => setMenuOpen(false)}>
          <SafeAreaView style={styles.menuSafeArea}>
            <View style={styles.menuPanel}>
              <Pressable accessibilityRole="button" onPress={() => { setMenuOpen(false); setQuery(''); setPickerOpen(true); }} style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}>
                <Text style={styles.menuItemText}>{t('menu.location')}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => { setMenuOpen(false); setThemePickerOpen(true); }} style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}>
                <Text style={styles.menuItemText}>{t('menu.theme')}</Text>
                <Text style={styles.country}>{t(colors.nameKey)}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => { setMenuOpen(false); setFontPickerOpen(true); }} style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}>
                <Text style={styles.menuItemText}>{t('menu.font')}</Text>
                <Text style={styles.country}>{t(font.nameKey)}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => { setMenuOpen(false); setCornerInput(String(cornerRadius)); setSettingsOpen(true); }} style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}>
                <Text style={styles.menuItemText}>{t('menu.settings')}</Text>
                <Text style={styles.country}>{t('rounding.summary', { radius: cornerRadius })}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => { setMenuOpen(false); setSourcePickerOpen(true); }} style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}>
                <Text style={styles.menuItemText}>{t('menu.source')}</Text>
                <Text style={styles.country}>{t(ayahSource.nameKey)}</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </Pressable>
      </Modal>

      <Modal visible={sourcePickerOpen} animationType="slide" onRequestClose={() => setSourcePickerOpen(false)}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.pickerShell}>
            <View style={styles.pickerHeader}>
              <Text accessibilityRole="header" style={styles.sectionTitle}>{t('menu.source')}</Text>
              <Pressable accessibilityRole="button" onPress={() => setSourcePickerOpen(false)} style={styles.cancelButton}><Text style={styles.cancel}>{t('common.done')}</Text></Pressable>
            </View>
            <Text style={styles.pickerHint}>{t('source.hint')}</Text>
            <ScrollView contentContainerStyle={styles.themeList}>
              {ayahSources.map((source) => (
                <Pressable key={source.id} accessibilityRole="radio" accessibilityLabel={t(source.nameKey)} accessibilityState={{ checked: ayahSource.id === source.id }} onPress={() => setAyahSource(source)} style={({ pressed }) => [styles.cityRow, pressed && styles.pressed]}>
                  <View style={styles.schemeCopy}><Text style={styles.cityName}>{t(source.nameKey)}</Text><Text style={styles.country}>{t(source.descriptionKey)}</Text></View>
                  {ayahSource.id === source.id && <Text style={styles.selected}>{t('common.selected')}</Text>}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal visible={settingsOpen} animationType="slide" onRequestClose={closeSettings}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.pickerShell}>
            <View style={styles.pickerHeader}>
              <Text accessibilityRole="header" style={styles.sectionTitle}>{t('menu.settings')}</Text>
              <Pressable accessibilityRole="button" accessibilityState={{ disabled: !validCornerInput }} disabled={!validCornerInput} onPress={closeSettings} style={[styles.cancelButton, !validCornerInput && styles.pressed]}><Text style={styles.cancel}>{t('common.done')}</Text></Pressable>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.settingsContent}>
              <Text style={styles.cityName}>{t('language.title')}</Text>
              <Text style={styles.pickerHint}>{t('language.hint')}</Text>
              {availableLanguages.map((option) => (
                <Pressable key={option.code} accessibilityRole="radio" accessibilityLabel={option.name} accessibilityState={{ checked: language === option.code }} onPress={() => setLanguage(option.code)} style={({ pressed }) => [styles.cityRow, pressed && styles.pressed]}>
                  <Text style={styles.cityName}>{option.name}</Text>
                  {language === option.code && <Text style={styles.selected}>{t('common.selected')}</Text>}
                </Pressable>
              ))}
              <Text style={styles.languageNote}>{t('language.ayahNote')}</Text>
              <Text style={styles.cityName}>{t('rounding.title')}</Text>
              <Text style={styles.pickerHint}>{t('rounding.hint')}</Text>
              <TextInput
                accessibilityLabel={t('rounding.title')}
                accessibilityHint={t('rounding.accessibility', { max: MAX_CORNER_RADIUS })}
                value={cornerInput}
                onChangeText={updateCornerInput}
                inputMode="decimal"
                keyboardType="decimal-pad"
                autoCorrect={false}
                selectTextOnFocus
                returnKeyType="done"
                onSubmitEditing={() => { if (validCornerInput) closeSettings(); }}
                style={[styles.search, { fontFamily }]}
              />
              <Text accessibilityRole={validCornerInput ? undefined : 'alert'} style={styles.inputHint}>{validCornerInput ? t('rounding.range', { max: MAX_CORNER_RADIUS, default: DEFAULT_CORNER_RADIUS }) : t('rounding.error', { max: MAX_CORNER_RADIUS })}</Text>
              <View style={styles.cornerPreview}>
                <Text style={styles.previewName}>{t('rounding.preview')}</Text>
                <Text style={styles.previewTime}>06:21</Text>
              </View>
              <Pressable accessibilityRole="button" onPress={() => { setCornerRadius(DEFAULT_CORNER_RADIUS); setCornerInput(String(DEFAULT_CORNER_RADIUS)); }} style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}>
                <Text style={styles.cancel}>{t('rounding.reset')}</Text>
              </Pressable>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal visible={fontPickerOpen} animationType="slide" onRequestClose={() => setFontPickerOpen(false)}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.pickerShell}>
            <View style={styles.pickerHeader}>
              <Text accessibilityRole="header" style={styles.sectionTitle}>{t('menu.font')}</Text>
              <Pressable accessibilityRole="button" onPress={() => setFontPickerOpen(false)} style={styles.cancelButton}><Text style={styles.cancel}>{t('common.done')}</Text></Pressable>
            </View>
            <Text style={styles.pickerHint}>{t('font.hint')}</Text>
            {!fontsLoaded && <Text accessibilityRole="alert" style={styles.pickerHint}>{fontError ? t('font.error') : t('font.loading')}</Text>}
            <ScrollView contentContainerStyle={styles.themeList}>
              {fontOptions.map((option) => {
                const disabled = option.id !== 'system' && !fontsLoaded;
                return (
                  <Pressable key={option.id} accessibilityRole="radio" accessibilityLabel={t(option.nameKey)} accessibilityState={{ checked: font.id === option.id, disabled }} disabled={disabled} onPress={() => setFont(option)} style={({ pressed }) => [styles.fontRow, (pressed || disabled) && styles.pressed]}>
                    <View style={styles.schemeCopy}>
                      <Text style={[styles.cityName, { fontFamily: disabled ? undefined : option.family }]}>{t(option.nameKey)}</Text>
                      <Text style={styles.country}>{t(option.descriptionKey)}</Text>
                      <Text style={[styles.fontPreview, { fontFamily: disabled ? undefined : option.family }]}>{t('font.preview', { prayer: t('prayer.Fajr'), time: '06:21' })}</Text>
                    </View>
                    {font.id === option.id && <Text style={styles.selected}>{t('common.selected')}</Text>}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal visible={themePickerOpen} animationType="slide" onRequestClose={() => setThemePickerOpen(false)}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.pickerShell}>
            <View style={styles.pickerHeader}>
              <Text accessibilityRole="header" style={styles.sectionTitle}>{t('menu.theme')}</Text>
              <Pressable accessibilityRole="button" onPress={() => setThemePickerOpen(false)} style={styles.cancelButton}><Text style={styles.cancel}>{t('common.done')}</Text></Pressable>
            </View>
            <Text style={styles.pickerHint}>{t('theme.hint')}</Text>
            <ScrollView contentContainerStyle={styles.themeList}>
              {colorSchemes.map((scheme) => (
                <Pressable key={scheme.name} accessibilityRole="radio" accessibilityState={{ checked: colors.name === scheme.name }} accessibilityLabel={t(scheme.nameKey)} onPress={() => setColors(scheme)} style={({ pressed }) => [styles.cityRow, pressed && styles.pressed]}>
                  <View style={styles.schemeInfo}>
                    <View style={[styles.swatch, { backgroundColor: scheme.background, borderColor: scheme.muted }]}><View style={[styles.swatchAccent, { backgroundColor: scheme.green }]} /></View>
                    <View style={styles.schemeCopy}><Text style={styles.cityName}>{t(scheme.nameKey)}</Text><Text style={styles.country}>{t(scheme.descriptionKey)}</Text></View>
                  </View>
                  {colors.name === scheme.name && <Text style={styles.selected}>{t('common.selected')}</Text>}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal visible={pickerOpen} animationType="slide" onRequestClose={() => setPickerOpen(false)}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.pickerShell}>
            <View style={styles.pickerHeader}>
              <Text accessibilityRole="header" style={styles.sectionTitle}>{t('menu.location')}</Text>
              <Pressable accessibilityRole="button" onPress={() => setPickerOpen(false)} style={styles.cancelButton}><Text style={styles.cancel}>{t('common.cancel')}</Text></Pressable>
            </View>
            <Text style={styles.pickerHint}>{t('location.hint')}</Text>
            <TextInput accessibilityLabel={t('location.searchLabel')} placeholder={t('location.searchPlaceholder')} placeholderTextColor={colors.muted} value={query} onChangeText={setQuery} autoCorrect={false} clearButtonMode="while-editing" style={[styles.search, { fontFamily }]} />
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.cityList}>
              {results.map((item) => (
                <Pressable key={item.city} accessibilityRole="button" accessibilityLabel={t('location.format', { city: t(item.cityKey), country: t(item.countryKey) })} accessibilityState={{ selected: item.city === location.city }} onPress={() => { setLocation(item); setPickerOpen(false); }} style={({ pressed }) => [styles.cityRow, pressed && styles.pressed]}>
                  <View><Text style={styles.cityName}>{t(item.cityKey)}</Text><Text style={styles.country}>{t(item.countryKey)}</Text></View>
                  {item.city === location.city && <Text style={styles.selected}>{t('common.selected')}</Text>}
                </Pressable>
              ))}
              {results.length === 0 && <Text style={styles.empty}>{t('location.empty')}</Text>}
            </ScrollView>
            <Text style={styles.sampleNote}>{t('location.sample')}</Text>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
    </FontFamilyContext.Provider>
    </AppPreferencesContext.Provider>
  );
}

const createStyles = (colors: ColorScheme, cornerRadius: number) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  shell: { flex: 1, width: '100%', maxWidth: 560, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 28, paddingTop: 12, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: colors.line },
  brand: { flexShrink: 1, fontSize: 25, fontWeight: '600', color: colors.ink, letterSpacing: -0.7 },
  menuButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  dots: { gap: 4 }, dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.ink },
  pressed: { opacity: 0.55 },
  sectionTitle: { fontSize: 22, fontWeight: '600', color: colors.ink, letterSpacing: -0.5, flexShrink: 1 },
  sampleNote: { textAlign: 'center', fontSize: 12, color: colors.muted, marginTop: 22, lineHeight: 18 },
  menuBackdrop: { flex: 1, backgroundColor: '#142A2220' },
  menuSafeArea: { alignItems: 'flex-end', width: '100%', maxWidth: 560, alignSelf: 'center', paddingRight: 24 },
  menuPanel: { overflow: 'hidden', backgroundColor: colors.background, borderRadius: cornerRadius, marginTop: 60, boxShadow: '0 8px 28px #142A2226' },
  menuItem: { paddingVertical: 20, paddingHorizontal: 24, minWidth: 200 },
  menuItemText: { fontSize: 16, color: colors.ink },
  pickerShell: { flex: 1, width: '100%', maxWidth: 560, alignSelf: 'center', padding: 24 },
  pickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  cancelButton: { minHeight: 44, justifyContent: 'center', paddingLeft: 12 },
  cancel: { fontSize: 16, color: colors.green },
  pickerHint: { color: colors.muted, fontSize: 14, marginTop: 12, lineHeight: 21 },
  search: { backgroundColor: colors.input, borderRadius: cornerRadius, paddingHorizontal: 16, paddingVertical: Platform.OS === 'ios' ? 16 : 13, color: colors.ink, fontSize: 16, marginTop: 24, marginBottom: 12, minHeight: 50 },
  cityList: { paddingBottom: 20 },
  cityRow: { minHeight: 80, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  cityName: { fontSize: 17, fontWeight: '500', color: colors.ink },
  country: { fontSize: 13, color: colors.muted, marginTop: 5 },
  selected: { color: colors.green, fontSize: 12, fontWeight: '600' },
  languageNote: { color: colors.muted, fontSize: 13, lineHeight: 21, marginTop: 16, marginBottom: 32 },
  settingsContent: { paddingTop: 28, paddingBottom: 24 },
  inputHint: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  cornerPreview: { backgroundColor: colors.green, borderRadius: cornerRadius, padding: 24, marginTop: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  previewName: { color: colors.onAccent, fontSize: 17, flexShrink: 1 },
  previewTime: { color: colors.onAccent, fontSize: 20, fontVariant: ['tabular-nums'] },
  resetButton: { minHeight: 48, alignSelf: 'flex-start', justifyContent: 'center', marginTop: 16 },
  fontRow: { minHeight: 132, paddingVertical: 20, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  fontPreview: { fontSize: 14, lineHeight: 22, color: colors.ink, marginTop: 14 },
  themeList: { paddingTop: 20, paddingBottom: 24 },
  schemeInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  schemeCopy: { flex: 1 },
  swatch: { width: 40, height: 40, borderRadius: cornerRadius, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  swatchAccent: { width: 16, height: 16, borderRadius: 8 },
  empty: { fontSize: 15, color: colors.muted, textAlign: 'center', paddingVertical: 36, lineHeight: 23 },
});
