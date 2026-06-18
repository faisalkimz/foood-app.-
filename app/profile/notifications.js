import { useState } from 'react';
import { View, StyleSheet, Pressable, SectionList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../src/components/ui';
import { useTheme } from '../../src/providers/ThemeProvider';
import { spacing, radius } from '../../src/theme';

const rawNotifications = [
  {
    id: '1', type: 'order',
    title: 'Your order has been delivered',
    subtitle: 'Order #162432 · Pizza Hut',
    time: '2m', read: false,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=80',
  },
  {
    id: '2', type: 'promo',
    title: '30% OFF all burgers this weekend!',
    subtitle: 'Use code BURGER30 at checkout',
    time: '1h', read: false,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=80',
  },
  {
    id: '3', type: 'driver',
    title: 'Robert Fox is on the way',
    subtitle: 'Your order will arrive in ~20 min',
    time: '3h', read: true,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80',
  },
  {
    id: '4', type: 'order',
    title: 'Payment confirmed — $35.25',
    subtitle: 'Order #162432 · Visa ****4536',
    time: 'Yesterday', read: true,
    image: null,
  },
  {
    id: '5', type: 'promo',
    title: 'Kampala Kitchen just launched!',
    subtitle: 'New restaurant with free delivery',
    time: '2d', read: true,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=80',
  },
  {
    id: '6', type: 'order',
    title: 'Rate your McDonald order',
    subtitle: 'Help others by sharing your experience',
    time: '3d', read: true,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=80',
  },
];

const typeIcon = {
  order: { name: 'receipt', bg: '#FF6B35' },
  promo: { name: 'pricetag', bg: '#7C3AED' },
  driver: { name: 'bicycle', bg: '#2563EB' },
};

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = useTheme();
  const [items, setItems] = useState(rawNotifications);

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  const unreadCount = items.filter((n) => !n.read).length;

  // Group into sections
  const newItems = items.filter((n) => !n.read);
  const earlierItems = items.filter((n) => n.read);
  const sections = [];
  if (newItems.length > 0) sections.push({ title: 'New', data: newItems });
  if (earlierItems.length > 0) sections.push({ title: 'Earlier', data: earlierItems });

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: c.backgroundSecondary }]}>
          <Ionicons name="arrow-back" size={22} color={c.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text variant="h3" style={{ color: c.text }}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: c.primary }]}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <Pressable onPress={markAllRead} hitSlop={8}>
            <Ionicons name="checkmark-done" size={22} color={c.primary} />
          </Pressable>
        )}
        {unreadCount === 0 && <View style={{ width: 40 }} />}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHeader, { borderBottomColor: c.borderLight }]}>
            <Text variant="label" style={{ color: c.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 }}>
              {section.title.toUpperCase()}
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          const icon = typeIcon[item.type];
          return (
            <Pressable
              style={[styles.notifRow, !item.read && { backgroundColor: c.primaryLight + '40' }]}
              onPress={() => setItems((prev) => prev.map((n) => n.id === item.id ? { ...n, read: true } : n))}
            >
              {/* Left — image or icon */}
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.notifImage} />
              ) : (
                <View style={[styles.notifIconCircle, { backgroundColor: icon.bg }]}>
                  <Ionicons name={icon.name} size={18} color="#FFF" />
                </View>
              )}

              {/* Center — text */}
              <View style={styles.notifContent}>
                <Text variant="body" style={[styles.notifTitle, { color: c.text }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text variant="caption" numberOfLines={1}>{item.subtitle}</Text>
              </View>

              {/* Right — time + dot */}
              <View style={styles.notifRight}>
                <Text variant="caption" style={{ fontSize: 11 }}>{item.time}</Text>
                {!item.read && <View style={[styles.dot, { backgroundColor: c.primary }]} />}
              </View>
            </Pressable>
          );
        }}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: c.borderLight, marginLeft: 76 }]} />
        )}
      />
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
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  unreadBadge: {
    minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '800' },

  sectionHeader: {
    paddingHorizontal: spacing.xl, paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },

  notifRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
  },
  notifImage: { width: 48, height: 48, borderRadius: 24 },
  notifIconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  notifContent: { flex: 1, gap: 2 },
  notifTitle: { fontWeight: '600', fontSize: 14 },
  notifRight: { alignItems: 'flex-end', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  separator: { height: StyleSheet.hairlineWidth },
});
