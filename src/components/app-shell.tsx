import { router } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import { Modal, Platform, Pressable, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '@/components/app-text';
import { useAppPreferences } from '@/context/app-preferences';
import { type ColorScheme } from '@/data/color-schemes';
import { CityPicker } from '@/components/city-picker';
import { useI18n } from '@/i18n/provider';

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const { colors, cornerRadius } = useAppPreferences();
  const styles = useMemo(() => createStyles(colors, cornerRadius), [colors, cornerRadius]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={colors.dark ? 'light-content' : 'dark-content'} />
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
              <Pressable accessibilityRole="button" onPress={() => { setMenuOpen(false); setPickerOpen(true); }} style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}>
                <Text style={styles.menuItemText}>{t('menu.location')}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => { setMenuOpen(false); router.push('/settings'); }} style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}>
                <Text style={styles.menuItemText}>{t('menu.settings')}</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </Pressable>
      </Modal>
      <Modal visible={pickerOpen} animationType="slide" onRequestClose={() => setPickerOpen(false)}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.pickerShell}>
            <View style={styles.pickerHeader}>
              <Text accessibilityRole="header" style={styles.sectionTitle}>{t('menu.location')}</Text>
              <Pressable accessibilityRole="button" onPress={() => setPickerOpen(false)} style={styles.cancelButton}><Text style={styles.cancel}>{t('common.cancel')}</Text></Pressable>
            </View>
            <Text style={styles.pickerHint}>{t('location.hint')}</Text>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.cityList}>
              {pickerOpen && <CityPicker onSelected={() => setPickerOpen(false)} />}
            </ScrollView>
            <Text style={styles.sampleNote}>{t('location.sample')}</Text>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
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
  empty: { fontSize: 15, color: colors.muted, textAlign: 'center', paddingVertical: 36, lineHeight: 23 },
});
