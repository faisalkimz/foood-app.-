import { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../src/components/ui';
import { useCartStore } from '../../src/store';
import { useTheme } from '../../src/providers/ThemeProvider';
import { colors, spacing, radius } from '../../src/theme';

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
  const c = useTheme();

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

  const handlePayConfirm = () => {
    if (selected === 'card' && !showAddCard) {
      // Use saved card — proceed
    } else if (selected === 'card' && showAddCard) {
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

    clearCart();
    // Replace entire stack so user can't go back to payment/checkout
    router.replace('/checkout/congratulations');
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text variant="h3">Payment</Text>
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
              style={[styles.methodCard, selected === method.id && styles.methodCardActive]}
              onPress={() => {
                setSelected(method.id);
                setShowAddCard(false);
              }}
            >
              <View style={[
                styles.methodIconWrap,
                selected === method.id && styles.methodIconWrapActive,
              ]}>
                <Ionicons
                  name={method.icon}
                  size={24}
                  color={selected === method.id ? colors.textInverse : colors.textMuted}
                />
              </View>
              <Text
                variant="caption"
                style={[styles.methodLabel, selected === method.id && styles.methodLabelActive]}
              >
                {method.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ========== CASH ========== */}
        {selected === 'cash' && (
          <View style={styles.infoCard}>
            <View style={styles.cashIconWrap}>
              <Ionicons name="cash" size={36} color="#27AE60" />
            </View>
            <Text variant="h3" style={styles.infoTitle}>Cash on Delivery</Text>
            <Text variant="bodySmall" style={styles.infoText}>
              Pay with cash when your order arrives at your doorstep. Please have the exact amount ready for the rider.
            </Text>
          </View>
        )}

        {/* ========== CARD (Visa/Mastercard/Amex auto-detected) ========== */}
        {selected === 'card' && !showAddCard && (
          <>
            {/* Saved card visual */}
            <View style={styles.cardVisual}>
              <View style={styles.cardRow1}>
                <Ionicons name="card" size={24} color={colors.textInverse} />
                <Text variant="bodySmall" style={styles.cardBrand}>Visa</Text>
              </View>
              <Text variant="body" style={styles.cardNumberDisplay}>
                •••• •••• •••• 4 3 6
              </Text>
              <View style={styles.cardRow3}>
                <View>
                  <Text variant="caption" style={styles.cardSmallLabel}>CARD HOLDER</Text>
                  <Text variant="bodySmall" style={styles.cardSmallValue}>Vishal Khadok</Text>
                </View>
                <View>
                  <Text variant="caption" style={styles.cardSmallLabel}>EXPIRES</Text>
                  <Text variant="bodySmall" style={styles.cardSmallValue}>09/28</Text>
                </View>
              </View>
            </View>
            <Pressable style={styles.addNewBtn} onPress={() => setShowAddCard(true)}>
              <Ionicons name="add" size={20} color={colors.primary} />
              <Text variant="body" style={styles.addNewText}>ADD NEW CARD</Text>
            </Pressable>
          </>
        )}

        {selected === 'card' && showAddCard && (
          <View style={styles.cardForm}>
            <View style={styles.cardFormHeader}>
              <Text variant="h3">Add Card</Text>
              <Pressable onPress={() => setShowAddCard(false)} hitSlop={8}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.fieldGroup}>
              <Text variant="label" style={styles.fieldLabel}>CARD HOLDER NAME</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="John Doe"
                value={cardName}
                onChangeText={setCardName}
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.cardNumberHeader}>
                <Text variant="label" style={styles.fieldLabel}>CARD NUMBER</Text>
                {detectedNetwork && (
                  <View style={styles.networkBadge}>
                    <Text variant="caption" style={styles.networkText}>{detectedNetwork}</Text>
                  </View>
                )}
              </View>
              <TextInput
                style={styles.fieldInput}
                placeholder="0000 0000 0000 0000"
                value={cardNumber}
                onChangeText={(t) => setCardNumber(formatCardNumber(t))}
                keyboardType="number-pad"
                placeholderTextColor={colors.textMuted}
                maxLength={19}
              />
            </View>

            <View style={styles.fieldRow}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text variant="label" style={styles.fieldLabel}>EXPIRE DATE</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="MM/YY"
                  value={expiry}
                  onChangeText={setExpiry}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text variant="label" style={styles.fieldLabel}>CVC</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="•••"
                  value={cvc}
                  onChangeText={setCvc}
                  keyboardType="number-pad"
                  secureTextEntry
                  placeholderTextColor={colors.textMuted}
                  maxLength={4}
                />
              </View>
            </View>

            <Pressable
              style={styles.addCardSubmit}
              onPress={() => {
                if (!cardName || !cardNumber || !expiry || !cvc) {
                  Alert.alert('Missing Info', 'Please fill in all card details');
                  return;
                }
                Alert.alert('✅ Card Saved', `${detectedNetwork || 'Card'} ending in ${cardNumber.slice(-4)} has been added.`);
                setShowAddCard(false);
              }}
            >
              <Text variant="body" style={styles.addCardSubmitText}>ADD & MAKE PAYMENT</Text>
            </Pressable>
          </View>
        )}

        {/* ========== MOBILE MONEY ========== */}
        {selected === 'mobile' && (
          <View style={styles.mobileCard}>
            {/* Provider picker */}
            <Text variant="label" style={[styles.fieldLabel, { marginBottom: spacing.sm }]}>
              SELECT PROVIDER
            </Text>
            <View style={styles.providerRow}>
              {MOBILE_PROVIDERS.map((p) => (
                <Pressable
                  key={p.id}
                  style={[
                    styles.providerBtn,
                    mobileProvider === p.id && { backgroundColor: p.color, borderColor: p.color },
                  ]}
                  onPress={() => setMobileProvider(p.id)}
                >
                  <Ionicons
                    name="phone-portrait"
                    size={20}
                    color={mobileProvider === p.id ? p.textColor : colors.textMuted}
                  />
                  <Text
                    variant="bodySmall"
                    style={[
                      styles.providerLabel,
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
              <Text variant="label" style={styles.fieldLabel}>PHONE NUMBER</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder={`${MOBILE_PROVIDERS.find((p) => p.id === mobileProvider).prefix} 000 000`}
                value={mobileNumber}
                onChangeText={setMobileNumber}
                keyboardType="phone-pad"
                placeholderTextColor={colors.textMuted}
                maxLength={13}
              />
            </View>
            <View style={styles.mmInfoRow}>
              <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
              <Text variant="caption" style={styles.mmInfoText}>
                A prompt will be sent to your phone to authorize the payment of UGX {(total * 3700).toLocaleString()}.
              </Text>
            </View>
          </View>
        )}

        {/* Total */}
        <View style={styles.totalSection}>
          <Text variant="caption" style={styles.totalLabel}>TOTAL:</Text>
          <Text variant="h1" style={styles.totalPrice}>${total}</Text>
        </View>
      </ScrollView>

      {/* Bottom button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.base }]}>
        <Pressable style={styles.payBtn} onPress={handlePayConfirm}>
          <Text variant="body" style={styles.payBtnText}>
            {selected === 'cash' ? 'CONFIRM ORDER' : 'PAY & CONFIRM'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingBottom: spacing.md,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.backgroundSecondary,
    alignItems: 'center', justifyContent: 'center',
  },
  content: { paddingHorizontal: spacing.xl, gap: spacing.xl },

  // Method tabs
  methodsRow: { flexDirection: 'row', gap: spacing.md },
  methodCard: {
    flex: 1, alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md,
    borderRadius: radius.lg, backgroundColor: colors.backgroundSecondary,
    borderWidth: 2, borderColor: 'transparent',
  },
  methodCardActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  methodIconWrap: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  methodIconWrapActive: { backgroundColor: colors.primary },
  methodLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },
  methodLabelActive: { color: colors.primary, fontWeight: '700' },

  // Cash
  infoCard: {
    alignItems: 'center', padding: spacing.xl, borderRadius: radius.lg,
    backgroundColor: colors.backgroundSecondary, gap: spacing.md,
  },
  cashIconWrap: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#DCFCE7',
    alignItems: 'center', justifyContent: 'center',
  },
  infoTitle: { fontWeight: '700', fontSize: 18 },
  infoText: { color: colors.textSecondary, textAlign: 'center', lineHeight: 22, fontSize: 14 },

  // Card visual
  cardVisual: {
    backgroundColor: colors.splashDark, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.lg,
  },
  cardRow1: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardBrand: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  cardNumberDisplay: {
    color: colors.textInverse, fontSize: 20, fontWeight: '600', letterSpacing: 2,
  },
  cardRow3: { flexDirection: 'row', justifyContent: 'space-between' },
  cardSmallLabel: { color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: 0.5, marginBottom: 2 },
  cardSmallValue: { color: colors.textInverse, fontWeight: '500', fontSize: 14 },
  addNewBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    paddingVertical: spacing.md, borderRadius: radius.md, borderWidth: 1.5,
    borderColor: colors.primary, borderStyle: 'dashed',
  },
  addNewText: { color: colors.primary, fontWeight: '700', fontSize: 14 },

  // Card form
  cardForm: {
    borderRadius: radius.lg, backgroundColor: colors.backgroundSecondary, padding: spacing.xl, gap: spacing.lg,
  },
  cardFormHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fieldGroup: { gap: spacing.xs },
  fieldLabel: {
    fontSize: 12, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.5, textTransform: 'uppercase',
  },
  fieldInput: {
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.base,
    fontSize: 16, color: colors.text,
  },
  fieldRow: { flexDirection: 'row', gap: spacing.md },
  cardNumberHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  networkBadge: {
    backgroundColor: colors.primaryLight, paddingHorizontal: spacing.sm, paddingVertical: 2,
    borderRadius: radius.full,
  },
  networkText: { color: colors.primary, fontWeight: '700', fontSize: 11 },
  addCardSubmit: {
    backgroundColor: colors.primary, paddingVertical: spacing.base, borderRadius: radius.md, alignItems: 'center',
  },
  addCardSubmitText: { color: colors.textInverse, fontWeight: '700', fontSize: 15 },

  // Mobile Money
  mobileCard: {
    borderRadius: radius.lg, backgroundColor: colors.backgroundSecondary, padding: spacing.xl, gap: spacing.lg,
  },
  providerRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm },
  providerBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    paddingVertical: spacing.md, borderRadius: radius.md, borderWidth: 2,
    borderColor: colors.border, backgroundColor: colors.background,
  },
  providerLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  providerBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.base, paddingHorizontal: spacing.xl, borderRadius: radius.md,
  },
  mmInfoRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs,
  },
  mmInfoText: { color: colors.textMuted, fontSize: 12, flex: 1, lineHeight: 18 },

  // Total
  totalSection: { alignItems: 'flex-start' },
  totalLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
  totalPrice: { fontSize: 32, fontWeight: '800', color: colors.text },

  // Bottom
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: spacing.xl, paddingTop: spacing.base, backgroundColor: colors.background,
  },
  payBtn: {
    backgroundColor: colors.primary, paddingVertical: spacing.base,
    borderRadius: radius.full, alignItems: 'center',
  },
  payBtnText: { color: colors.textInverse, fontWeight: '700', fontSize: 16, letterSpacing: 0.5 },
});
