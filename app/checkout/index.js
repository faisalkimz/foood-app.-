import { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, Pressable, Platform, Alert, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../src/components/ui';
import { useCartStore } from '../../src/store';
import { useTheme } from '../../src/providers/ThemeProvider';
import { colors, spacing, radius } from '../../src/theme';

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, getSubtotal, updateQuantity, removeItem } = useCartStore();
  const [address, setAddress] = useState('2118 Thornridge Cir. Syracuse');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editAddress, setEditAddress] = useState('');
  const c = useTheme();

  const subtotal = getSubtotal();
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = () => {
    router.push('/checkout/payment');
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textInverse} />
        </Pressable>
        <Text variant="h3" style={styles.headerTitle}>Cart</Text>
        <Pressable hitSlop={8} onPress={() => router.push('/(tabs)/cart')}>
          <Text variant="bodySmall" style={styles.editText}>EDIT ITEMS</Text>
        </Pressable>
      </View>

      {/* Dark cart items area */}
      <View style={styles.cartArea}>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.itemsList}>
          {items.map((item, index) => (
            <View key={`${item.id}-${index}`} style={styles.cartItem}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <View style={styles.itemHeader}>
                  <Text variant="body" style={styles.itemName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Pressable onPress={() => removeItem(item.id)} hitSlop={8}>
                    <Ionicons name="close-circle" size={22} color={colors.primary} />
                  </Pressable>
                </View>
                <Text variant="h3" style={styles.itemPrice}>UGX {item.price}</Text>
                <View style={styles.itemControls}>
                  <Text variant="caption" style={styles.sizeLabel}>14"</Text>
                  <View style={styles.qtyControls}>
                    <Pressable
                      style={styles.qtyBtn}
                      onPress={() =>
                        item.quantity > 1
                          ? updateQuantity(item.id, item.quantity - 1)
                          : removeItem(item.id)
                      }
                    >
                      <Ionicons name="remove" size={14} color={colors.textInverse} />
                    </Pressable>
                    <Text variant="body" style={styles.qtyText}>{item.quantity}</Text>
                    <Pressable
                      style={styles.qtyBtn}
                      onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Ionicons name="add" size={14} color={colors.textInverse} />
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* White bottom section */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + spacing.base }]}>
        {/* Delivery address */}
        <View style={styles.addressSection}>
          <View style={styles.addressHeader}>
            <Text variant="label" style={styles.addressLabel}>DELIVERY ADDRESS</Text>
            <Pressable hitSlop={8} onPress={() => {
              setEditAddress(address);
              setShowAddressModal(true);
            }}>
              <Text variant="bodySmall" style={styles.editLink}>EDIT</Text>
            </Pressable>
          </View>
          <View style={styles.addressBox}>
            <Ionicons name="location-outline" size={18} color={colors.textMuted} />
            <Text variant="body" style={styles.addressText}>{address}</Text>
          </View>
        </View>

        {/* Total */}
        <View style={styles.totalRow}>
          <View>
            <Text variant="caption" style={styles.totalLabel}>TOTAL:</Text>
            <Text variant="h2" style={styles.totalPrice}>UGX {total}</Text>
          </View>
          <Pressable hitSlop={8} onPress={() => Alert.alert('Price Breakdown', `Subtotal: UGX ${subtotal}\nDelivery Fee: Free\n\nTotal: UGX ${total}`)}>
            <Text variant="bodySmall" style={styles.breakdownLink}>
              Breakdown &gt;
            </Text>
          </Pressable>
        </View>

        {/* Place order button */}
        <Pressable style={styles.placeOrderBtn} onPress={handlePlaceOrder}>
          <Text variant="body" style={styles.placeOrderText}>PLACE ORDER</Text>
        </Pressable>
      </View>

      {/* Address edit modal */}
      <Modal visible={showAddressModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.addressModal, { backgroundColor: c.background }]}>
            <Text variant="h3" style={{ color: c.text, marginBottom: spacing.md }}>Edit Address</Text>
            <TextInput
              style={[styles.addressInput, { backgroundColor: c.backgroundSecondary, borderColor: c.border, color: c.text }]}
              value={editAddress}
              onChangeText={setEditAddress}
              placeholder="Enter your delivery address"
              placeholderTextColor={c.textMuted}
              autoFocus
            />
            <View style={styles.addressModalActions}>
              <Pressable style={[styles.addressModalBtn, { borderColor: c.border }]} onPress={() => setShowAddressModal(false)}>
                <Text variant="body" style={{ color: c.text }}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.addressModalBtn, { backgroundColor: c.primary }]} onPress={() => {
                if (editAddress.trim()) setAddress(editAddress.trim());
                setShowAddressModal(false);
              }}>
                <Text variant="body" style={{ color: '#FFF', fontWeight: '700' }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.splashDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.textInverse,
    fontSize: 18,
    fontWeight: '700',
  },
  editText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.3,
  },
  cartArea: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  itemsList: {
    flex: 1,
  },
  cartItem: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: radius.lg,
  },
  itemInfo: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    color: colors.textInverse,
    fontWeight: '600',
    fontSize: 15,
    flex: 1,
    marginRight: spacing.sm,
  },
  itemPrice: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 18,
    marginTop: 2,
  },
  itemControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  sizeLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 15,
  },
  bottomSection: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.lg,
  },
  addressSection: {
    gap: spacing.sm,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  editLink: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.base,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addressText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  totalPrice: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  breakdownLink: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  placeOrderBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.base,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  placeOrderText: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  addressModal: {
    width: '100%',
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
  },
  addressInput: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    fontSize: 15,
  },
  addressModalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  addressModalBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    alignItems: 'center',
    borderWidth: 1.5,
  },
});
