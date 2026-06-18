import { View, StyleSheet, Pressable, Switch, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../src/components/shared';
import { Text, Button, Card } from '../../src/components/ui';
import { useAuthStore, useThemeStore } from '../../src/store';
import { colors, spacing, radius } from '../../src/theme';

const menuItems = [
  { icon: 'person-outline', label: 'Personal Info', route: null },
  { icon: 'location-outline', label: 'Addresses', route: null },
  { icon: 'card-outline', label: 'Payment Methods', route: null },
  { icon: 'heart-outline', label: 'Favorites', route: null },
  { icon: 'help-circle-outline', label: 'Help & Support', route: null },
  { icon: 'settings-outline', label: 'Settings', route: null },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { isDark, toggle: toggleTheme } = useThemeStore();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <Header title="Profile" />
      <View style={styles.content}>
        {/* Profile card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' }}
              style={styles.avatar}
            />
          </View>
          <Text variant="h3">{user?.name || 'Guest User'}</Text>
          <Text variant="bodySmall">{user?.email || 'guest@foodorder.com'}</Text>
        </Card>

        {/* Dark mode toggle */}
        <View style={styles.themeRow}>
          <View style={styles.themeLeft}>
            <Ionicons name={isDark ? 'moon' : 'sunny'} size={22} color={colors.primary} />
            <Text variant="body" style={styles.themeLabel}>Dark Mode</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.background}
          />
        </View>

        {/* Menu items */}
        <View style={styles.menu}>
          {menuItems.map((item) => (
            <Pressable key={item.label} style={styles.menuItem}>
              <Ionicons name={item.icon} size={22} color={colors.textSecondary} />
              <Text variant="body" style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>

        <Button title="Log Out" variant="outline" onPress={handleLogout} style={styles.logout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.base,
    gap: spacing.lg,
  },
  profileCard: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  avatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: colors.primary,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.md,
  },
  themeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  themeLabel: {
    fontWeight: '500',
  },
  menu: {
    gap: spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: spacing.md,
  },
  menuLabel: {
    flex: 1,
  },
  logout: {
    marginTop: spacing.base,
  },
});
