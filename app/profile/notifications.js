import { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, SectionList, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { useTheme } from '@/providers/ThemeProvider';
import { supabase } from '@/services/supabase';
import { spacing, radius } from '@/theme';
import { formatCurrency } from '@/utils/format';

const statusMessages = {
  pending: { title: 'Order placed', icon: 'receipt', bg: '#6B7280' },
  confirmed: { title: 'Order confirmed', icon: 'checkmark-circle', bg: '#3B82F6' },
  preparing: { title: 'Your food is being prepared', icon: 'flame', bg: '#F59E0B' },
  ready: { title: 'Order ready for pickup', icon: 'bag-check', bg: '#8B5CF6' },
  delivering: { title: 'Your order is on the way', icon: 'bicycle', bg: '#FF6B35' },
  delivered: { title: 'Your order has been delivered', icon: 'checkmark-done-circle', bg: '#10B981' },
  cancelled: { title: 'Order cancelled', icon: 'close-circle', bg: '#EF4444' },
};

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = useTheme();

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [readIds, setReadIds] = useState(new Set());

  const loadNotifications = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsLoading(false); return; }

      const { data: orders } = await supabase
        .from('orders')
        .select(`
          id, status, created_at, updated_at, total_amount,
          restaurants ( name, image_url )
        `)
        .eq('customer_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(20);

      const notifications = (orders || []).map((o) => {
        const info = statusMessages[o.status] || statusMessages.pending;
        return {
          id: o.id,
          type: 'order',
          title: info.title,
          subtitle: `${o.restaurants?.name || 'Restaurant'} — ${formatCurrency(parseFloat(o.total_amount || 0))}`,
          time: timeAgo(o.updated_at || o.created_at),
          image: o.restaurants?.image_url || null,
          iconName: info.icon,
          iconBg: info.bg,
          orderId: o.id,
          read: readIds.has(o.id),
        };
      });

      setItems(notifications);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { loadNotifications(); }, []);

  const markAllRead = () => {
    const newReadIds = new Set(items.map((n) => n.id));
    setReadIds(newReadIds);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id) => {
    setReadIds((prev) => new Set([...prev, id]));
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = items.filter((n) => !n.read).length;

  // Group into sections
  const newItems = items.filter((n) => !n.read);
  const earlierItems = items.filter((n) => n.read);
  const sections = [];
  if (newItems.length > 0) sections.push({ title: 'New', data: newItems });
  if (earlierItems.length > 0) sections.push({ title: 'Earlier', data: earlierItems });

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: c.background, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

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
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => { setIsRefreshing(true); loadNotifications(true); }}
            tintColor={c.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={56} color={c.textMuted} />
            <Text variant="body" style={{ color: c.textMuted }}>No notifications yet</Text>
            <Text variant="caption" style={{ color: c.textMuted }}>Place an order to see updates here</Text>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHeader, { borderBottomColor: c.borderLight }]}>
            <Text variant="label" style={{ color: c.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 }}>
              {section.title.toUpperCase()}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.notifRow, !item.read && { backgroundColor: c.primaryLight + '40' }]}
            onPress={() => {
              markRead(item.id);
              router.push(`/order/${item.orderId}`);
            }}
          >
            {/* Left — image or icon */}
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.notifImage} />
            ) : (
              <View style={[styles.notifIconCircle, { backgroundColor: item.iconBg }]}>
                <Ionicons name={item.iconName} size={18} color="#FFF" />
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
        )}
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
  empty: { alignItems: 'center', paddingTop: 80, gap: spacing.md },
});
