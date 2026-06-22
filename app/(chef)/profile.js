import { View, StyleSheet, ScrollView, Pressable, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../src/components/ui';
import { useTheme } from '../../src/providers/ThemeProvider';
import { useAuthStore } from '../../src/store';
import { spacing, radius } from '../../src/theme';

const menuSections = [
  {
    items: [
      { icon: 'storefront-outline', label: 'Restaurant Info', route: '/chef/restaurant-info' },
      { icon: 'cash-outline', label: 'Earnings', route: '/chef/earnings' },
    ],
  },
  {
    items: [
      { icon: 'star-outline', label: 'Reviews', route: '/profile/reviews' },
      { icon: 'notifications-outline', label: 'Notifications', route: '/profile/notifications' },
      { icon: 'settings-outline', label: 'Settings', route: '/profile/settings' },
    ],
  },
  {
    items: [
      { icon: 'log-out-outline', label: 'Log Out', route: 'logout', isDestructive: true },
    ],
  },
];

export default function ChefProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = useTheme();
  const user = useAuthStore((s) => s.user);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);

  const handleMenuPress = (item) => {
    if (item.route === 'logout') {
      Alert.alert('Log Out', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => {
          logout();
          router.replace('/(auth)/login');
        }},
      ]);
    } else {
      router.push(item.route);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <View style={[styles.profileCard, { backgroundColor: c.primary }]}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200' }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text variant="h2" style={styles.profileName}>{user?.name || 'Chef'}</Text>
            <Text variant="bodySmall" style={styles.profileEmail}>{user?.email || 'chef@foodorder.com'}</Text>
            <View style={styles.profileMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="star" size={14} color="#FFB800" />
                <Text variant="caption" style={styles.metaText}>4.8</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="receipt" size={14} color="rgba(255,255,255,0.8)" />
                <Text variant="caption" style={styles.metaText}>248 orders</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menu sections */}
        {menuSections.map((section, sIdx) => (
          <View key={sIdx} style={[styles.menuSection, { backgroundColor: c.backgroundSecondary }]}>
            {section.items.map((item, idx) => (
              <Pressable
                key={item.label}
                style={[
                  styles.menuItem,
                  idx < section.items.length - 1 && [styles.menuItemBorder, { borderBottomColor: c.borderLight }],
                ]}
                onPress={() => handleMenuPress(item)}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={item.isDestructive ? '#E74C3C' : c.primary}
                  />
                  <Text variant="body" style={[
                    styles.menuLabel,
                    { color: item.isDestructive ? '#E74C3C' : c.text },
                  ]}>
                    {item.label}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: spacing.xl, gap: spacing.md },
  profileCard: {
    borderRadius: radius.xl, padding: spacing.xl,
    flexDirection: 'row', alignItems: 'center', gap: spacing.lg,
  },
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)' },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  profileEmail: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  profileMeta: { flexDirection: 'row', gap: spacing.md, marginTop: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: 'rgba(255,255,255,0.8)', fontWeight: '600', fontSize: 12 },
  menuSection: { borderRadius: radius.lg, overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: spacing.base, paddingHorizontal: spacing.base,
  },
  menuItemBorder: { borderBottomWidth: 1 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  menuLabel: { fontWeight: '500', fontSize: 15 },
});
