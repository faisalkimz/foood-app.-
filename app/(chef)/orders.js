import { useState } from 'react';
import { View, StyleSheet, FlatList, Image, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../src/components/ui';
import { useTheme } from '../../src/providers/ThemeProvider';
import { chefOrders as initialOrders } from '../../src/services/mock/data';
import { spacing, radius } from '../../src/theme';

const TABS = ['new', 'preparing', 'completed'];
const TAB_LABELS = { new: 'New', preparing: 'Preparing', completed: 'Completed' };
const STATUS_COLORS = {
  new: '#3B82F6',
  preparing: '#F59E0B',
  completed: '#10B981',
};

export default function ChefOrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = useTheme();
  const [activeTab, setActiveTab] = useState('new');
  const [orders, setOrders] = useState(initialOrders);

  const filtered = orders.filter((o) => o.status === activeTab);

  const handleAccept = (id) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'preparing' } : o))
    );
    Alert.alert('✅ Accepted', 'Order moved to Preparing');
  };

  const handleReject = (id) => {
    Alert.alert('Reject Order?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject', style: 'destructive',
        onPress: () => setOrders((prev) => prev.filter((o) => o.id !== id)),
      },
    ]);
  };

  const handleMarkReady = (id) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'completed' } : o))
    );
    Alert.alert('🎉 Ready!', 'Order marked as ready for pickup');
  };

  const renderOrder = ({ item }) => (
    <Pressable
      style={[styles.orderCard, { backgroundColor: c.backgroundSecondary }]}
      onPress={() => router.push(`/chef/order-detail?id=${item.id}`)}
    >
      {/* Customer row */}
      <View style={styles.orderTop}>
        <Image source={{ uri: item.customerImage }} style={styles.avatar} />
        <View style={styles.orderMeta}>
          <Text variant="body" style={[styles.customerName, { color: c.text }]}>{item.customer}</Text>
          <Text variant="caption" style={{ color: c.textMuted }}>{item.time} · {item.address}</Text>
        </View>
        <Text variant="h3" style={[styles.total, { color: c.primary }]}>UGX {item.total}</Text>
      </View>

      {/* Items */}
      <View style={[styles.itemsList, { borderTopColor: c.borderLight }]}>
        {item.items.map((i, idx) => (
          <Text key={idx} variant="bodySmall" style={{ color: c.textSecondary }}>
            {i.qty}x {i.name} — UGX {i.price}
          </Text>
        ))}
        {item.note ? (
          <View style={styles.noteRow}>
            <Ionicons name="chatbubble-ellipses-outline" size={14} color={c.textMuted} />
            <Text variant="caption" style={{ color: c.textMuted, fontStyle: 'italic', flex: 1 }}>
              "{item.note}"
            </Text>
          </View>
        ) : null}
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        {activeTab === 'new' && (
          <>
            <Pressable
              style={[styles.actionBtn, { borderColor: '#EF4444' }]}
              onPress={() => handleReject(item.id)}
            >
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
            <Text variant="bodySmall" style={{ color: '#FFF', fontWeight: '700' }}>Mark Ready</Text>
          </Pressable>
        )}
        {activeTab === 'completed' && (
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
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Text variant="h2" style={{ color: c.text }}>Orders</Text>
        <Pressable
          hitSlop={8}
          onPress={() => Alert.alert('🔔', `You have ${orders.filter((o) => o.status === 'new').length} new orders`)}
        >
          <Ionicons name="notifications-outline" size={24} color={c.text} />
        </Pressable>
      </View>

      {/* Filter tabs */}
      <View style={[styles.tabRow, { borderBottomColor: c.borderLight }]}>
        {TABS.map((tab) => {
          const count = orders.filter((o) => o.status === tab).length;
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
              <View style={[styles.tabBadge, { backgroundColor: STATUS_COLORS[tab] + '20' }]}>
                <Text variant="caption" style={{ color: STATUS_COLORS[tab], fontWeight: '800', fontSize: 11 }}>
                  {count}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Order list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: insets.bottom + 100, paddingTop: spacing.md }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={56} color={c.textMuted} />
            <Text variant="body" style={{ color: c.textMuted }}>No {TAB_LABELS[activeTab].toLowerCase()} orders</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.xl, paddingBottom: spacing.md,
  },
  tabRow: {
    flexDirection: 'row', borderBottomWidth: 1,
    paddingHorizontal: spacing.xl,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: spacing.md, borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomWidth: 2 },
  tabText: { fontWeight: '600', fontSize: 14 },
  tabBadge: {
    paddingHorizontal: 6, paddingVertical: 1, borderRadius: 10, minWidth: 20,
    alignItems: 'center',
  },
  orderCard: {
    borderRadius: radius.lg, padding: spacing.base, marginBottom: spacing.md,
  },
  orderTop: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
  },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  orderMeta: { flex: 1, gap: 2 },
  customerName: { fontWeight: '700', fontSize: 15 },
  total: { fontWeight: '800', fontSize: 17 },
  itemsList: {
    borderTopWidth: 1, marginTop: spacing.md, paddingTop: spacing.md,
    gap: 4,
  },
  noteRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row', gap: spacing.md, marginTop: spacing.md,
  },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: spacing.md, borderRadius: radius.lg,
    borderWidth: 1.5,
  },
  actionFilled: { borderWidth: 0 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.full,
  },
  empty: {
    alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: spacing.md,
  },
});
