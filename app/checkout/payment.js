import { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../src/components/ui';
import { useCartStore } from '../../src/store';
import { colors, spacing, radius } from '../../src/theme';

const paymentMethods = [
  { id: 'cash', label: 'Cash', icon: 'cash-outline', color: '#27AE60' },
  { id: 'visa', label: 'Visa', icon: 'card-outline', color: '#1A1F71' },
  { id: 'mastercard', label: 'Master', icon: 'card', color: '#EB001B' },
  { id: 'paypal', label: 'PayPal', icon: 'logo-paypal', color: '#003087' },
  { id: 'mtn', label: 'MTN MoMo', icon: 'phone-portrait-outline', color: '#FFCC00' },
  { id: 'airtel', label: 'Airtel', icon: 'phone-portrait-outline', color: '#ED1C24' },
];

export default function PaymentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const [selected, setSelected] = useState('mtn');
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  const total = getSubtotal();
  const isMobile = selected === 'mtn' || selected === 'airtel';
  const isCard = selected === 'visa' || selected === 'mastercard';

  const handlePayConfirm = () => {
    if (isMobile && !mobileNumber) {
      Alert.alert('Phone Required', 'Please enter your mobile money number');
      return;
    }
    clearCart();
    router.replace('/checkout/congratulations');
  };

  return (
    <View style={styles.container}>
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
      >
        {/* Payment method selector — scrollable row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.methodsRow}>
            {paymentMethods.map((method) => (
              <Pressable
                key={method.id}
                style={[
                  styles.methodCard,
                  selected === method.id && styles.methodCardActive,
                ]}
                onPress={() => {
                  setSelected(method.id);
                  setShowAddCard(false);
                }}
              >
                <View style={[
                  styles.methodIconWrap,
                  { backgroundColor: selected === method.id ? method.color : colors.backgroundSecondary },
                ]}>
                  <Ionicons
                    name={method.icon}
                    size={22}
                    color={selected === method.id ? '#FFF' : colors.textMuted}
                  />
                </View>
                <Text
                  variant="caption"
                  style={[
                    styles.methodLabel,
                    selected === method.id && styles.methodLabelActive,
                  ]}
                >
                  {method.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Cash option */}
        {selected === 'cash' && (
          <View style={styles.infoCard}>
            <Ionicons name="cash" size={40} color="#27AE60" />
            <Text variant="h3" style={styles.infoTitle}>Cash on Delivery</Text>
            <Text variant="bodySmall" style={styles.infoText}>
              Pay with cash when your order arrives.{'\n'}Please have exact change ready.
            </Text>
          </View>
        )}

        {/* Card options (Visa, Mastercard) */}
        {isCard && !showAddCard && (
          <>
            <View style={styles.cardVisual}>
              <View style={styles.cardHeader}>
                <Ionicons name="card" size={24} color={colors.textInverse} />
                <Text variant="bodySmall" style={styles.cardType}>
                  {selected === 'visa' ? 'Visa' : 'Master Card'}
                </Text>
              </View>
              <Text variant="body" style={styles.cardNumber}>•••• •••• •••• 436</Text>
              <View style={styles.cardFooter}>
                <View>
                  <Text variant="caption" style={styles.cardLabel}>CARD HOLDER</Text>
                  <Text variant="bodySmall" style={styles.cardValue}>Vishal Khadok</Text>
                </View>
                <View>
                  <Text variant="caption" style={styles.cardLabel}>EXPIRES</Text>
                  <Text variant="bodySmall" style={styles.cardValue}>09/28</Text>
                </View>
              </View>
            </View>

            <Pressable style={styles.addCardBtn} onPress={() => setShowAddCard(true)}>
              <Ionicons name="add" size={20} color={colors.primary} />
              <Text variant="body" style={styles.addCardText}>ADD NEW</Text>
            </Pressable>
          </>
        )}

        {/* Add Card Form */}
        {isCard && showAddCard && (
          <View style={styles.addCardForm}>
            <View style={styles.formHeader}>
              <Text variant="h3">Add Card</Text>
              <Pressable onPress={() => setShowAddCard(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>
            <View style={styles.inputGroup}>
              <Text variant="label" style={styles.inputLabel}>CARD HOLDER NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="Vishal Khadok"
                value={cardName}
                onChangeText={setCardName}
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text variant="label" style={styles.inputLabel}>CARD NUMBER</Text>
              <TextInput
                style={styles.input}
                placeholder="2134 •••• •••• ••••"
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="number-pad"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text variant="label" style={styles.inputLabel}>EXPIRE DATE</Text>
                <TextInput
                  style={styles.input}
                  placeholder="mm/yyyy"
                  value={expiry}
                  onChangeText={setExpiry}
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text variant="label" style={styles.inputLabel}>CVC</Text>
                <TextInput
                  style={styles.input}
                  placeholder="•••"
                  value={cvc}
                  onChangeText={setCvc}
                  keyboardType="number-pad"
                  secureTextEntry
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
            <Pressable
              style={styles.addCardSubmitBtn}
              onPress={() => {
                Alert.alert('✅ Card Added', 'Your card has been saved successfully');
                setShowAddCard(false);
              }}
            >
              <Text variant="body" style={styles.addCardSubmitText}>ADD & MAKE PAYMENT</Text>
            </Pressable>
          </View>
        )}

        {/* PayPal */}
        {selected === 'paypal' && (
          <View style={styles.infoCard}>
            <Ionicons name="logo-paypal" size={40} color="#003087" />
            <Text variant="h3" style={styles.infoTitle}>PayPal</Text>
            <Text variant="bodySmall" style={styles.infoText}>
              You will be redirected to PayPal{'\n'}to complete your payment securely.
            </Text>
          </View>
        )}

        {/* Mobile Money (MTN / Airtel) */}
        {isMobile && (
          <View style={styles.mobileMoneyCard}>
            <View style={[
              styles.mmBrandBanner,
              { backgroundColor: selected === 'mtn' ? '#FFCC00' : '#ED1C24' },
            ]}>
              <Ionicons
                name="phone-portrait"
                size={32}
                color={selected === 'mtn' ? '#1A1A1A' : '#FFF'}
              />
              <Text variant="h3" style={[
                styles.mmBrandText,
                { color: selected === 'mtn' ? '#1A1A1A' : '#FFF' },
              ]}>
                {selected === 'mtn' ? 'MTN Mobile Money' : 'Airtel Money'}
              </Text>
            </View>
            <View style={styles.mmInputWrap}>
              <Text variant="label" style={styles.inputLabel}>PHONE NUMBER</Text>
              <TextInput
                style={styles.input}
                placeholder={selected === 'mtn' ? '0770 000 000' : '0750 000 000'}
                value={mobileNumber}
                onChangeText={setMobileNumber}
                keyboardType="phone-pad"
                placeholderTextColor={colors.textMuted}
              />
              <Text variant="caption" style={styles.mmHint}>
                A prompt will be sent to your phone to authorize the payment.
              </Text>
            </View>
          </View>
        )}

        {/* Total */}
        <View style={styles.totalRow}>
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
  methodsRow: { flexDirection: 'row', gap: spacing.sm, paddingRight: spacing.xl },
  methodCard: {
    alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md, borderRadius: radius.md,
    backgroundColor: colors.backgroundSecondary, borderWidth: 1.5, borderColor: 'transparent',
    width: 72,
  },
  methodCardActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  methodIconWrap: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
  },
  methodLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '500', textAlign: 'center' },
  methodLabelActive: { color: colors.primary, fontWeight: '700' },
  infoCard: {
    alignItems: 'center', padding: spacing.xl, borderRadius: radius.lg,
    backgroundColor: colors.backgroundSecondary, gap: spacing.md,
  },
  infoTitle: { fontWeight: '700' },
  infoText: { color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  cardVisual: {
    backgroundColor: colors.splashDark, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.lg,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardType: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  cardNumber: { color: colors.textInverse, fontSize: 20, fontWeight: '600', letterSpacing: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  cardLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, letterSpacing: 0.5, marginBottom: 2 },
  cardValue: { color: colors.textInverse, fontWeight: '500' },
  addCardBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    paddingVertical: spacing.md, borderRadius: radius.md, borderWidth: 1.5,
    borderColor: colors.primary, borderStyle: 'dashed',
  },
  addCardText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  addCardForm: {
    borderRadius: radius.lg, backgroundColor: colors.backgroundSecondary,
    padding: spacing.xl, gap: spacing.lg,
  },
  formHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  inputGroup: { gap: spacing.xs },
  inputLabel: {
    fontSize: 12, fontWeight: '700', color: colors.textMuted,
    letterSpacing: 0.5, textTransform: 'uppercase',
  },
  input: {
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.base,
    fontSize: 15, color: colors.text,
  },
  inputRow: { flexDirection: 'row', gap: spacing.md },
  addCardSubmitBtn: {
    backgroundColor: colors.primary, paddingVertical: spacing.base,
    borderRadius: radius.md, alignItems: 'center',
  },
  addCardSubmitText: { color: colors.textInverse, fontWeight: '700', fontSize: 14 },
  mobileMoneyCard: {
    borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.backgroundSecondary,
  },
  mmBrandBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.lg, paddingHorizontal: spacing.xl,
  },
  mmBrandText: { fontWeight: '800', fontSize: 18 },
  mmInputWrap: { padding: spacing.xl, gap: spacing.sm },
  mmHint: { color: colors.textMuted, fontSize: 12, marginTop: spacing.xs },
  totalRow: { alignItems: 'flex-start' },
  totalLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
  totalPrice: { fontSize: 32, fontWeight: '800', color: colors.text },
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
