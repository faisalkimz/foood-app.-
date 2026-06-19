import { View, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../src/components/ui';
import { useTheme } from '../../src/providers/ThemeProvider';
import { useAuthStore } from '../../src/store';
import { chefStats, chefOrders } from '../../src/services/mock/data';
import { spacing, radius } from '../../src/theme';

const STATUS_COLORS = {
  new: '#3B82F6',
  preparing: '#F59E0B',
  completed: '#10B981',
};

export default function ChefDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = useTheme();
  const user = useAuthStore((s) => s.user);

  const recentOrders = chefOrders.slice(0, 5);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, backgroundColor: c.primary }]}>
        <View>
          <Text variant="bodySmall" style={styles.greetSub}>Good Morning 👋</Text>
          <Text variant="h2" style={styles.greetName}>{user?.name || 'Chef'}</Text>
        </View>
        <Pressable
          style={styles.notifBtn}
          onPress={() => router.push('/chef/earnings')}
        >
          <Ionicons name="notifications-outline" size={24} color="#FFF" />
          <View style={styles.notifDot} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: c.backgroundSecondary }]}>
            <View style={[styles.statIcon, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="receipt" size={20} color="#3B82F6" />
            </View>
            <Text variant="h2" style={[styles.statValue, { color: c.text }]}>{chefStats.todayOrders}</Text>
            <Text variant="caption" style={{ color: c.textMuted }}>Today's Orders</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: c.backgroundSecondary }]}>
            <View style={[styles.statIcon, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="cash" size={20} color="#10B981" />
            </View>
            <Text variant="h2" style={[styles.statValue, { color: c.text }]}>UGX {chefStats.todayRevenue}</Text>
            <Text variant="caption" style={{ color: c.textMuted }}>Revenue</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: c.backgroundSecondary }]}>
            <View style={[styles.statIcon, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="flame" size={20} color="#F59E0B" />
            </View>
            <Text variant="h2" style={[styles.statValue, { color: c.text }]}>{chefStats.activeOrders}</Text>
            <Text variant="caption" style={{ color: c.textMuted }}>Active</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: c.backgroundSecondary }]}>
            <View style={[styles.statIcon, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="star" size={20} color="#EF4444" />
            </View>
            <Text variant="h2" style={[styles.statValue, { color: c.text }]}>{chefStats.avgRating}</Text>
            <Text variant="caption" style={{ color: c.textMuted }}>Rating</Text>
          </View>
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
            <Text variant="body" style={[styles.quickBtnText, { color: c.text }]}>View All Orders</Text>
          </Pressable>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="h3" style={{ color: c.text }}>Recent Orders</Text>
            <Pressable onPress={() => router.push('/(chef)/orders')}>
              <Text variant="bodySmall" style={{ color: c.primary }}>See All ></Text>
            </Pressable>
          </View>

          {recentOrders.map((order) => (
            <Pressable
              key={order.id}
              style={[styles.orderCard, { backgroundColor: c.backgroundSecondary }]}
              onPress={() => router.push(`/chef/order-detail?id=${order.id}`)}
            >
              <Image source={{ uri: order.customerImage }} style={styles.orderAvatar} />
              <View style={styles.orderInfo}>
                <Text variant="body" style={[styles.orderName, { color: c.text }]}>{order.customer}</Text>
                <Text variant="caption" style={{ color: c.textMuted }}>
                  {order.items.map((i) => `${i.qty}x ${i.name}`).join(' · ')}
                </Text>
                <Text variant="caption" style={{ color: c.textMuted }}>{order.time}</Text>
              </View>
              <View style={styles.orderRight}>
                <Text variant="body" style={[styles.orderTotal, { color: c.text }]}>UGX {order.total}</Text>
                <View style={[styles.statusPill, { backgroundColor: STATUS_COLORS[order.status] + '20' }]}>
                  <Text variant="caption" style={{ color: STATUS_COLORS[order.status], fontWeight: '700', fontSize: 11 }}>
                    {order.status === 'new' ? 'New' : order.status === 'preparing' ? 'Preparing' : 'Done'}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
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
  greetSub: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  greetName: { color: '#FFF', fontSize: 22, fontWeight: '800' },
  notifBtn: { position: 'relative', padding: spacing.sm },
  notifDot: {
    position: 'absolute', top: 6, right: 6, width: 8, height: 8,
    borderRadius: 4, backgroundColor: '#EF4444',
  },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md,
  },
  statCard: {
    width: '47%', padding: spacing.base, borderRadius: radius.lg, gap: spacing.xs,
  },
  statIcon: {
    width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  statValue: { fontSize: 22, fontWeight: '800' },
  quickActions: {
    flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl,
  },
  quickBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, paddingVertical: spacing.base, borderRadius: radius.lg,
  },
  quickBtnText: { fontWeight: '700', color: '#FFF', fontSize: 13 },
  section: { marginTop: spacing.xl },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.md,
  },
  orderCard: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.md,
    borderRadius: radius.lg, marginBottom: spacing.sm, gap: spacing.md,
  },
  orderAvatar: { width: 44, height: 44, borderRadius: 22 },
  orderInfo: { flex: 1, gap: 2 },
  orderName: { fontWeight: '700', fontSize: 14 },
  orderRight: { alignItems: 'flex-end', gap: 4 },
  orderTotal: { fontWeight: '800', fontSize: 15 },
  statusPill: {
    paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full,
  },
});
