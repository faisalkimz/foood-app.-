import { View, StyleSheet, FlatList, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../src/components/shared';
import { Text, Button } from '../../src/components/ui';
import { colors, spacing, radius } from '../../src/theme';

// Mock order history
const mockOrders = [
  {
    id: 'ord1',
    restaurant: 'Rose Garden Restaurant',
    items: '2x Burger Ferguson, 1x Wings',
    total: 105,
    status: 'Delivered',
    date: '15 Jun',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200',
  },
  {
    id: 'ord2',
    restaurant: 'Spicy Restaurant',
    items: '1x Butter Chicken, 1x Naan',
    total: 32,
    status: 'Delivered',
    date: '12 Jun',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=200',
  },
  {
    id: 'ord3',
    restaurant: 'Cafenio Coffee Club',
    items: '2x Latte, 1x Croissant',
    total: 14,
    status: 'Cancelled',
    date: '10 Jun',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=200',
  },
];

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Header title="My Orders" />
      <FlatList
        data={mockOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: spacing.xl,
          paddingBottom: insets.bottom + spacing.xl,
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={64} color={colors.textMuted} />
            <Text variant="h3">No orders yet</Text>
            <Text variant="bodySmall">Your order history will appear here</Text>
            <Button title="Browse Restaurants" onPress={() => router.push('/(tabs)')} />
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.orderCard}
            onPress={() => router.push(`/order/${item.id}`)}
          >
            <Image source={{ uri: item.image }} style={styles.orderImage} />
            <View style={styles.orderInfo}>
              <Text variant="body" style={styles.orderRestaurant} numberOfLines={1}>
                {item.restaurant}
              </Text>
              <Text variant="caption" numberOfLines={1}>{item.items}</Text>
              <View style={styles.orderMeta}>
                <Text variant="bodySmall" style={styles.orderPrice}>${item.total}</Text>
                <View style={[
                  styles.statusBadge,
                  item.status === 'Cancelled' && styles.statusCancelled,
                ]}>
                  <Text variant="caption" style={[
                    styles.statusText,
                    item.status === 'Cancelled' && styles.statusTextCancelled,
                  ]}>
                    {item.status}
                  </Text>
                </View>
              </View>
              <Text variant="caption" style={styles.orderDate}>{item.date}</Text>
            </View>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingTop: spacing['4xl'],
  },
  orderCard: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  orderImage: {
    width: 70,
    height: 70,
    borderRadius: radius.md,
  },
  orderInfo: {
    flex: 1,
    gap: 2,
  },
  orderRestaurant: {
    fontWeight: '700',
    fontSize: 15,
  },
  orderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  orderPrice: {
    fontWeight: '700',
    color: colors.primary,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: '#DCFCE7',
  },
  statusCancelled: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '600',
  },
  statusTextCancelled: {
    color: '#DC2626',
  },
  orderDate: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
});
