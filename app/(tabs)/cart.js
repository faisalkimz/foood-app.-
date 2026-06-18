import { View, StyleSheet, FlatList, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../src/components/shared';
import { Text, Button } from '../../src/components/ui';
import { useCartStore } from '../../src/store';
import { useTheme } from '../../src/providers/ThemeProvider';
import { colors, spacing, radius } from '../../src/theme';

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, removeItem, updateQuantity, getSubtotal, clearCart } = useCartStore();
  const c = useTheme();

  if (items.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <Header title="My Cart" />
        <View style={styles.emptyState}>
          <Ionicons name="cart-outline" size={64} color={c.textMuted} />
          <Text variant="h3" style={[styles.emptyTitle, { color: c.text }]}>Your cart is empty</Text>
          <Text variant="bodySmall" style={styles.emptyText}>
            Add items from a restaurant to get started
          </Text>
          <Button title="Browse Restaurants" onPress={() => router.push('/(tabs)')} />
        </View>
      </View>
    );
  }

  const total = getSubtotal();
  const deliveryFee = 0;
  const grandTotal = total + deliveryFee;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Header title="My Cart" />
      <FlatList
        data={items}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={{ padding: spacing.xl }}
        renderItem={({ item, index }) => (
          <View style={styles.cartItem}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text variant="body" style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text variant="bodySmall" style={styles.itemPrice}>
                ${item.price}
              </Text>
              <View style={styles.qtyRow}>
                <Pressable
                  style={styles.qtyBtn}
                  onPress={() =>
                    item.quantity > 1
                      ? updateQuantity(item.id, item.quantity - 1)
                      : removeItem(item.id)
                  }
                >
                  <Ionicons name="remove" size={16} color={colors.textInverse} />
                </Pressable>
                <Text variant="body" style={styles.qtyText}>{item.quantity || 1}</Text>
                <Pressable
                  style={styles.qtyBtn}
                  onPress={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                >
                  <Ionicons name="add" size={16} color={colors.textInverse} />
                </Pressable>
              </View>
            </View>
            <Pressable onPress={() => removeItem(item.id)} hitSlop={8}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </Pressable>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text variant="body">Subtotal</Text>
              <Text variant="body" style={styles.summaryValue}>${total.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text variant="body">Delivery Fee</Text>
              <Text variant="body" style={[styles.summaryValue, { color: c.success }]}>
                {deliveryFee === 0 ? 'Free' : `$${deliveryFee.toFixed(2)}`}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text variant="h3">Total</Text>
              <Text variant="h3" style={{ color: c.primary }}>${grandTotal.toFixed(2)}</Text>
            </View>
          </View>
        }
      />

      {/* Checkout button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.base, backgroundColor: c.background }]}>
        <Pressable style={styles.checkoutBtn} onPress={() => router.push('/checkout')}>
          <Text variant="body" style={styles.checkoutText}>CHECKOUT</Text>
          <View style={styles.checkoutBadge}>
            <Ionicons name="arrow-forward" size={18} color={c.primary} />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  emptyTitle: {
    marginTop: spacing.sm,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: radius.md,
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontWeight: '700',
    fontSize: 15,
  },
  itemPrice: {
    color: colors.primary,
    fontWeight: '600',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontWeight: '700',
    fontSize: 16,
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
  summary: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryValue: {
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  bottomBar: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.base,
    borderRadius: radius.full,
    gap: spacing.sm,
  },
  checkoutText: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  checkoutBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.textInverse,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
