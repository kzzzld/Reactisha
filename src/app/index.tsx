import { useI18n } from '@/i18n/provider';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/components/app-text';
import { useAppPreferences } from '@/context/app-preferences';
import { type ColorScheme } from '@/data/color-schemes';
import { prayerNames } from '@/data/prayer-times';
import { getPrayerState } from '@/utils/prayer-time';

export default function SalatTimerScreen() {
  const { t, locale } = useI18n();
  const { colors, cornerRadius, location } = useAppPreferences();
  const styles = useMemo(() => createStyles(colors, cornerRadius), [colors, cornerRadius]);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const prayer = getPrayerState(now, location);
  const date = new Intl.DateTimeFormat(locale, { timeZone: location.timezone, weekday: 'long', day: 'numeric', month: 'long' }).format(now);
  return (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.locationLine}>
            <View style={styles.locationDot} />
            <Text style={styles.location}>{t('location.format', { city: t(location.cityKey), country: t(location.countryKey) })}</Text>
          </View>
          <View style={styles.countdownSection}>
            <Text style={styles.nextPrayer}>{t('prayer.next', { prayer: t(`prayer.${prayer.nextName}`) })}</Text>
            <Text numberOfLines={1} adjustsFontSizeToFit accessibilityLabel={t('prayer.countdownLabel', { countdown: prayer.countdown, prayer: t(`prayer.${prayer.nextName}`) })} style={styles.countdown}>{prayer.countdown}</Text>
            <Text style={styles.until}>{t(prayer.tomorrow ? 'prayer.untilTomorrow' : 'prayer.until', { time: location.times[prayer.nextIndex] })}</Text>
            <View style={styles.dividerDetail}><View style={styles.detailLine} /><View style={styles.detailDiamond} /><View style={styles.detailLine} /></View>
            <Text style={styles.reflection}>{t('prayer.reflection')}</Text>
          </View>
          <View style={styles.scheduleHeader}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>{t('prayer.todayTitle')}</Text>
            <Text style={styles.today}>{t('prayer.today')}</Text>
          </View>
          <Text style={styles.date}>{date}</Text>
          <View style={styles.schedule}>
            {prayerNames.map((name, index) => {
              const next = index === prayer.nextIndex && !prayer.tomorrow;
              const passed = prayer.schedule[index] <= prayer.seconds;
              return (
                <View key={name} style={[styles.prayerRow, next && styles.nextRow]}>
                  <View style={styles.prayerLabel}>
                    <Text style={[styles.prayerName, passed && styles.pastText, next && styles.nextText]}>{t(`prayer.${name}`)}</Text>
                    {next && <Text style={styles.nextBadge}>{t('prayer.nextBadge')}</Text>}
                  </View>
                  <Text style={[styles.prayerTime, passed && styles.pastText, next && styles.nextText]}>{location.times[index]}</Text>
                </View>
              );
            })}
          </View>
          <Text style={styles.sampleNote}>{t('prayer.sample')}</Text>
          <Text style={styles.footer}>{t('prayer.footer')}</Text>
        </ScrollView>
  );
}

const createStyles = (colors: ColorScheme, cornerRadius: number) => StyleSheet.create({
  content: { paddingHorizontal: 28, paddingBottom: 28 },
  locationLine: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', paddingTop: 28 },
  locationDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.green },
  location: { color: colors.muted, fontSize: 14, flexShrink: 1 },
  countdownSection: { alignItems: 'center', paddingTop: 35, paddingBottom: 42 },
  nextPrayer: { fontSize: 24, fontWeight: '500', color: colors.green },
  countdown: { width: '100%', textAlign: 'center', fontSize: 56, lineHeight: 76, fontWeight: '300', letterSpacing: -1.6, color: colors.ink, fontVariant: ['tabular-nums'], marginTop: 6 },
  until: { color: colors.muted, fontSize: 14, marginTop: 2 },
  dividerDetail: { flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 28, marginBottom: 18 },
  detailLine: { width: 34, height: 1, backgroundColor: colors.line },
  detailDiamond: { width: 5, height: 5, backgroundColor: colors.muted, transform: [{ rotate: '45deg' }] },
  reflection: { fontSize: 13, color: colors.muted, textAlign: 'center' },
  scheduleHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  sectionTitle: { fontSize: 22, fontWeight: '600', color: colors.ink, letterSpacing: -0.5, flexShrink: 1 },
  today: { fontSize: 12, color: colors.green, backgroundColor: colors.pale, paddingVertical: 6, paddingHorizontal: 12, borderRadius: cornerRadius },
  date: { fontSize: 13, color: colors.muted, marginTop: 7, marginBottom: 20 },
  schedule: { borderTopWidth: 1, borderTopColor: colors.line },
  prayerRow: { minHeight: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: colors.line },
  nextRow: { backgroundColor: colors.green, borderRadius: cornerRadius, borderBottomWidth: 0, marginVertical: 4 },
  prayerLabel: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1, flexWrap: 'wrap' },
  prayerName: { fontSize: 17, color: colors.ink, fontWeight: '500' },
  prayerTime: { fontSize: 18, color: colors.ink, fontWeight: '500', fontVariant: ['tabular-nums'] },
  pastText: { color: colors.muted }, nextText: { color: colors.onAccent },
  nextBadge: { color: colors.onAccent, fontSize: 11, fontWeight: '600' },
  sampleNote: { textAlign: 'center', fontSize: 12, color: colors.muted, marginTop: 22, lineHeight: 18 },
  footer: { textAlign: 'center', fontSize: 12, color: colors.muted, marginTop: 24 },
});
