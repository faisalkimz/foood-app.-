import { useState } from 'react';
import { View, StyleSheet, Pressable, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../src/components/ui';
import { useTheme } from '../../src/providers/ThemeProvider';
import { spacing, radius } from '../../src/theme';

const notifications = [
  { id: '1', title: 'Order Delivered!', body: 'Your order #162432 from Pizza Hut has been delivered. Enjoy your meal!', time: '2 min ago', icon: 'checkmark-circle', iconColor: '#16A34A', read: false },
  { id: '2', title: 'Special Offer 🎉', body: 'Get 30% off on all burgers this weekend. Use code BURGER30.', time: '1 hour ago', icon: 'gift', iconColor: '#FF6B35', read: false },
  { id: '3', title: 'Order On The Way', body: 'Robert Fox is on the way with your order. Track your delivery in real time.', time: '3 hours ago', icon: 'bicycle', iconColor: '#2563EB', read: true },
  { id: '4', title: 'Payment Successful', body: 'Your payment of $35.25 for order #162432 was successful.', time: 'Yesterday', icon: 'card', iconColor: '#7C3AED', read: true },
  { id: '5', title: 'New Restaurant', body: 'Kampala Kitchen just joined FoodOrder! Check out their menu.', time: '2 days ago', icon: 'restaurant', iconColor: '#D97706', read: true },
  { id: '6', title: 'Rate Your Order', body: 'How was your order from McDonald? Leave a review and help others.', time: '3 days ago', icon: 'star', iconColor: '#EAB308', read: true },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = useTheme();
  const [items, setItems] = useState(notifications);

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: c.backgroundSecondary }]}>
          <Ionicons name="arrow-back" size={22} color={c.text} />
        </Pressable>
        <Text variant="h3" style={{ color: c.text }}>Notifications</Text>
        <Pressable onPress={markAllRead} hitSlop={8}>
          <Text variant="bodySmall" style={{ color: c.primary, fontWeight: '600' }}>Mark all read</Text>
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: insets.bottom + spacing.xl }}
        renderItem={({ item }) => (
          <View style={[styles.notifCard, { backgroundColor: item.read ? 'transparent' : c.primaryLight }]}>
            <View style={[styles.notifIcon, { backgroundColor: item.iconColor + '20' }]}>
              <Ionicons name={item.icon} size={20} color={item.iconColor} />
            </View>
            <View style={styles.notifContent}>
              <View style={styles.notifHeader}>
                <Text variant="body" style={[styles.notifTitle, { color: c.text }]}>{item.title}</Text>
                {!item.read && <View style={[styles.unreadDot, { backgroundColor: c.primary }]} />}
              </View>
              <Text variant="caption" style={{ lineHeight: 18 }}>{item.body}</Text>
              <Text variant="caption" style={{ fontSize: 11, marginTop: 4 }}>{item.time}</Text>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: c.borderLight }]} />}
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
  notifCard: {
    flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm, borderRadius: radius.md,
  },
  notifIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  notifContent: { flex: 1 },
  notifHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 2 },
  notifTitle: { fontWeight: '700', fontSize: 14, flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  separator: { height: 1, marginVertical: 2 },
});
