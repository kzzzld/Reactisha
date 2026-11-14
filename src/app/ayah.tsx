import { useI18n } from '@/i18n/provider';
import { useEffect, useMemo, useRef, useState, type ComponentRef } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/components/app-text';
import { useAppPreferences } from '@/context/app-preferences';
import type { ColorScheme } from '@/data/color-schemes';
import { fetchAyah, randomAyahNumber, type Ayah } from '@/services/ayah';

type AyahState = { status: 'loading' } | { status: 'ready'; ayah: Ayah } | { status: 'error' };
export default function AyahScreen() {
  const { t } = useI18n();
  const { colors, cornerRadius, ayahSource } = useAppPreferences();
  const styles = useMemo(() => createStyles(colors, cornerRadius), [colors, cornerRadius]);
  const [request, setRequest] = useState(0);
  const [result, setResult] = useState<{ source: string; request: number; state: AyahState } | null>(null);
  const previousNumber = useRef<number | undefined>(undefined);
  const pendingNumber = useRef<number | undefined>(undefined);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const state: AyahState = result?.source === ayahSource.id && result.request === request ? result.state : { status: 'loading' };

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const number = pendingNumber.current ?? randomAyahNumber(previousNumber.current);
    pendingNumber.current = number;
    let active = true;
    fetchAyah(ayahSource, number, controller.signal).then((ayah) => {
      if (controller.signal.aborted) return;
      previousNumber.current = number;
      setResult({ source: ayahSource.id, request, state: { status: 'ready', ayah } });
    }).catch(() => {
      // A cleanup abort must not replace a newer source/request with an error.
      if (active) setResult({ source: ayahSource.id, request, state: { status: 'error' } });
    }).finally(() => clearTimeout(timeout));
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [ayahSource, request]);

  function loadAnother() {
    if (state.status === 'loading') return;
    // Retry keeps the same verse; another ayah excludes the last successful verse.
    if (state.status === 'ready') pendingNumber.current = undefined;
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    setRequest((value) => value + 1);
  }
  return (
    <ScrollView ref={scrollRef} contentContainerStyle={styles.content}>
      <Text accessibilityRole="header" style={styles.title}>{t('tabs.ayah')}</Text>
      <Text style={styles.subtitle}>{t('ayah.subtitle')}</Text>
      {state.status === 'loading' && <View style={styles.message}><ActivityIndicator color={colors.green} /><Text accessibilityLiveRegion="polite" style={styles.hint}>{t('ayah.loading')}</Text></View>}
      {state.status === 'error' && <View style={styles.message}><Text accessibilityRole="alert" style={styles.error}>{t('ayah.error')}</Text><Text style={styles.hint}>{t('ayah.errorHint')}</Text></View>}
      {state.status === 'ready' && <View style={styles.verse}>
        <Text selectable style={styles.arabic}>{state.ayah.arabic}</Text>
        <Text selectable style={styles.translation}>{state.ayah.english}</Text>
        <Text style={styles.reference}>{t('ayah.reference', { name: state.ayah.surahName ?? t('ayah.surah', { number: state.ayah.surah }), surah: state.ayah.surah, verse: state.ayah.verse })}</Text>
        <Text style={styles.hint}>{t('ayah.translation')}</Text>
      </View>}
      <Pressable accessibilityRole="button" accessibilityState={{ disabled: state.status === 'loading' }} disabled={state.status === 'loading'} onPress={loadAnother} style={({ pressed }) => [styles.button, (pressed || state.status === 'loading') && styles.dimmed]}>
        <Text style={styles.buttonText}>{t(state.status === 'error' ? 'common.retry' : 'ayah.another')}</Text>
      </Pressable>
      <Text style={styles.source}>{t('ayah.source', { source: t(ayahSource.nameKey) })}</Text>
    </ScrollView>
  );
}
const createStyles = (colors: ColorScheme, radius: number) => StyleSheet.create({
  content: { flexGrow: 1, padding: 28, paddingBottom: 36 },
  title: { color: colors.ink, fontSize: 28, fontWeight: '600' },
  subtitle: { color: colors.muted, fontSize: 14, marginTop: 10, lineHeight: 22 },
  verse: { paddingVertical: 40 },
  arabic: { fontFamily: undefined, fontSize: 30, lineHeight: 60, color: colors.ink, textAlign: 'right', writingDirection: 'rtl' },
  translation: { fontSize: 19, lineHeight: 32, color: colors.ink, marginTop: 28 },
  reference: { fontSize: 15, lineHeight: 24, fontWeight: '600', color: colors.green, marginTop: 28, marginBottom: 8 },
  hint: { color: colors.muted, fontSize: 13, lineHeight: 22, flexShrink: 1 },
  message: { paddingVertical: 60, gap: 18 },
  error: { color: colors.ink, fontSize: 20, fontWeight: '500' },
  button: { minHeight: 52, padding: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.green, borderRadius: radius },
  buttonText: { color: colors.onAccent, fontSize: 16, fontWeight: '600' },
  dimmed: { opacity: 0.5 },
  source: { color: colors.muted, fontSize: 12, lineHeight: 20, marginTop: 18, textAlign: 'center' },
});
