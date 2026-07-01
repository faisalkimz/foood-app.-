import { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { useTheme } from '@/providers/ThemeProvider';
import { useThemeStore } from '@/store';
import { spacing, radius } from '@/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = useTheme();
  const isDark = useThemeStore((s) => s.isDark);
  const toggleTheme = useThemeStore((s) => s.toggle);

  const [pushNotifs, setPushNotifs] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promoEmails, setPromoEmails] = useState(false);
  const [locationAccess, setLocationAccess] = useState(true);

  const settingsSections = [
    {
      title: 'Appearance',
      items: [
        { label: 'Dark Mode', icon: 'moon-outline', isSwitch: true, value: isDark, onToggle: toggleTheme },
      ],
    },
    {
      title: 'Notifications',
      items: [
        { label: 'Push Notifications', icon: 'notifications-outline', isSwitch: true, value: pushNotifs, onToggle: () => setPushNotifs(!pushNotifs) },
        { label: 'Order Updates', icon: 'receipt-outline', isSwitch: true, value: orderUpdates, onToggle: () => setOrderUpdates(!orderUpdates) },
        { label: 'Promotional Emails', icon: 'mail-outline', isSwitch: true, value: promoEmails, onToggle: () => setPromoEmails(!promoEmails) },
      ],
    },
    {
      title: 'Privacy',
      items: [
        { label: 'Location Access', icon: 'location-outline', isSwitch: true, value: locationAccess, onToggle: () => setLocationAccess(!locationAccess) },
      ],
    },
    {
      title: 'About',
      items: [
        { label: 'App Version', icon: 'information-circle-outline', value: '1.0.0' },
        { label: 'Terms of Service', icon: 'document-text-outline' },
        { label: 'Privacy Policy', icon: 'shield-checkmark-outline' },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: c.backgroundSecondary }]}>
          <Ionicons name="arrow-back" size={22} color={c.text} />
        </Pressable>
        <Text variant="h3" style={{ color: c.text }}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        {settingsSections.map((section, sIdx) => (
          <View key={sIdx} style={styles.section}>
            <Text variant="label" style={[styles.sectionTitle, { color: c.textMuted }]}>
              {section.title}
            </Text>
            <View style={[styles.sectionCard, { backgroundColor: c.backgroundSecondary }]}>
              {section.items.map((item, idx) => (
                <View
                  key={item.label}
                  style={[
                    styles.settingItem,
                    idx < section.items.length - 1 && [styles.settingBorder, { borderBottomColor: c.borderLight }],
                  ]}
                >
                  <View style={styles.settingLeft}>
                    <Ionicons name={item.icon} size={20} color={c.primary} />
                    <Text variant="body" style={[styles.settingLabel, { color: c.text }]}>{item.label}</Text>
                  </View>
                  {item.isSwitch ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: '#E0E0E0', true: c.primary }}
                      thumbColor="#FFF"
                    />
                  ) : item.value ? (
                    <Text variant="caption" style={{ color: c.textMuted }}>{item.value}</Text>
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingBottom: spacing.md,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  section: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: spacing.sm },
  sectionCard: { borderRadius: radius.lg, overflow: 'hidden' },
  settingItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.md, paddingHorizontal: spacing.base,
  },
  settingBorder: { borderBottomWidth: 1 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  settingLabel: { fontWeight: '500', fontSize: 15 },
});
