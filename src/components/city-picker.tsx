import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { AppText as Text } from '@/components/app-text';
import { useAppPreferences } from '@/context/app-preferences';
import { useI18n } from '@/i18n/provider';
import { resolveCity, searchCities, type City } from '@/services/cities';

export function CityPicker({ onSelected }: { onSelected?: () => void }) {
  const { t } = useI18n();
  const { colors, cornerRadius, fontFamily, location, setLocation } = useAppPreferences();
  const [query, setQuery] = useState('');
  const [pending, setPending] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  const results = useMemo(() => searchCities(query), [query]);
  async function select(city: City) {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setPending(city.id);
    setFailed(false);
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const selected = await resolveCity(city, controller.signal);
      if (request.current !== controller || controller.signal.aborted) return;
      setLocation(selected);
      onSelected?.();
    } catch {
      if (request.current === controller) setFailed(true);
    } finally {
      clearTimeout(timeout);
      if (request.current === controller) setPending(null);
    }
  }
  return <View>
    <TextInput accessibilityLabel={t('location.searchLabel')} placeholder={t('location.searchPlaceholder')} placeholderTextColor={colors.muted} value={query} onChangeText={setQuery} autoCorrect={false} style={[styles.search, { fontFamily, color: colors.ink, backgroundColor: colors.input, borderRadius: cornerRadius }]} />
    {failed && <Text accessibilityRole="alert" style={[styles.note, { color: colors.muted }]}>{t('location.lookupError')}</Text>}
    {pending && <Text accessibilityLiveRegion="polite" style={[styles.note, { color: colors.muted }]}>{t('location.loading')}</Text>}
    {results.slice(0, 20).map((city) => {
      const selected = city.city === location.city && city.country === location.country;
      return <Pressable key={city.id} accessibilityRole="button" accessibilityLabel={city.id} accessibilityState={{ selected, busy: pending === city.id }} onPress={() => void select(city)} style={({ pressed }) => [styles.row, { borderBottomColor: colors.line, opacity: pressed ? 0.55 : 1 }]}>
        <View style={styles.copy}><Text style={[styles.city, { color: colors.ink }]}>{city.city}</Text><Text style={[styles.country, { color: colors.muted }]}>{city.state ? `${city.state}, ${city.country}` : city.country}</Text></View>
        {selected && <Text style={{ color: colors.green }}>{t('common.selected')}</Text>}
      </Pressable>;
    })}
    {results.length === 0 && <Text style={[styles.note, { color: colors.muted }]}>{t('location.empty')}</Text>}
    {results.length > 20 && <Text style={[styles.note, { color: colors.muted }]}>{t('location.refine')}</Text>}
    <Text style={[styles.note, { color: colors.muted }]}>{t('location.catalogSource')}</Text>
  </View>;
}
const styles = StyleSheet.create({
  search: { paddingHorizontal: 16, paddingVertical: 16, fontSize: 16, marginTop: 24, marginBottom: 12, minHeight: 50 },
  row: { minHeight: 80, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, borderBottomWidth: 1, paddingVertical: 12 },
  copy: { flex: 1 }, city: { fontSize: 17, fontWeight: '500' }, country: { fontSize: 13, marginTop: 5 },
  note: { fontSize: 13, lineHeight: 20, textAlign: 'center', marginVertical: 16 },
});
