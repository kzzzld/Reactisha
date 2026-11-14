import { useI18n } from '@/i18n/provider';
import { Tabs, TabList, TabSlot, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import type { ComponentProps } from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from '@/components/app-text';
import { useAppPreferences } from '@/context/app-preferences';

type TabButtonProps = Omit<TabTriggerSlotProps, 'ref'> & Pick<ComponentProps<typeof Pressable>, 'ref'>;
function TabButton({ children, isFocused, ...props }: TabButtonProps) {
  const { colors, cornerRadius } = useAppPreferences();
  return (
    <Pressable {...props} accessibilityRole="tab" accessibilityState={{ selected: isFocused }} style={({ pressed }) => ({ flex: 1, minHeight: 52, justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: cornerRadius, backgroundColor: isFocused ? colors.pale : colors.background, opacity: pressed ? 0.6 : 1 })}>
      <AppText style={{ color: isFocused ? colors.green : colors.muted, fontWeight: isFocused ? '600' : '400', fontSize: 15 }}>{children}</AppText>
    </Pressable>
  );
}
export function PrayerTabs() {
  const { t } = useI18n();
  const { colors } = useAppPreferences();
  return (
    <Tabs style={{ flex: 1 }}>
      <TabSlot style={{ flex: 1 }} />
      <TabList asChild>
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.background }}>
          <TabTrigger name="salat-timer" href="/" asChild><TabButton>{t('tabs.timer')}</TabButton></TabTrigger>
          <TabTrigger name="ayah" href="/ayah" asChild><TabButton>{t('tabs.ayah')}</TabButton></TabTrigger>
        </View>
      </TabList>
    </Tabs>
  );
}
