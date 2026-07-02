import { useState, useEffect, useCallback } from 'react';
import {
  View, StyleSheet, FlatList, Image, Pressable, Alert,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Skeleton, showToast } from '@/components/ui';
import { formatCurrency } from '@/utils/format';
import { useTheme } from '@/providers/ThemeProvider';
import { fetchMyOrders, cancelOrder } from '@/services/orderService';
import { spacing, radius } from '@/theme';

const STATUS_BG = {
  'Completed': '#DCFCE7', 'Cancelled': '#FEE2E2',
  'On the way': '#FEF3C7', 'Preparing': '#DBEAFE',
  'Confirmed': '#E0E7FF', 'Pending': '#F3F4F6', 'Ready': '#EDE9FE',
};
const STATUS_COLOR = {
  'Completed': '#16A34A', 'Cancelled': '#DC2626',
  'On the way': '#D97706', 'Preparing': '#2563EB',
  'Confirmed': '#4F46E5', 'Pending': '#6B7280', 'Ready': '#7C3AED',
};

const ONGOING = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'On the way'];

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = useTheme();
  const [activeTab, setActiveTab] = useState('ongoing');
  const [allOrders, setAllOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const data = await fetchMyOrders();
      setAllOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
      if (!silent) {
        showToast({ type: 'error', message: 'Failed to load orders. Please check your connection.' });
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, []));

  const onRefresh = () => { setIsRefreshing(true); load(true); };

  const ongoingOrders = allOrders.filter((o) => ONGOING.includes(o.status));
  const historyOrders = allOrders.filter((o) => !ONGOING.includes(o.status));
  const orders = activeTab === 'ongoing' ? ongoingOrders : historyOrders;

  const handleCancel = (orderId) => {
    Alert.alert('Cancel Order?', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel', style: 'destructive',
        onPress: async () => {
          try {
            await cancelOrder(orderId);
            showToast({ type: 'success', message: 'Order cancelled.' });
            load(true);
          } catch {
            showToast({ type: 'error', message: 'Failed to cancel.' });
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: c.backgroundSecondary }]}>
          <Ionicons name="arrow-back" size={22} color={c.text} />
        </Pressable>
        <Text variant="h3" style={{ color: c.text }}>My Orders</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabRow, { borderBottomColor: c.borderLight }]}>
        {['ongoing', 'history'].map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && [styles.tabActive, { borderBottomColor: c.primary }]]}
            onPress={() => setActiveTab(tab)}
          >
            <Text variant="body" style={[
              styles.tabText, { color: c.textMuted },
              activeTab === tab && { color: c.primary },
            ]}>
              {tab === 'ongoing' ? `Ongoing (${ongoingOrders.length})` : `History (${historyOrders.length})`}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      {isLoading ? (
        <Skeleton.Orders />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing.xl }]}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={c.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color={c.textMuted} />
              <Text variant="body" style={{ color: c.textMuted }}>
                {activeTab === 'ongoing' ? 'No ongoing orders' : 'No order history yet'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.orderCard, { backgroundColor: c.backgroundSecondary }]}>
              {/* Status tag */}
              <View style={styles.tagsRow}>
                <View style={[styles.statusTag, { backgroundColor: STATUS_BG[item.status] || '#F3F4F6' }]}>
                  <Text variant="caption" style={[
                    styles.statusTagText,
                    { color: STATUS_COLOR[item.status] || '#6B7280' },
                  ]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              {/* Order info */}
              <Pressable style={styles.orderRow} onPress={() => router.push(`/order/${item.id}`)}>
                <Image
                  source={{ uri: item.restaurantImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.restaurant)}&background=FF6B35&color=fff` }}
                  style={styles.orderImage}
                />
                <View style={styles.orderInfo}>
                  <Text variant="body" style={[styles.restaurantName, { color: c.text }]} numberOfLines={1}>
                    {item.restaurant}
                  </Text>
                  <Text variant="h3" style={[styles.orderPrice, { color: c.primary }]}>
                    {formatCurrency(item.total)}
                  </Text>
                  <Text variant="caption" style={{ color: c.textMuted }}>
                    {item.date} · {item.itemCount}
                  </Text>
                </View>
                <Text variant="bodySmall" style={[styles.orderId, { color: c.textMuted }]}>
                  {item.orderId}
                </Text>
              </Pressable>

              {/* Actions */}
              <View style={styles.actionsRow}>
                {activeTab === 'history' ? (
                  <Pressable
                    style={[styles.actionBtn, { backgroundColor: c.primary }]}
                    onPress={() => router.push(`/restaurant/${item.restaurantId}`)}
                  >
                    <Text variant="bodySmall" style={styles.actionFilledText}>Order Again</Text>
                  </Pressable>
                ) : (
                  <>
                    <Pressable
                      style={[styles.actionBtn, { backgroundColor: c.primary }]}
                      onPress={() => router.push(`/order/${item.id}`)}
                    >
                      <Text variant="bodySmall" style={styles.actionFilledText}>Track Order</Text>
                    </Pressable>
                    {item.statusRaw === 'pending' && (
                      <Pressable
                        style={[styles.actionBtn, styles.actionOutline, { borderColor: c.primary }]}
                        onPress={() => handleCancel(item.id)}
                      >
                        <Text variant="bodySmall" style={[styles.actionOutlineText, { color: c.primary }]}>Cancel</Text>
                      </Pressable>
                    )}
                  </>
                )}
              </View>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        />
      )}
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
  tabRow: { flexDirection: 'row', paddingHorizontal: spacing.xl, borderBottomWidth: 1 },
  tab: {
    flex: 1, alignItems: 'center', paddingBottom: spacing.md,
    borderBottomWidth: 3, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomWidth: 3 },
  tabText: { fontWeight: '600', fontSize: 15 },
  list: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: spacing.md },
  orderCard: { borderRadius: radius.lg, padding: spacing.base, gap: spacing.md },
  tagsRow: { flexDirection: 'row', gap: spacing.sm },
  statusTag: { paddingHorizontal: spacing.md, paddingVertical: 3, borderRadius: radius.full },
  statusTagText: { fontWeight: '700', fontSize: 11 },
  orderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  orderImage: { width: 56, height: 56, borderRadius: radius.md },
  orderInfo: { flex: 1, gap: 2 },
  restaurantName: { fontWeight: '700', fontSize: 15 },
  orderPrice: { fontWeight: '800', fontSize: 18 },
  orderId: { fontSize: 11 },
  actionsRow: { flexDirection: 'row', gap: spacing.md },
  actionBtn: {
    flex: 1, paddingVertical: spacing.sm, borderRadius: radius.full, alignItems: 'center',
  },
  actionOutline: { borderWidth: 1.5, backgroundColor: 'transparent' },
  actionOutlineText: { fontWeight: '700', fontSize: 13 },
  actionFilledText: { fontWeight: '700', fontSize: 13, color: '#FFF' },
});
