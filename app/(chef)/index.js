import { useState, useEffect, useCallback } from 'react';
import {
  View, StyleSheet, ScrollView, Pressable, Image,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../src/components/ui';
import { useTheme } from '../../src/providers/ThemeProvider';
import { useAuthStore } from '../../src/store';
import { fetchChefStats, fetchMyOrders } from '../../src/services/restaurantService';
import { spacing, radius } from '../../src/theme';

const STATUS_COLORS = {
  pending: '#6B7280',
  confirmed: '#3B82F6',
  preparing: '#F59E0B',
  ready: '#8B5CF6',
  delivering: '#06B6D4',
  delivered: '#10B981',
  cancelled: '#EF4444',
};

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  delivering: 'Out',
  delivered: 'Done',
  cancelled: 'Cancelled',
};

export default function ChefDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = useTheme();
  const user = useAuthStore((s) => s.user);

  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning 👋' : hour < 17 ? 'Good Afternoon 👋' : 'Good Evening 👋';
  const firstName = user?.full_name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Chef';

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [statsData, ordersData] = await Promise.all([
        fetchChefStats(),
        fetchMyOrders(),
      ]);
      setStats(statsData);
      setRecentOrders(ordersData.slice(0, 5));
    } catch {
      // Fail silently on dashboard — keep showing what we have
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, []);

  const onRefresh = () => { setIsRefreshing(true); loadData(true); };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, backgroundColor: c.primary }]}>
        <View>
          <Text variant="bodySmall" style={styles.greetSub}>{greeting}</Text>
          <Text variant="h2" style={styles.greetName}>{firstName}</Text>
        </View>
        <Pressable style={styles.notifBtn} onPress={() => router.push('/chef/earnings')}>
          <Ionicons name="stats-chart" size={24} color="#FFF" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={c.primary} />
        }
      >
        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={c.primary} />
            <Text variant="bodySmall" style={{ color: c.textMuted, marginTop: spacing.md }}>
              Loading your dashboard…
            </Text>
          </View>
        ) : (
          <>
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              {[
                { icon: 'receipt', color: '#3B82F6', bg: '#EFF6FF', value: stats?.todayOrders ?? 0, label: "Today's Orders" },
                { icon: 'cash', color: '#10B981', bg: '#F0FDF4', value: `UGX ${(stats?.todayRevenue ?? 0).toLocaleString()}`, label: 'Revenue' },
                { icon: 'flame', color: '#F59E0B', bg: '#FFF7ED', value: stats?.activeOrders ?? 0, label: 'Active' },
                { icon: 'star', color: '#EF4444', bg: '#FEF2F2', value: stats?.avgRating > 0 ? stats.avgRating.toFixed(1) : 'New', label: 'Rating' },
              ].map(({ icon, color, bg, value, label }) => (
                <View key={label} style={[styles.statCard, { backgroundColor: c.backgroundSecondary }]}>
                  <View style={[styles.statIcon, { backgroundColor: bg }]}>
                    <Ionicons name={icon} size={20} color={color} />
                  </View>
                  <Text variant="h2" style={[styles.statValue, { color: c.text }]} numberOfLines={1}>
                    {value}
                  </Text>
                  <Text variant="caption" style={{ color: c.textMuted }}>{label}</Text>
                </View>
              ))}
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <Pressable
                style={[styles.quickBtn, { backgroundColor: c.primary }]}
                onPress={() => router.push('/chef/add-item')}
              >
                <Ionicons name="add-circle" size={20} color="#FFF" />
                <Text variant="body" style={styles.quickBtnText}>Add Menu Item</Text>
              </Pressable>
              <Pressable
                style={[styles.quickBtn, { backgroundColor: c.backgroundSecondary, borderWidth: 1, borderColor: c.border }]}
                onPress={() => router.push('/(chef)/orders')}
              >
                <Ionicons name="list" size={20} color={c.primary} />
                <Text variant="body" style={[styles.quickBtnText, { color: c.text }]}>View Orders</Text>
              </Pressable>
            </View>

            {/* Recent Orders */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text variant="h3" style={{ color: c.text }}>Recent Orders</Text>
                <Pressable onPress={() => router.push('/(chef)/orders')}>
                  <Text variant="bodySmall" style={{ color: c.primary }}>See All &gt;</Text>
                </Pressable>
              </View>

              {recentOrders.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={{ fontSize: 36 }}>🍽️</Text>
                  <Text variant="bodySmall" style={{ color: c.textMuted, marginTop: spacing.sm, textAlign: 'center' }}>
                    No orders yet. Share your restaurant link to get started!
                  </Text>
                </View>
              ) : recentOrders.map((order) => (
                <Pressable
                  key={order.id}
                  style={[styles.orderCard, { backgroundColor: c.backgroundSecondary }]}
                  onPress={() => router.push(`/chef/order-detail?id=${order.id}`)}
                >
                  <Image
                    source={{ uri: order.customerImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(order.customer)}&background=FF6B35&color=fff` }}
                    style={styles.orderAvatar}
                  />
                  <View style={styles.orderInfo}>
                    <Text variant="body" style={[styles.orderName, { color: c.text }]}>{order.customer}</Text>
                    <Text variant="caption" style={{ color: c.textMuted }} numberOfLines={1}>
                      {order.items.map((i) => `${i.qty}x ${i.name}`).join(' · ')}
                    </Text>
                  </View>
                  <View style={styles.orderRight}>
                    <Text variant="body" style={[styles.orderTotal, { color: c.text }]}>
                      UGX {order.total.toLocaleString()}
                    </Text>
                    <View style={[styles.statusPill, { backgroundColor: (STATUS_COLORS[order.status] || '#6B7280') + '20' }]}>
                      <Text variant="caption" style={{ color: STATUS_COLORS[order.status] || '#6B7280', fontWeight: '700', fontSize: 11 }}>
                        {STATUS_LABELS[order.status] || order.status}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: spacing.xl, paddingBottom: spacing.xl,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  greetSub: { color: 'rgba(255,255,255,0.75)', fontSize: 14 },
  greetName: { color: '#FFF', fontSize: 22, fontWeight: '800' },
  notifBtn: { padding: spacing.sm },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, gap: 0 },
  loadingState: { alignItems: 'center', paddingTop: 60 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xl },
  statCard: { width: '47%', padding: spacing.base, borderRadius: radius.lg, gap: spacing.xs },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  statValue: { fontSize: 20, fontWeight: '800' },
  quickActions: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  quickBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, paddingVertical: spacing.base, borderRadius: radius.lg,
  },
  quickBtnText: { fontWeight: '700', color: '#FFF', fontSize: 13 },
  section: { marginBottom: spacing.xl },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md,
  },
  emptyState: { alignItems: 'center', paddingVertical: spacing['2xl'] },
  orderCard: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.md,
    borderRadius: radius.lg, marginBottom: spacing.sm, gap: spacing.md,
  },
  orderAvatar: { width: 44, height: 44, borderRadius: 22 },
  orderInfo: { flex: 1, gap: 2 },
  orderName: { fontWeight: '700', fontSize: 14 },
  orderRight: { alignItems: 'flex-end', gap: 4 },
  orderTotal: { fontWeight: '800', fontSize: 15 },
  statusPill: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full },
});
