import { View, StyleSheet, Pressable, ScrollView, Image, Switch, ActionSheetIOS, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../src/components/ui';
import { useAuthStore, useThemeStore } from '../../src/store';
import { useTheme } from '../../src/providers/ThemeProvider';
import { spacing, radius } from '../../src/theme';
import { signOut } from '../../src/services/authService';

const menuSections = [
  {
    items: [
      { icon: 'person-outline', label: 'Personal Info', route: '/profile/edit' },
      { icon: 'location-outline', label: 'Addresses', route: '/profile/address' },
    ],
  },
  {
    items: [
      { icon: 'cart-outline', label: 'Cart', route: '/(tabs)/cart' },
      { icon: 'heart-outline', label: 'Favourite', route: '/profile/favourites' },
      { icon: 'notifications-outline', label: 'Notifications', route: '/profile/notifications' },
      { icon: 'card-outline', label: 'Payment Method', route: '/profile/payment-methods' },
    ],
  },
  {
    items: [
      { icon: 'help-circle-outline', label: 'FAQs', route: '/profile/faqs' },
      { icon: 'star-outline', label: 'User Reviews', route: '/profile/reviews' },
      { icon: 'settings-outline', label: 'Settings', route: '/profile/settings' },
    ],
  },
  {
    items: [
      { icon: 'log-out-outline', label: 'Log Out', route: 'logout', isDestructive: true },
    ],
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isDark = useThemeStore((s) => s.isDark);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const c = useTheme();

  const handleMenuPress = (item) => {
    if (item.route === 'logout') {
      Alert.alert('Log Out', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out', style: 'destructive', onPress: async () => {
            try { await signOut(); } catch { /* ignore */ }
            logout();
            router.replace('/(auth)/login');
          },
        },
      ]);
    } else if (item.route) {
      router.push(item.route);
    }
  };

  const handleDotsPress = () => {
    const options = ['Cancel', 'Edit Profile', 'Settings', 'Share Profile'];
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: 0 },
        (idx) => {
          if (idx === 1) router.push('/profile/edit');
          if (idx === 2) router.push('/profile/settings');
          if (idx === 3) Alert.alert('Share', 'Share link copied!');
        }
      );
    } else {
      Alert.alert('Options', '', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Edit Profile', onPress: () => router.push('/profile/edit') },
        { text: 'Settings', onPress: () => router.push('/profile/settings') },
        { text: 'Share Profile', onPress: () => Alert.alert('Share', 'Share link copied!') },
      ]);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Text variant="h3" style={{ color: c.text }}>Profile</Text>
        <Pressable hitSlop={8} onPress={handleDotsPress}>
          <Ionicons name="ellipsis-horizontal" size={22} color={c.text} />
        </Pressable>
      </View>

      {/* Avatar + name */}
      <View style={styles.avatarSection}>
        <Image
          source={{ uri: user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'U')}&background=FF6B35&color=fff&size=200` }}
          style={[styles.avatar, { borderColor: c.primary }]}
        />
        <Text variant="h2" style={[styles.userName, { color: c.text }]}>
          {user?.full_name || user?.name || 'User'}
        </Text>
        <Text variant="bodySmall" style={{ color: c.textMuted }}>
          {user?.email || ''}
        </Text>
      </View>

      {/* Dark mode toggle */}
      <View style={[styles.darkModeRow, { backgroundColor: c.backgroundSecondary }]}>
        <View style={styles.darkModeLeft}>
          <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={c.primary} />
          <Text variant="body" style={{ color: c.text, fontWeight: '600' }}>
            {isDark ? 'Dark Mode' : 'Light Mode'}
          </Text>
        </View>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: '#E0E0E0', true: c.primary }}
          thumbColor="#FFF"
        />
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
                  styles.menuItemLabel,
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.xl, paddingBottom: spacing.md,
  },
  avatarSection: { alignItems: 'center', paddingVertical: spacing.lg, gap: spacing.sm },
  avatar: {
    width: 90, height: 90, borderRadius: 45, borderWidth: 3, marginBottom: spacing.sm,
  },
  userName: { fontWeight: '700', fontSize: 22 },
  darkModeRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: spacing.xl, paddingHorizontal: spacing.base, paddingVertical: spacing.md,
    borderRadius: radius.lg, marginBottom: spacing.lg,
  },
  darkModeLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  menuSection: {
    marginHorizontal: spacing.xl, borderRadius: radius.lg, marginBottom: spacing.md,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.base, paddingHorizontal: spacing.base,
  },
  menuItemBorder: { borderBottomWidth: 1 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  menuItemLabel: { fontWeight: '500', fontSize: 15 },
});
