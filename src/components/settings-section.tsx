import { useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from '@/components/app-text';
import { useAppPreferences } from '@/context/app-preferences';

export function SettingsSection({ title, value, children }: { title: string; value: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { colors } = useAppPreferences();
  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: colors.line }}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen((current) => !current)} style={({ pressed }) => ({ minHeight: 84, paddingVertical: 18, flexDirection: 'row', gap: 16, alignItems: 'center', opacity: pressed ? 0.6 : 1 })}>
        <View style={{ flex: 1, gap: 7 }}>
          <AppText style={{ fontSize: 17, fontWeight: '500', color: colors.ink }}>{title}</AppText>
          <AppText style={{ fontSize: 14, lineHeight: 21, color: colors.muted }}>{value}</AppText>
        </View>
        <View style={{ width: 8, height: 8, marginRight: 4, borderRightWidth: 1.5, borderBottomWidth: 1.5, borderColor: colors.muted, transform: [{ rotate: open ? '45deg' : '-45deg' }] }} />
      </Pressable>
      {open && <View style={{ paddingBottom: 24 }}>{children}</View>}
    </View>
  );
}
