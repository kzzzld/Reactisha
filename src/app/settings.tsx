import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StatusBar, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '@/components/app-text';
import { SettingsSection } from '@/components/settings-section';
import { DEFAULT_CORNER_RADIUS, MAX_CORNER_RADIUS, useAppPreferences } from '@/context/app-preferences';
import { colorSchemes, type ColorScheme } from '@/data/color-schemes';
import { fontOptions } from '@/data/fonts';
import { locations } from '@/data/prayer-times';
import { useI18n } from '@/i18n/provider';
import { availableLanguages } from '@/i18n/translate';
import { ayahSources } from '@/services/ayah';

export default function SettingsScreen() {
  const { t, language, setLanguage } = useI18n();
  const { colors, setColors, cornerRadius, setCornerRadius, font, setFont, fontFamily, fontsLoaded, fontError, ayahSource, setAyahSource, location, setLocation } = useAppPreferences();
  const styles = useMemo(() => createStyles(colors, cornerRadius), [colors, cornerRadius]);
  const [cornerInput, setCornerInput] = useState(String(cornerRadius));
  const [query, setQuery] = useState('');
  const normalizedCornerInput = cornerInput.trim().replace(',', '.');
  const parsedCornerRadius = Number(normalizedCornerInput);
  const validCornerInput = /^\d+(\.\d+)?$/.test(normalizedCornerInput)
    && Number.isFinite(parsedCornerRadius) && parsedCornerRadius >= 0 && parsedCornerRadius <= MAX_CORNER_RADIUS;
  function updateCornerInput(value: string) {
    setCornerInput(value);
    const normalized = value.trim().replace(',', '.');
    const radius = Number(normalized);
    if (/^\d+(\.\d+)?$/.test(normalized) && Number.isFinite(radius) && radius >= 0 && radius <= MAX_CORNER_RADIUS) setCornerRadius(radius);
  }
  function closeSettings() {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }
  const results = locations.filter((item) => `${item.city} ${item.country} ${t(item.cityKey)} ${t(item.countryKey)}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={colors.dark ? 'light-content' : 'dark-content'} />
      <View style={styles.shell}>
        <View style={styles.header}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>{t('menu.settings')}</Text>
          <Pressable accessibilityRole="button" accessibilityState={{ disabled: !validCornerInput }} disabled={!validCornerInput} onPress={closeSettings} style={[styles.cancelButton, !validCornerInput && styles.pressed]}><Text style={styles.cancel}>{t('common.done')}</Text></Pressable>
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.settingsContent}>
          <SettingsSection title={t('menu.theme')} value={t(colors.nameKey)}>
            <Text style={styles.pickerHint}>{t('theme.hint')}</Text>
              {colorSchemes.map((scheme) => (
                <Pressable key={scheme.name} accessibilityRole="radio" accessibilityState={{ checked: colors.name === scheme.name }} accessibilityLabel={t(scheme.nameKey)} onPress={() => setColors(scheme)} style={({ pressed }) => [styles.cityRow, pressed && styles.pressed]}>
                  <View style={styles.schemeInfo}>
                    <View style={[styles.swatch, { backgroundColor: scheme.background, borderColor: scheme.muted }]}><View style={[styles.swatchAccent, { backgroundColor: scheme.green }]} /></View>
                    <View style={styles.schemeCopy}><Text style={styles.cityName}>{t(scheme.nameKey)}</Text><Text style={styles.country}>{t(scheme.descriptionKey)}</Text></View>
                  </View>
                  {colors.name === scheme.name && <Text style={styles.selected}>{t('common.selected')}</Text>}
                </Pressable>
              ))}
          </SettingsSection>
          <SettingsSection title={t('menu.font')} value={t(font.nameKey)}>
            <Text style={styles.pickerHint}>{t('font.hint')}</Text>
            {!fontsLoaded && <Text accessibilityRole="alert" style={styles.pickerHint}>{fontError ? t('font.error') : t('font.loading')}</Text>}
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
          </SettingsSection>
          <SettingsSection title={t('language.title')} value={availableLanguages.find((option) => option.code === language)?.name ?? language}>
            <Text style={styles.pickerHint}>{t('language.hint')}</Text>
              {availableLanguages.map((option) => (
                <Pressable key={option.code} accessibilityRole="radio" accessibilityLabel={option.name} accessibilityState={{ checked: language === option.code }} onPress={() => setLanguage(option.code)} style={({ pressed }) => [styles.cityRow, pressed && styles.pressed]}>
                  <Text style={styles.cityName}>{option.name}</Text>
                  {language === option.code && <Text style={styles.selected}>{t('common.selected')}</Text>}
                </Pressable>
              ))}
            <Text style={styles.pickerHint}>{t('language.ayahNote')}</Text>
          </SettingsSection>
          <SettingsSection title={t('menu.source')} value={t(ayahSource.nameKey)}>
            <Text style={styles.pickerHint}>{t('source.hint')}</Text>
              {ayahSources.map((source) => (
                <Pressable key={source.id} accessibilityRole="radio" accessibilityLabel={t(source.nameKey)} accessibilityState={{ checked: ayahSource.id === source.id }} onPress={() => setAyahSource(source)} style={({ pressed }) => [styles.cityRow, pressed && styles.pressed]}>
                  <View style={styles.schemeCopy}><Text style={styles.cityName}>{t(source.nameKey)}</Text><Text style={styles.country}>{t(source.descriptionKey)}</Text></View>
                  {ayahSource.id === source.id && <Text style={styles.selected}>{t('common.selected')}</Text>}
                </Pressable>
              ))}
          </SettingsSection>
          <SettingsSection title={t('menu.location')} value={t('location.format', { city: t(location.cityKey), country: t(location.countryKey) })}>
            <TextInput accessibilityLabel={t('location.searchLabel')} placeholder={t('location.searchPlaceholder')} placeholderTextColor={colors.muted} value={query} onChangeText={setQuery} autoCorrect={false} clearButtonMode="while-editing" style={[styles.search, { fontFamily }]} />
            {results.map((item) => (
              <Pressable key={item.city} accessibilityRole="radio" accessibilityLabel={t('location.format', { city: t(item.cityKey), country: t(item.countryKey) })} accessibilityState={{ checked: item.city === location.city }} onPress={() => setLocation(item)} style={({ pressed }) => [styles.cityRow, pressed && styles.pressed]}>
                <View style={styles.schemeCopy}><Text style={styles.cityName}>{t(item.cityKey)}</Text><Text style={styles.country}>{t(item.countryKey)}</Text></View>
                {item.city === location.city && <Text style={styles.selected}>{t('common.selected')}</Text>}
              </Pressable>
            ))}
            {results.length === 0 && <Text style={styles.empty}>{t('location.empty')}</Text>}
            <Text style={styles.sampleNote}>{t('location.sample')}</Text>
          </SettingsSection>
          <View style={styles.roundingSection}>
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
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: ColorScheme, cornerRadius: number) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  shell: { flex: 1, width: '100%', maxWidth: 560, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 28, paddingTop: 12, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: colors.line },
  pressed: { opacity: 0.55 },
  sectionTitle: { fontSize: 22, fontWeight: '600', color: colors.ink, letterSpacing: -0.5, flexShrink: 1 },
  sampleNote: { textAlign: 'center', fontSize: 12, color: colors.muted, marginTop: 22, lineHeight: 18 },
  cancelButton: { minHeight: 44, justifyContent: 'center', paddingLeft: 12 },
  cancel: { fontSize: 16, color: colors.green },
  pickerHint: { color: colors.muted, fontSize: 14, marginTop: 12, lineHeight: 21 },
  search: { backgroundColor: colors.input, borderRadius: cornerRadius, paddingHorizontal: 16, paddingVertical: Platform.OS === 'ios' ? 16 : 13, color: colors.ink, fontSize: 16, marginTop: 24, marginBottom: 12, minHeight: 50 },
  cityRow: { minHeight: 80, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  cityName: { fontSize: 17, fontWeight: '500', color: colors.ink },
  country: { fontSize: 13, color: colors.muted, marginTop: 5 },
  selected: { color: colors.green, fontSize: 12, fontWeight: '600' },
  settingsContent: { paddingHorizontal: 28, paddingBottom: 36 },
  roundingSection: { paddingTop: 28 },
  inputHint: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  cornerPreview: { backgroundColor: colors.green, borderRadius: cornerRadius, padding: 24, marginTop: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  previewName: { color: colors.onAccent, fontSize: 17, flexShrink: 1 },
  previewTime: { color: colors.onAccent, fontSize: 20, fontVariant: ['tabular-nums'] },
  resetButton: { minHeight: 48, alignSelf: 'flex-start', justifyContent: 'center', marginTop: 16 },
  fontRow: { minHeight: 132, paddingVertical: 20, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  fontPreview: { fontSize: 14, lineHeight: 22, color: colors.ink, marginTop: 14 },
  schemeInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  schemeCopy: { flex: 1 },
  swatch: { width: 40, height: 40, borderRadius: cornerRadius, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  swatchAccent: { width: 16, height: 16, borderRadius: 8 },
  empty: { fontSize: 15, color: colors.muted, textAlign: 'center', paddingVertical: 36, lineHeight: 23 },
});
