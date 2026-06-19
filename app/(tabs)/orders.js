import { useState } from 'react';
import { View, StyleSheet, FlatList, Image, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../src/components/ui';
import { useTheme } from '../../src/providers/ThemeProvider';
import { spacing, radius } from '../../src/theme';

const historyOrders = [
  {
    id: 'o1', restaurant: 'Pizza Hut', items: '2x Burger · 4x Sandwich',
    total: 35.25, date: '29 Jan, 12:30', status: 'Completed',
    orderId: '#162432', itemCount: '03 Items',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200',
    category: 'Food',
  },
  {
    id: 'o2', restaurant: 'McDonald', items: '1x Big Mac · 2x Fries',
    total: 40.15, date: '29 Jan, 12:30', status: 'Completed',
    orderId: '#242432', itemCount: '03 Items',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200',
    category: 'Drink',
  },
  {
    id: 'o3', restaurant: 'Starbucks', items: '1x Latte · 1x Cookie',
    total: 10.30, date: '30 Jan, 12:30', status: 'Cancelled',
    orderId: '#240117', itemCount: '01 Items',
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=200',
    category: 'Drink',
  },
];

const ongoingOrders = [
  {
    id: 'oo1', restaurant: 'Pizza Hut', items: '2x Burger',
    total: 35.25, date: '29 Jan, 12:30', status: 'On the way',
    orderId: '#162432', itemCount: '03 Items',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200',
    category: 'Food',
  },
  {
    id: 'oo2', restaurant: 'McDonald', items: '1x Big Mac',
    total: 40.15, date: '29 Jan, 12:30', status: 'Preparing',
    orderId: '#242432', itemCount: '02 Items',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200',
    category: 'Drink',
  },
  {
    id: 'oo3', restaurant: 'Starbucks', items: '2x Latte',
    total: 10.30, date: '30 Jan, 12:30', status: 'Confirmed',
    orderId: '#240117', itemCount: '01 Items',
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=200',
    category: 'Drink',
  },
];

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = useTheme();
  const [activeTab, setActiveTab] = useState('ongoing');

  const orders = activeTab === 'ongoing' ? ongoingOrders : historyOrders;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: c.backgroundSecondary }]}>
          <Ionicons name="arrow-back" size={22} color={c.text} />
        </Pressable>
        <Text variant="h3" style={{ color: c.text }}>My Orders</Text>
        <Pressable hitSlop={8} onPress={() => Alert.alert('Orders', '', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Clear History', style: 'destructive' },
        ])}>
          <Ionicons name="ellipsis-horizontal" size={22} color={c.text} />
        </Pressable>
      </View>

      {/* Tabs */}
      <View style={[styles.tabRow, { borderBottomColor: c.borderLight }]}>
        <Pressable
          style={[styles.tab, activeTab === 'ongoing' && [styles.tabActive, { borderBottomColor: c.primary }]]}
          onPress={() => setActiveTab('ongoing')}
        >
          <Text variant="body" style={[
            styles.tabText,
            { color: c.textMuted },
            activeTab === 'ongoing' && { color: c.primary },
          ]}>
            Ongoing
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'history' && [styles.tabActive, { borderBottomColor: c.primary }]]}
          onPress={() => setActiveTab('history')}
        >
          <Text variant="body" style={[
            styles.tabText,
            { color: c.textMuted },
            activeTab === 'history' && { color: c.primary },
          ]}>
            History
          </Text>
        </Pressable>
      </View>

      {/* Orders list */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing.xl }]}
        renderItem={({ item }) => (
          <View style={[styles.orderCard, { backgroundColor: c.backgroundSecondary }]}>
            {/* Category + status tags */}
            <View style={styles.tagsRow}>
              <View style={[styles.categoryTag, { backgroundColor: c.primaryLight }]}>
                <Text variant="caption" style={[styles.categoryText, { color: c.primary }]}>{item.category}</Text>
              </View>
              <View style={[
                styles.statusTag,
                item.status === 'Completed' && { backgroundColor: '#DCFCE7' },
                item.status === 'Cancelled' && { backgroundColor: '#FEE2E2' },
                item.status === 'On the way' && { backgroundColor: '#FEF3C7' },
                item.status === 'Preparing' && { backgroundColor: '#DBEAFE' },
                item.status === 'Confirmed' && { backgroundColor: '#E0E7FF' },
              ]}>
                <Text variant="caption" style={[
                  styles.statusTagText,
                  item.status === 'Completed' && { color: '#16A34A' },
                  item.status === 'Cancelled' && { color: '#DC2626' },
                  item.status === 'On the way' && { color: '#D97706' },
                  item.status === 'Preparing' && { color: '#2563EB' },
                  item.status === 'Confirmed' && { color: '#4F46E5' },
                ]}>
                  {item.status}
                </Text>
              </View>
            </View>

            {/* Order info row */}
            <Pressable style={styles.orderRow} onPress={() => router.push(`/order/${item.id}`)}>
              <Image source={{ uri: item.image }} style={styles.orderImage} />
              <View style={styles.orderInfo}>
                <Text variant="body" style={[styles.restaurantName, { color: c.text }]} numberOfLines={1}>
                  {item.restaurant}
                </Text>
                <Text variant="h3" style={[styles.orderPrice, { color: c.primary }]}>UGX {item.total}</Text>
                <Text variant="caption" style={{ color: c.textMuted }}>
                  {item.date} · {item.itemCount}
                </Text>
              </View>
              <Text variant="bodySmall" style={[styles.orderId, { color: c.textMuted }]}>{item.orderId}</Text>
            </Pressable>

            {/* Action buttons */}
            <View style={styles.actionsRow}>
              {activeTab === 'history' ? (
                <>
                  <Pressable
                    style={[styles.actionBtn, styles.actionOutline, { borderColor: c.primary }]}
                    onPress={() => Alert.alert('Rate', `Rate your ${item.restaurant} order`)}
                  >
                    <Text variant="bodySmall" style={[styles.actionOutlineText, { color: c.primary }]}>Rate</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.actionBtn, { backgroundColor: c.primary }]}
                    onPress={() => router.push('/(tabs)/cart')}
                  >
                    <Text variant="bodySmall" style={styles.actionFilledText}>Re-Order</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Pressable
                    style={[styles.actionBtn, { backgroundColor: c.primary }]}
                    onPress={() => router.push(`/order/${item.id}`)}
                  >
                    <Text variant="bodySmall" style={styles.actionFilledText}>Track Order</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.actionBtn, styles.actionOutline, { borderColor: c.primary }]}
                    onPress={() => Alert.alert('Cancel Order', 'Are you sure you want to cancel?', [
                      { text: 'No', style: 'cancel' },
                      { text: 'Yes, Cancel', style: 'destructive' },
                    ])}
                  >
                    <Text variant="bodySmall" style={[styles.actionOutlineText, { color: c.primary }]}>Cancel</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
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
  tabRow: {
    flexDirection: 'row', paddingHorizontal: spacing.xl, borderBottomWidth: 1,
  },
  tab: {
    flex: 1, alignItems: 'center', paddingBottom: spacing.md,
    borderBottomWidth: 3, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomWidth: 3 },
  tabText: { fontWeight: '600', fontSize: 15 },
  list: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  orderCard: {
    borderRadius: radius.lg, padding: spacing.base, gap: spacing.md,
  },
  tagsRow: { flexDirection: 'row', gap: spacing.sm },
  categoryTag: {
    paddingHorizontal: spacing.md, paddingVertical: 3, borderRadius: radius.full,
  },
  categoryText: { fontWeight: '700', fontSize: 11 },
  statusTag: {
    paddingHorizontal: spacing.md, paddingVertical: 3, borderRadius: radius.full,
  },
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
