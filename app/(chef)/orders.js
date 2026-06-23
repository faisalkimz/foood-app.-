import { useState, useCallback } from 'react';
import {
  View, StyleSheet, FlatList, Image, Pressable, Alert,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, showToast } from '../../src/components/ui';
import { useTheme } from '../../src/providers/ThemeProvider';
import { fetchMyOrders, updateOrderStatus } from '../../src/services/restaurantService';
import { spacing, radius } from '../../src/theme';

const TABS = ['pending', 'preparing', 'delivered'];
const TAB_LABELS = { pending: 'New', preparing: 'Preparing', delivered: 'Completed' };
const STATUS_COLORS = { pending: '#3B82F6', preparing: '#F59E0B', delivered: '#10B981' };

export default function ChefOrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = useTheme();
  const [activeTab, setActiveTab] = useState('pending');
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const data = await fetchMyOrders();
      setOrders(data);
    } catch { /* silent */ }
    finally { setIsLoading(false); setIsRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, []));

  const filtered = orders.filter((o) => {
    if (activeTab === 'pending') return ['pending', 'confirmed'].includes(o.status);
    if (activeTab === 'preparing') return ['preparing', 'ready'].includes(o.status);
    return ['delivered', 'cancelled'].includes(o.status);
  });

  const handleAccept = async (id) => {
    try {
      await updateOrderStatus(id, 'preparing');
      showToast({ type: 'success', message: 'Order accepted!' });
      load(true);
    } catch { showToast({ type: 'error', message: 'Failed to accept.' }); }
  };

  const handleReject = (id) => {
    Alert.alert('Reject Order?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject', style: 'destructive',
        onPress: async () => {
          try {
            await updateOrderStatus(id, 'cancelled');
            showToast({ type: 'success', message: 'Order rejected.' });
            load(true);
          } catch { showToast({ type: 'error', message: 'Failed.' }); }
        },
      },
    ]);
  };

  const handleMarkReady = async (id) => {
    try {
      await updateOrderStatus(id, 'delivered');
      showToast({ type: 'success', message: 'Order marked as ready!' });
      load(true);
    } catch { showToast({ type: 'error', message: 'Failed.' }); }
  };

  const renderOrder = ({ item }) => (
    <Pressable
      style={[styles.orderCard, { backgroundColor: c.backgroundSecondary }]}
      onPress={() => router.push(`/chef/order-detail?id=${item.id}`)}
    >
      <View style={styles.orderTop}>
        <Image
          source={{ uri: item.customerImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.customer)}&background=FF6B35&color=fff` }}
          style={styles.avatar}
        />
        <View style={styles.orderMeta}>
          <Text variant="body" style={[styles.customerName, { color: c.text }]}>{item.customer}</Text>
          <Text variant="caption" style={{ color: c.textMuted }} numberOfLines={1}>{item.address}</Text>
        </View>
        <Text variant="h3" style={[styles.total, { color: c.primary }]}>UGX {item.total.toLocaleString()}</Text>
      </View>

      <View style={[styles.itemsList, { borderTopColor: c.borderLight }]}>
        {item.items.map((i, idx) => (
          <Text key={idx} variant="bodySmall" style={{ color: c.textSecondary }}>
            {i.qty}x {i.name} — UGX {i.price.toLocaleString()}
          </Text>
        ))}
        {item.notes ? (
          <View style={styles.noteRow}>
            <Ionicons name="chatbubble-ellipses-outline" size={14} color={c.textMuted} />
            <Text variant="caption" style={{ color: c.textMuted, fontStyle: 'italic', flex: 1 }}>
              "{item.notes}"
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.actionsRow}>
        {activeTab === 'pending' && (
          <>
            <Pressable style={[styles.actionBtn, { borderColor: '#EF4444' }]} onPress={() => handleReject(item.id)}>
              <Ionicons name="close" size={16} color="#EF4444" />
              <Text variant="bodySmall" style={{ color: '#EF4444', fontWeight: '700' }}>Reject</Text>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, styles.actionFilled, { backgroundColor: c.primary }]}
              onPress={() => handleAccept(item.id)}
            >
              <Ionicons name="checkmark" size={16} color="#FFF" />
              <Text variant="bodySmall" style={{ color: '#FFF', fontWeight: '700' }}>Accept</Text>
            </Pressable>
          </>
        )}
        {activeTab === 'preparing' && (
          <Pressable
            style={[styles.actionBtn, styles.actionFilled, { backgroundColor: '#10B981', flex: 1 }]}
            onPress={() => handleMarkReady(item.id)}
          >
            <Ionicons name="checkmark-done" size={16} color="#FFF" />
            <Text variant="bodySmall" style={{ color: '#FFF', fontWeight: '700' }}>Mark Done</Text>
          </Pressable>
        )}
        {activeTab === 'delivered' && (
          <View style={[styles.statusPill, { backgroundColor: '#10B98120' }]}>
            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
            <Text variant="caption" style={{ color: '#10B981', fontWeight: '700' }}>Completed</Text>
          </View>
        )}
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Text variant="h2" style={{ color: c.text }}>Orders</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.tabRow, { borderBottomColor: c.borderLight }]}>
        {TABS.map((tab) => {
          const count = orders.filter((o) => {
            if (tab === 'pending') return ['pending', 'confirmed'].includes(o.status);
            if (tab === 'preparing') return ['preparing', 'ready'].includes(o.status);
            return ['delivered', 'cancelled'].includes(o.status);
          }).length;
          return (
            <Pressable
              key={tab}
              style={[styles.tab, activeTab === tab && [styles.tabActive, { borderBottomColor: c.primary }]]}
              onPress={() => setActiveTab(tab)}
            >
              <Text variant="body" style={[
                styles.tabText, { color: c.textMuted },
                activeTab === tab && { color: c.primary },
              ]}>
                {TAB_LABELS[tab]}
              </Text>
              <View style={[styles.tabBadge, { backgroundColor: (STATUS_COLORS[tab] || '#6B7280') + '20' }]}>
                <Text variant="caption" style={{ color: STATUS_COLORS[tab] || '#6B7280', fontWeight: '800', fontSize: 11 }}>
                  {count}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderOrder}
          contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: insets.bottom + 100, paddingTop: spacing.md }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); load(true); }} tintColor={c.primary} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="receipt-outline" size={56} color={c.textMuted} />
              <Text variant="body" style={{ color: c.textMuted }}>No {TAB_LABELS[activeTab].toLowerCase()} orders</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.xl, paddingBottom: spacing.md,
  },
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, paddingHorizontal: spacing.xl },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: spacing.md, borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomWidth: 2 },
  tabText: { fontWeight: '600', fontSize: 14 },
  tabBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 10, minWidth: 20, alignItems: 'center' },
  orderCard: { borderRadius: radius.lg, padding: spacing.base, marginBottom: spacing.md },
  orderTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  orderMeta: { flex: 1, gap: 2 },
  customerName: { fontWeight: '700', fontSize: 15 },
  total: { fontWeight: '800', fontSize: 17 },
  itemsList: { borderTopWidth: 1, marginTop: spacing.md, paddingTop: spacing.md, gap: 4 },
  noteRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  actionsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: spacing.md, borderRadius: radius.lg, borderWidth: 1.5,
  },
  actionFilled: { borderWidth: 0 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.full,
  },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: spacing.md },
});
