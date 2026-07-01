import { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, Pressable, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { useCartStore } from '@/store';
import { useLocationStore } from '@/store/locationStore';
import { useTheme } from '@/providers/ThemeProvider';
import { spacing, radius } from '@/theme';
import { formatCurrency } from '@/utils/format';

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, getSubtotal, updateQuantity, removeItem } = useCartStore();
  const c = useTheme();

  // Pull addresses from the location store (already loaded on app start)
  const savedAddresses = useLocationStore((s) => s.savedAddresses);
  const selectedAddressId = useLocationStore((s) => s.selectedAddressId);
  const selectAddress = useLocationStore((s) => s.selectAddress);

  // Find the currently selected address object
  const selectedAddress = savedAddresses.find((a) => a.id === selectedAddressId)
    || savedAddresses[0]
    || null;

  const [showPicker, setShowPicker] = useState(false);
  const [pickedId, setPickedId] = useState(selectedAddress?.id || null);

  // Resolve the address we're delivering to
  const activeAddress = savedAddresses.find((a) => a.id === pickedId) || selectedAddress;
  const addressText = activeAddress
    ? [activeAddress.label, activeAddress.street || activeAddress.address_line, activeAddress.city]
        .filter(Boolean).join(' · ')
    : 'No address saved — go to Profile → Addresses';

  const subtotal = getSubtotal();
  const deliveryFee = activeAddress ? (subtotal > 30000 ? 0 : 2000) : 0;
  const total = subtotal + deliveryFee;

  const handlePickAddress = async (addr) => {
    setPickedId(addr.id);
    setShowPicker(false);
    // Persist the selection
    try { await selectAddress(addr.id); } catch {}
  };

  const handlePlaceOrder = () => {
    if (!activeAddress) {
      Alert.alert('No Address', 'Please add a delivery address first in Profile → Addresses.');
      return;
    }
    // Pass address string to payment screen via navigation state
    router.push({
      pathname: '/checkout/payment',
      params: { deliveryAddress: addressText, deliveryFee: deliveryFee.toString() },
    });
  };

  return (
    <View       style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: c.backgroundSecondary }]}>
          <Ionicons name="arrow-back" size={22} color={c.text} />
        </Pressable>
        <Text variant="h3" style={[styles.headerTitle, { color: c.text }]}>Cart</Text>
        <Pressable hitSlop={8} onPress={() => router.back()}>
          <Text variant="bodySmall" style={[styles.editText, { color: c.primary }]}>EDIT ITEMS</Text>
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
                  <Text variant="body" style={[styles.itemName, { color: c.textInverse }]} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Pressable onPress={() => removeItem(item.id)} hitSlop={8}>
                    <Ionicons name="close-circle" size={22} color={c.primary} />
                  </Pressable>
                </View>
                <Text variant="h3" style={[styles.itemPrice, { color: c.primary }]}>
                  {formatCurrency(item.price * item.quantity)}
                </Text>
                <View style={styles.itemControls}>
                  <Text variant="caption" style={styles.sizeLabel}>x{item.quantity}</Text>
                  <View style={styles.qtyControls}>
                    <Pressable
                      style={styles.qtyBtn}
                      onPress={() =>
                        item.quantity > 1
                          ? updateQuantity(item.id, item.quantity - 1)
                          : removeItem(item.id)
                      }
                    >
                      <Ionicons name="remove" size={14} color={c.textInverse} />
                    </Pressable>
                    <Text variant="body" style={[styles.qtyText, { color: c.textInverse }]}>{item.quantity}</Text>
                    <Pressable
                      style={styles.qtyBtn}
                      onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Ionicons name="add" size={14} color={c.textInverse} />
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* White bottom section */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + spacing.xl, backgroundColor: c.background }]}>

        {/* Delivery address picker */}
        <View style={styles.addressSection}>
          <View style={styles.addressHeader}>
            <Text variant="label" style={[styles.addressLabel, { color: c.textMuted }]}>DELIVERY ADDRESS</Text>
            {savedAddresses.length > 1 && (
              <Pressable hitSlop={8} onPress={() => setShowPicker(true)}>
                <Text variant="bodySmall" style={[styles.editLink, { color: c.primary }]}>CHANGE</Text>
              </Pressable>
            )}
            {savedAddresses.length === 0 && (
              <Pressable hitSlop={8} onPress={() => router.push('/profile/address')}>
                <Text variant="bodySmall" style={[styles.editLink, { color: c.primary }]}>ADD</Text>
              </Pressable>
            )}
          </View>

          <Pressable
            style={[styles.addressBox, { backgroundColor: c.backgroundSecondary, borderColor: activeAddress ? c.primary : c.border }]}
            onPress={() => savedAddresses.length > 0 ? setShowPicker(true) : router.push('/profile/address')}
          >
            <Ionicons
              name={activeAddress ? (activeAddress.icon || 'location') : 'location-outline'}
              size={20}
              color={activeAddress ? c.primary : c.textMuted}
            />
            <View style={{ flex: 1 }}>
              {activeAddress && (
                <Text variant="caption" style={[styles.addressLabelTag, { color: c.primary }]}>
                  {activeAddress.label?.toUpperCase()}
                </Text>
              )}
              <Text variant="body" style={[styles.addressText, { color: activeAddress ? c.text : c.textMuted }]} numberOfLines={2}>
                {addressText}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={18} color={c.textMuted} />
          </Pressable>
        </View>

        {/* Totals */}
        <View style={[styles.totalsCard, { backgroundColor: c.backgroundSecondary }]}>
          <View style={styles.totalRow}>
            <Text variant="body" style={{ color: c.textSecondary }}>Subtotal</Text>
            <Text variant="body" style={{ color: c.text, fontWeight: '600' }}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text variant="body" style={{ color: c.textSecondary }}>Delivery Fee</Text>
            <Text variant="body" style={{ color: deliveryFee === 0 ? '#27AE60' : c.text, fontWeight: '600' }}>
              {deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}
            </Text>
          </View>
          <View style={[styles.totalRow, styles.totalRowFinal, { borderTopColor: c.borderLight }]}>
            <Text variant="h3" style={{ color: c.text, fontWeight: '800' }}>TOTAL</Text>
            <Text variant="h3" style={{ color: c.primary, fontWeight: '800' }}>{formatCurrency(total)}</Text>
          </View>
        </View>

        {/* Place order button */}
        <Pressable style={[styles.placeOrderBtn, { backgroundColor: c.primary }]} onPress={handlePlaceOrder}>
          <Text variant="body" style={[styles.placeOrderText, { color: c.textInverse }]}>PROCEED TO PAYMENT</Text>
        </Pressable>
      </View>

      {/* Address picker modal */}
      <Modal visible={showPicker} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowPicker(false)}>
          <View style={[styles.pickerSheet, { backgroundColor: c.background }]}>
            <View style={styles.sheetHandle} />
            <Text variant="h3" style={[styles.sheetTitle, { color: c.text }]}>Select Delivery Address</Text>

            {savedAddresses.map((addr) => {
              const isActive = addr.id === pickedId || (!pickedId && addr.isSelected);
              const line = [addr.street || addr.address_line, addr.city].filter(Boolean).join(', ');
              return (
                <Pressable
                  key={addr.id}
                  style={[
                    styles.addrOption,
                    { borderColor: isActive ? c.primary : c.borderLight, backgroundColor: isActive ? c.primaryLight : c.backgroundSecondary },
                  ]}
                  onPress={() => handlePickAddress(addr)}
                >
                  <View style={[styles.addrIconWrap, { backgroundColor: isActive ? c.primary : c.backgroundSecondary }]}>
                    <Ionicons
                      name={addr.icon || 'location-outline'}
                      size={20}
                      color={isActive ? '#FFF' : c.textMuted}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="body" style={[styles.addrLabel, { color: c.text }]}>{addr.label}</Text>
                    {line ? (
                      <Text variant="caption" style={{ color: c.textMuted }} numberOfLines={1}>{line}</Text>
                    ) : null}
                  </View>
                  {isActive && <Ionicons name="checkmark-circle" size={22} color={c.primary} />}
                </Pressable>
              );
            })}

            <Pressable
              style={[styles.addNewAddrBtn, { borderColor: c.primary }]}
              onPress={() => { setShowPicker(false); router.push('/profile/address'); }}
            >
              <Ionicons name="add-circle-outline" size={20} color={c.primary} />
              <Text variant="body" style={[styles.addNewAddrText, { color: c.primary }]}>Add New Address</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingBottom: spacing.md,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  editText: { fontWeight: '700', fontSize: 13, letterSpacing: 0.3 },
  cartArea: { flex: 1, paddingHorizontal: spacing.xl },
  itemsList: { flex: 1 },
  cartItem: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  itemImage: { width: 70, height: 70, borderRadius: radius.lg },
  itemInfo: { flex: 1 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemName: { fontWeight: '600', fontSize: 15, flex: 1, marginRight: spacing.sm },
  itemPrice: { fontWeight: '700', fontSize: 17, marginTop: 2 },
  itemControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xs },
  sizeLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  qtyBtn: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  qtyText: { fontWeight: '700', fontSize: 15 },

  bottomSection: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: spacing.xl, paddingTop: spacing.xl,
    gap: spacing.md,
  },

  // Address
  addressSection: { gap: spacing.sm },
  addressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addressLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  editLink: { fontWeight: '700', fontSize: 13 },
  addressBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    padding: spacing.base, borderRadius: radius.md, borderWidth: 1.5,
  },
  addressLabelTag: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 2 },
  addressText: { fontSize: 14 },

  // Totals
  totalsCard: { borderRadius: radius.md, padding: spacing.base, gap: spacing.sm },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalRowFinal: { borderTopWidth: 1, paddingTop: spacing.sm, marginTop: spacing.xs },

  placeOrderBtn: {
    paddingVertical: spacing.base + 2, borderRadius: radius.full, alignItems: 'center',
  },
  placeOrderText: { fontWeight: '700', fontSize: 16, letterSpacing: 0.5 },

  // Modal picker (bottom sheet style)
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: spacing.xl, paddingBottom: spacing.xl + 16,
    gap: spacing.md,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: spacing.sm,
  },
  sheetTitle: { fontWeight: '700', fontSize: 18, marginBottom: spacing.sm },
  addrOption: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    borderRadius: radius.md, padding: spacing.base, borderWidth: 1.5,
  },
  addrIconWrap: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  addrLabel: { fontWeight: '700', fontSize: 15 },
  addNewAddrBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    paddingVertical: spacing.md, borderRadius: radius.md,
    borderWidth: 1.5, borderStyle: 'dashed', marginTop: spacing.xs,
  },
  addNewAddrText: { fontWeight: '700', fontSize: 14 },
});
