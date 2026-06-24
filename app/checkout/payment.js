import { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Alert, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, showToast } from '../../src/components/ui';
import { useCartStore, useAuthStore } from '../../src/store';
import { useTheme } from '../../src/providers/ThemeProvider';
import { placeOrder } from '../../src/services/orderService';
import { spacing, radius } from '../../src/theme';

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash', icon: 'cash-outline' },
  { id: 'card', label: 'Card', icon: 'card-outline' },
  { id: 'mobile', label: 'Mobile Money', icon: 'phone-portrait-outline' },
];

const MOBILE_PROVIDERS = [
  { id: 'mtn', label: 'MTN MoMo', color: '#FFCC00', textColor: '#1A1A1A', prefix: '0770' },
  { id: 'airtel', label: 'Airtel Money', color: '#ED1C24', textColor: '#FFF', prefix: '0750' },
];

// Auto-detect card network from number
function getCardNetwork(number) {
  const clean = number.replace(/\s/g, '');
  if (clean.startsWith('4')) return 'Visa';
  if (clean.startsWith('5') || clean.startsWith('2')) return 'Mastercard';
  if (clean.startsWith('3')) return 'Amex';
  return null;
}

function formatCardNumber(text) {
  const clean = text.replace(/\D/g, '').slice(0, 16);
  return clean.replace(/(.{4})/g, '$1 ').trim();
}

export default function PaymentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const user = useAuthStore((s) => s.user);
  const c = useTheme();
  const userName = user?.full_name || user?.name || 'Card Holder';

  const [selected, setSelected] = useState('cash');
  const [showAddCard, setShowAddCard] = useState(false);

  // Card fields
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  // Mobile Money fields
  const [mobileProvider, setMobileProvider] = useState('mtn');
  const [mobileNumber, setMobileNumber] = useState('');

  const total = getSubtotal();
  const detectedNetwork = getCardNetwork(cardNumber);
  const [isPlacing, setIsPlacing] = useState(false);

  const handlePayConfirm = async () => {
    if (selected === 'card' && showAddCard) {
      if (!cardName || !cardNumber || !expiry || !cvc) {
        Alert.alert('Missing Info', 'Please fill in all card details');
        return;
      }
    } else if (selected === 'mobile') {
      if (!mobileNumber || mobileNumber.length < 10) {
        Alert.alert('Phone Required', 'Please enter a valid mobile money number');
        return;
      }
    }

    const items = useCartStore.getState().items;
    const restaurantId = useCartStore.getState().restaurantId;
    if (!items.length) {
      Alert.alert('Empty Cart', 'Add items before placing an order.');
      return;
    }

    setIsPlacing(true);
    try {
      const orderId = await placeOrder({
        restaurantId,
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          image: i.image,
          price: i.price,
          quantity: i.quantity,
        })),
        deliveryAddress: null,
        notes: '',
        deliveryFee: 0,
        paymentMethod: selected === 'mobile' ? 'mobile_money' : selected,
      });
      clearCart();
      router.replace(`/checkout/congratulations?orderId=${orderId}`);
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to place order' });
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: c.backgroundSecondary }]}>
          <Ionicons name="arrow-back" size={22} color={c.text} />
        </Pressable>
        <Text variant="h3" style={{ color: c.text }}>Payment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 3 Payment method tabs */}
        <View style={styles.methodsRow}>
          {PAYMENT_METHODS.map((method) => (
            <Pressable
              key={method.id}
              style={[
                styles.methodCard,
                { backgroundColor: c.backgroundSecondary, borderColor: 'transparent' },
                selected === method.id && { borderColor: c.primary, backgroundColor: c.primaryLight },
              ]}
              onPress={() => {
                setSelected(method.id);
                setShowAddCard(false);
              }}
            >
              <View style={[
                styles.methodIconWrap,
                { backgroundColor: c.background },
                selected === method.id && { backgroundColor: c.primary },
              ]}>
                <Ionicons
                  name={method.icon}
                  size={24}
                  color={selected === method.id ? c.textInverse : c.textMuted}
                />
              </View>
              <Text
                variant="caption"
                style={[
                  styles.methodLabel, { color: c.textMuted },
                  selected === method.id && { color: c.primary, fontWeight: '700' },
                ]}
              >
                {method.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ========== CASH ========== */}
        {selected === 'cash' && (
          <View style={[styles.infoCard, { backgroundColor: c.backgroundSecondary }]}>
            <View style={styles.cashIconWrap}>
              <Ionicons name="cash" size={36} color="#27AE60" />
            </View>
            <Text variant="h3" style={[styles.infoTitle, { color: c.text }]}>Cash on Delivery</Text>
            <Text variant="bodySmall" style={[styles.infoText, { color: c.textSecondary }]}>
              Pay with cash when your order arrives at your doorstep. Please have the exact amount ready for the rider.
            </Text>
          </View>
        )}

        {/* ========== CARD (Visa/Mastercard/Amex auto-detected) ========== */}
        {selected === 'card' && !showAddCard && (
          <>
            {/* Saved card visual */}
            <View style={[styles.cardVisual, { backgroundColor: c.splashDark }]}>
              <View style={styles.cardRow1}>
                <Ionicons name="card" size={24} color={c.textInverse} />
                <Text variant="bodySmall" style={styles.cardBrand}>Visa</Text>
              </View>
              <Text variant="body" style={[styles.cardNumberDisplay, { color: c.textInverse }]}>
                •••• •••• •••• 4 3 6
              </Text>
              <View style={styles.cardRow3}>
                <View>
                  <Text variant="caption" style={styles.cardSmallLabel}>CARD HOLDER</Text>
                  <Text variant="bodySmall" style={[styles.cardSmallValue, { color: c.textInverse }]}>{userName}</Text>
                </View>
                <View>
                  <Text variant="caption" style={styles.cardSmallLabel}>EXPIRES</Text>
                  <Text variant="bodySmall" style={[styles.cardSmallValue, { color: c.textInverse }]}>09/28</Text>
                </View>
              </View>
            </View>
            <Pressable style={[styles.addNewBtn, { borderColor: c.primary }]} onPress={() => setShowAddCard(true)}>
              <Ionicons name="add" size={20} color={c.primary} />
              <Text variant="body" style={[styles.addNewText, { color: c.primary }]}>ADD NEW CARD</Text>
            </Pressable>
          </>
        )}

        {selected === 'card' && showAddCard && (
          <View style={[styles.cardForm, { backgroundColor: c.backgroundSecondary }]}>
            <View style={styles.cardFormHeader}>
              <Text variant="h3" style={{ color: c.text }}>Add Card</Text>
              <Pressable onPress={() => setShowAddCard(false)} hitSlop={8}>
                <Ionicons name="close" size={24} color={c.text} />
              </Pressable>
            </View>

            <View style={styles.fieldGroup}>
              <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>CARD HOLDER NAME</Text>
              <TextInput
                style={[styles.fieldInput, { backgroundColor: c.background, borderColor: c.border, color: c.text }]}
                placeholder="John Doe"
                value={cardName}
                onChangeText={setCardName}
                placeholderTextColor={c.textMuted}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.cardNumberHeader}>
                <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>CARD NUMBER</Text>
                {detectedNetwork && (
                  <View style={[styles.networkBadge, { backgroundColor: c.primaryLight }]}>
                    <Text variant="caption" style={[styles.networkText, { color: c.primary }]}>{detectedNetwork}</Text>
                  </View>
                )}
              </View>
              <TextInput
                style={[styles.fieldInput, { backgroundColor: c.background, borderColor: c.border, color: c.text }]}
                placeholder="0000 0000 0000 0000"
                value={cardNumber}
                onChangeText={(t) => setCardNumber(formatCardNumber(t))}
                keyboardType="number-pad"
                placeholderTextColor={c.textMuted}
                maxLength={19}
              />
            </View>

            <View style={styles.fieldRow}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>EXPIRE DATE</Text>
                <TextInput
                  style={[styles.fieldInput, { backgroundColor: c.background, borderColor: c.border, color: c.text }]}
                  placeholder="MM/YY"
                  value={expiry}
                  onChangeText={setExpiry}
                  placeholderTextColor={c.textMuted}
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>CVC</Text>
                <TextInput
                  style={[styles.fieldInput, { backgroundColor: c.background, borderColor: c.border, color: c.text }]}
                  placeholder="•••"
                  value={cvc}
                  onChangeText={setCvc}
                  keyboardType="number-pad"
                  secureTextEntry
                  placeholderTextColor={c.textMuted}
                  maxLength={4}
                />
              </View>
            </View>

            <Pressable
              style={[styles.addCardSubmit, { backgroundColor: c.primary }]}
              onPress={() => {
                if (!cardName || !cardNumber || !expiry || !cvc) {
                  Alert.alert('Missing Info', 'Please fill in all card details');
                  return;
                }
                Alert.alert('✅ Card Saved', `${detectedNetwork || 'Card'} ending in ${cardNumber.slice(-4)} has been added.`);
                setShowAddCard(false);
              }}
            >
              <Text variant="body" style={[styles.addCardSubmitText, { color: c.textInverse }]}>ADD & MAKE PAYMENT</Text>
            </Pressable>
          </View>
        )}

        {/* ========== MOBILE MONEY ========== */}
        {selected === 'mobile' && (
          <View style={[styles.mobileCard, { backgroundColor: c.backgroundSecondary }]}>
            {/* Provider picker */}
            <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted, marginBottom: spacing.sm }]}>
              SELECT PROVIDER
            </Text>
            <View style={styles.providerRow}>
              {MOBILE_PROVIDERS.map((p) => (
                <Pressable
                  key={p.id}
                  style={[
                    styles.providerBtn,
                    { borderColor: c.border, backgroundColor: c.background },
                    mobileProvider === p.id && { backgroundColor: p.color, borderColor: p.color },
                  ]}
                  onPress={() => setMobileProvider(p.id)}
                >
                  <Ionicons
                    name="phone-portrait"
                    size={20}
                    color={mobileProvider === p.id ? p.textColor : c.textMuted}
                  />
                  <Text
                    variant="bodySmall"
                    style={[
                      styles.providerLabel, { color: c.textSecondary },
                      mobileProvider === p.id && { color: p.textColor, fontWeight: '800' },
                    ]}
                  >
                    {p.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Provider banner */}
            <View style={[
              styles.providerBanner,
              { backgroundColor: MOBILE_PROVIDERS.find((p) => p.id === mobileProvider).color },
            ]}>
              <Ionicons
                name="phone-portrait"
                size={28}
                color={MOBILE_PROVIDERS.find((p) => p.id === mobileProvider).textColor}
              />
              <Text variant="h3" style={{
                color: MOBILE_PROVIDERS.find((p) => p.id === mobileProvider).textColor,
                fontWeight: '800',
              }}>
                {MOBILE_PROVIDERS.find((p) => p.id === mobileProvider).label}
              </Text>
            </View>

            {/* Phone number input */}
            <View style={styles.fieldGroup}>
              <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>PHONE NUMBER</Text>
              <TextInput
                style={[styles.fieldInput, { backgroundColor: c.background, borderColor: c.border, color: c.text }]}
                placeholder={`${MOBILE_PROVIDERS.find((p) => p.id === mobileProvider).prefix} 000 000`}
                value={mobileNumber}
                onChangeText={setMobileNumber}
                keyboardType="phone-pad"
                placeholderTextColor={c.textMuted}
                maxLength={13}
              />
            </View>
            <View style={styles.mmInfoRow}>
              <Ionicons name="information-circle-outline" size={16} color={c.textMuted} />
              <Text variant="caption" style={[styles.mmInfoText, { color: c.textMuted }]}>
                A prompt will be sent to your phone to authorize the payment of UGX {(total * 3700).toLocaleString()}.
              </Text>
            </View>
          </View>
        )}

        {/* Total */}
        <View style={styles.totalSection}>
          <Text variant="caption" style={[styles.totalLabel, { color: c.textMuted }]}>TOTAL:</Text>
          <Text variant="h1" style={[styles.totalPrice, { color: c.text }]}>UGX {total}</Text>
        </View>
      </ScrollView>

      {/* Bottom button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.base, backgroundColor: c.background }]}>
        <Pressable
          style={[styles.payBtn, { backgroundColor: c.primary, opacity: isPlacing ? 0.6 : 1 }]}
          onPress={handlePayConfirm}
          disabled={isPlacing}
        >
          {isPlacing ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text variant="body" style={[styles.payBtnText, { color: c.textInverse }]}>
              {selected === 'cash' ? 'CONFIRM ORDER' : 'PAY & CONFIRM'}
            </Text>
          )}
        </Pressable>
      </View>
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
  content: { paddingHorizontal: spacing.xl, gap: spacing.xl },

  // Method tabs
  methodsRow: { flexDirection: 'row', gap: spacing.md },
  methodCard: {
    flex: 1, alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
  },
  methodIconWrap: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  methodLabel: { fontSize: 12, fontWeight: '500' },

  // Cash
  infoCard: {
    alignItems: 'center', padding: spacing.xl, borderRadius: radius.lg,
    gap: spacing.md,
  },
  cashIconWrap: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#DCFCE7',
    alignItems: 'center', justifyContent: 'center',
  },
  infoTitle: { fontWeight: '700', fontSize: 18 },
  infoText: { textAlign: 'center', lineHeight: 22, fontSize: 14 },

  // Card visual
  cardVisual: {
    borderRadius: radius.lg, padding: spacing.xl, gap: spacing.lg,
  },
  cardRow1: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardBrand: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  cardNumberDisplay: {
    fontSize: 20, fontWeight: '600', letterSpacing: 2,
  },
  cardRow3: { flexDirection: 'row', justifyContent: 'space-between' },
  cardSmallLabel: { color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: 0.5, marginBottom: 2 },
  cardSmallValue: { fontWeight: '500', fontSize: 14 },
  addNewBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    paddingVertical: spacing.md, borderRadius: radius.md, borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  addNewText: { fontWeight: '700', fontSize: 14 },

  // Card form
  cardForm: {
    borderRadius: radius.lg, padding: spacing.xl, gap: spacing.lg,
  },
  cardFormHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fieldGroup: { gap: spacing.xs },
  fieldLabel: {
    fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase',
  },
  fieldInput: {
    borderWidth: 1,
    borderRadius: radius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.base,
    fontSize: 16,
  },
  fieldRow: { flexDirection: 'row', gap: spacing.md },
  cardNumberHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  networkBadge: {
    paddingHorizontal: spacing.sm, paddingVertical: 2,
    borderRadius: radius.full,
  },
  networkText: { fontWeight: '700', fontSize: 11 },
  addCardSubmit: {
    paddingVertical: spacing.base, borderRadius: radius.md, alignItems: 'center',
  },
  addCardSubmitText: { fontWeight: '700', fontSize: 15 },

  // Mobile Money
  mobileCard: {
    borderRadius: radius.lg, padding: spacing.xl, gap: spacing.lg,
  },
  providerRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm },
  providerBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    paddingVertical: spacing.md, borderRadius: radius.md, borderWidth: 2,
  },
  providerLabel: { fontSize: 13, fontWeight: '600' },
  providerBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.base, paddingHorizontal: spacing.xl, borderRadius: radius.md,
  },
  mmInfoRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs,
  },
  mmInfoText: { fontSize: 12, flex: 1, lineHeight: 18 },

  // Total
  totalSection: { alignItems: 'flex-start' },
  totalLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
  totalPrice: { fontSize: 32, fontWeight: '800' },

  // Bottom
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: spacing.xl, paddingTop: spacing.base,
  },
  payBtn: {
    paddingVertical: spacing.base,
    borderRadius: radius.full, alignItems: 'center',
  },
  payBtnText: { fontWeight: '700', fontSize: 16, letterSpacing: 0.5 },
});
