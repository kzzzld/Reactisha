import { useEffect, useMemo, useState } from 'react';
import {
  Modal, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colorSchemes, ColorScheme } from '@/data/color-schemes';
import { locations, PrayerLocation, prayerNames } from '@/data/prayer-times';
import { getPrayerState } from '@/utils/prayer-time';


export default function HomeScreen() {
  const [colors, setColors] = useState<ColorScheme>(colorSchemes[0]);
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const [location, setLocation] = useState<PrayerLocation>(locations[0]);
  const [now, setNow] = useState(() => new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState('');
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const prayer = getPrayerState(now, location);
  const date = new Intl.DateTimeFormat('en-GB', { timeZone: location.timezone, weekday: 'long', day: 'numeric', month: 'long' }).format(now);
  const results = locations.filter((item) => `${item.city} ${item.country}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={colors.dark ? "light-content" : "dark-content"} />
      <View style={styles.shell}>
        <View style={styles.header}>
          <Text accessibilityRole="header" style={styles.brand}>SalatTimer</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Open menu" accessibilityState={{ expanded: menuOpen }} onPress={() => setMenuOpen(true)} style={({ pressed }) => [styles.menuButton, pressed && styles.pressed]}>
            <View style={styles.dots}>{[0, 1, 2].map((dot) => <View key={dot} style={styles.dot} />)}</View>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.locationLine}>
            <View style={styles.locationDot} />
            <Text style={styles.location}>{location.city}, {location.country}</Text>
          </View>
          <View style={styles.countdownSection}>
            <Text style={styles.nextPrayer}>{prayer.nextName} is next</Text>
            <Text accessibilityLabel={`${prayer.countdown} until ${prayer.nextName}`} style={styles.countdown}>{prayer.countdown}</Text>
            <Text style={styles.until}>until {prayer.tomorrow ? 'tomorrow at ' : ''}{location.times[prayer.nextIndex]}</Text>
            <View style={styles.dividerDetail}><View style={styles.detailLine} /><View style={styles.detailDiamond} /><View style={styles.detailLine} /></View>
            <Text style={styles.reflection}>A moment to pause. A time to reconnect.</Text>
          </View>
          <View style={styles.scheduleHeader}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>Today’s prayers</Text>
            <Text style={styles.today}>Today</Text>
          </View>
          <Text style={styles.date}>{date}</Text>
          <View style={styles.schedule}>
            {prayerNames.map((name, index) => {
              const next = index === prayer.nextIndex && !prayer.tomorrow;
              const passed = prayer.schedule[index] <= prayer.seconds;
              return (
                <View key={name} style={[styles.prayerRow, next && styles.nextRow]}>
                  <View style={styles.prayerLabel}>
                    <Text style={[styles.prayerName, passed && styles.pastText, next && styles.nextText]}>{name}</Text>
                    {next && <Text style={styles.nextBadge}>Next</Text>}
                  </View>
                  <Text style={[styles.prayerTime, passed && styles.pastText, next && styles.nextText]}>{location.times[index]}</Text>
                </View>
              );
            })}
          </View>
          <Text style={styles.sampleNote}>Sample prayer times · Preview only</Text>
          <Text style={styles.footer}>Your day, centred around prayer.</Text>
        </ScrollView>
      </View>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close menu" style={styles.menuBackdrop} onPress={() => setMenuOpen(false)}>
          <SafeAreaView style={styles.menuSafeArea}>
            <View style={styles.menuPanel}>
              <Pressable accessibilityRole="button" onPress={() => { setMenuOpen(false); setQuery(''); setPickerOpen(true); }} style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}>
                <Text style={styles.menuItemText}>Choose location</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => { setMenuOpen(false); setThemePickerOpen(true); }} style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}>
                <Text style={styles.menuItemText}>Color scheme</Text>
                <Text style={styles.country}>{colors.name}</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </Pressable>
      </Modal>

      <Modal visible={themePickerOpen} animationType="slide" onRequestClose={() => setThemePickerOpen(false)}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.pickerShell}>
            <View style={styles.pickerHeader}>
              <Text accessibilityRole="header" style={styles.sectionTitle}>Color scheme</Text>
              <Pressable accessibilityRole="button" onPress={() => setThemePickerOpen(false)} style={styles.cancelButton}><Text style={styles.cancel}>Done</Text></Pressable>
            </View>
            <Text style={styles.pickerHint}>Make room for your kind of calm.</Text>
            <ScrollView contentContainerStyle={styles.themeList}>
              {colorSchemes.map((scheme) => (
                <Pressable key={scheme.name} accessibilityRole="radio" accessibilityState={{ checked: colors.name === scheme.name }} accessibilityLabel={scheme.name} onPress={() => setColors(scheme)} style={({ pressed }) => [styles.cityRow, pressed && styles.pressed]}>
                  <View style={styles.schemeInfo}>
                    <View style={[styles.swatch, { backgroundColor: scheme.background, borderColor: scheme.muted }]}><View style={[styles.swatchAccent, { backgroundColor: scheme.green }]} /></View>
                    <View style={styles.schemeCopy}><Text style={styles.cityName}>{scheme.name}</Text><Text style={styles.country}>{scheme.description}</Text></View>
                  </View>
                  {colors.name === scheme.name && <Text style={styles.selected}>Selected</Text>}
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
              <Text accessibilityRole="header" style={styles.sectionTitle}>Choose location</Text>
              <Pressable accessibilityRole="button" onPress={() => setPickerOpen(false)} style={styles.cancelButton}><Text style={styles.cancel}>Cancel</Text></Pressable>
            </View>
            <Text style={styles.pickerHint}>Select your city to see its prayer times.</Text>
            <TextInput accessibilityLabel="Search cities" placeholder="Search city or country" placeholderTextColor={colors.muted} value={query} onChangeText={setQuery} autoCorrect={false} clearButtonMode="while-editing" style={styles.search} />
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.cityList}>
              {results.map((item) => (
                <Pressable key={item.city} accessibilityRole="button" accessibilityLabel={`${item.city}, ${item.country}`} accessibilityState={{ selected: item.city === location.city }} onPress={() => { setLocation(item); setNow(new Date()); setPickerOpen(false); }} style={({ pressed }) => [styles.cityRow, pressed && styles.pressed]}>
                  <View><Text style={styles.cityName}>{item.city}</Text><Text style={styles.country}>{item.country}</Text></View>
                  {item.city === location.city && <Text style={styles.selected}>Selected</Text>}
                </Pressable>
              ))}
              {results.length === 0 && <Text style={styles.empty}>No matching cities. Try another city or country.</Text>}
            </ScrollView>
            <Text style={styles.sampleNote}>Sample locations and times for this preview.</Text>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colors: ColorScheme) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  shell: { flex: 1, width: '100%', maxWidth: 560, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 28, paddingTop: 12, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: colors.line },
  brand: { fontSize: 25, fontWeight: '600', color: colors.ink, letterSpacing: -0.7 },
  menuButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  dots: { gap: 4 }, dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.ink },
  pressed: { opacity: 0.55 },
  content: { paddingHorizontal: 28, paddingBottom: 28 },
  locationLine: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', paddingTop: 28 },
  locationDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.green },
  location: { color: colors.muted, fontSize: 14, flexShrink: 1 },
  countdownSection: { alignItems: 'center', paddingTop: 35, paddingBottom: 42 },
  nextPrayer: { fontSize: 24, fontWeight: '500', color: colors.green },
  countdown: { fontSize: 56, lineHeight: 76, fontWeight: '300', letterSpacing: -1.6, color: colors.ink, fontVariant: ['tabular-nums'], marginTop: 6 },
  until: { color: colors.muted, fontSize: 14, marginTop: 2 },
  dividerDetail: { flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 28, marginBottom: 18 },
  detailLine: { width: 34, height: 1, backgroundColor: colors.line },
  detailDiamond: { width: 5, height: 5, backgroundColor: colors.muted, transform: [{ rotate: '45deg' }] },
  reflection: { fontSize: 13, color: colors.muted, textAlign: 'center' },
  scheduleHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  sectionTitle: { fontSize: 22, fontWeight: '600', color: colors.ink, letterSpacing: -0.5, flexShrink: 1 },
  today: { fontSize: 12, color: colors.green, backgroundColor: colors.pale, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  date: { fontSize: 13, color: colors.muted, marginTop: 7, marginBottom: 20 },
  schedule: { borderTopWidth: 1, borderTopColor: colors.line },
  prayerRow: { minHeight: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: colors.line },
  nextRow: { backgroundColor: colors.green, borderRadius: 12, borderBottomWidth: 0, marginVertical: 4 },
  prayerLabel: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1, flexWrap: 'wrap' },
  prayerName: { fontSize: 17, color: colors.ink, fontWeight: '500' },
  prayerTime: { fontSize: 18, color: colors.ink, fontWeight: '500', fontVariant: ['tabular-nums'] },
  pastText: { color: colors.muted }, nextText: { color: colors.onAccent },
  nextBadge: { color: colors.onAccent, fontSize: 11, fontWeight: '600' },
  sampleNote: { textAlign: 'center', fontSize: 12, color: colors.muted, marginTop: 22, lineHeight: 18 },
  footer: { textAlign: 'center', fontSize: 12, color: colors.muted, marginTop: 24 },
  menuBackdrop: { flex: 1, backgroundColor: '#142A2220' },
  menuSafeArea: { alignItems: 'flex-end', width: '100%', maxWidth: 560, alignSelf: 'center', paddingRight: 24 },
  menuPanel: { backgroundColor: colors.background, borderRadius: 12, marginTop: 60, boxShadow: '0 8px 28px #142A2226' },
  menuItem: { paddingVertical: 20, paddingHorizontal: 24, minWidth: 200 },
  menuItemText: { fontSize: 16, color: colors.ink },
  pickerShell: { flex: 1, width: '100%', maxWidth: 560, alignSelf: 'center', padding: 24 },
  pickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  cancelButton: { minHeight: 44, justifyContent: 'center', paddingLeft: 12 },
  cancel: { fontSize: 16, color: colors.green },
  pickerHint: { color: colors.muted, fontSize: 14, marginTop: 12, lineHeight: 21 },
  search: { backgroundColor: colors.input, borderRadius: 12, paddingHorizontal: 16, paddingVertical: Platform.OS === 'ios' ? 16 : 13, color: colors.ink, fontSize: 16, marginTop: 24, marginBottom: 12, minHeight: 50 },
  cityList: { paddingBottom: 20 },
  cityRow: { minHeight: 80, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  cityName: { fontSize: 17, fontWeight: '500', color: colors.ink },
  country: { fontSize: 13, color: colors.muted, marginTop: 5 },
  selected: { color: colors.green, fontSize: 12, fontWeight: '600' },
  themeList: { paddingTop: 20, paddingBottom: 24 },
  schemeInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  schemeCopy: { flex: 1 },
  swatch: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  swatchAccent: { width: 16, height: 16, borderRadius: 8 },
  empty: { fontSize: 15, color: colors.muted, textAlign: 'center', paddingVertical: 36, lineHeight: 23 },
});
