import { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Alert, TextInput, ActivityIndicator, Linking, Modal, AppState } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useURL } from 'expo-linking';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, showToast } from '@/components/ui';
import { formatCurrency } from '@/utils/format';
import { useCartStore, useAuthStore } from '@/store';
import { useTheme } from '@/providers/ThemeProvider';
import { placeOrder } from '@/services/orderService';
import { initMobileMoney, initCardPayment, verifyPayment } from '@/services/paymentService';
import { spacing, radius } from '@/theme';

import { PAYMENT_METHODS, MOBILE_PROVIDERS } from '@/constants';

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

function luhnCheck(cardNumber) {
  const digits = cardNumber.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(digits)) return false;
  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alternate) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

function isValidExpiry(expiry) {
  const match = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;
  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10) + 2000;
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const exp = new Date(year, month);
  return exp > now;
}

export default function PaymentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { deliveryAddress, deliveryFee: deliveryFeeParam } = useLocalSearchParams();
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const user = useAuthStore((s) => s.user);
  const c = useTheme();
  const userName = user?.full_name || user?.name || 'Card Holder';
  const deliveryFee = parseInt(deliveryFeeParam || '0', 10);

  const [selected, setSelected] = useState('cash');
  const [showAddCard, setShowAddCard] = useState(false);

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const [mobileProvider, setMobileProvider] = useState('mtn');
  const [mobileNumber, setMobileNumber] = useState('');

  const total = getSubtotal() + deliveryFee;
  const detectedNetwork = getCardNetwork(cardNumber);
  const [isPlacing, setIsPlacing] = useState(false);

  const [pendingPayment, setPendingPayment] = useState(null);
  
  const url = useURL();

  // 1. Deep Link verification: if returning via custom scheme
  useEffect(() => {
    if (url && url.includes('payment-success') && pendingPayment) {
      handleVerifyPayment();
    }
  }, [url]);

  // 2. AppState verification: if user manually switches back to app
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && pendingPayment) {
        handleVerifyPayment();
      }
    });
    return () => subscription.remove();
  }, [pendingPayment]);

  const handlePayConfirm = async () => {
    if (selected === 'mobile') {
      if (!mobileNumber || mobileNumber.replace(/\D/g, '').length < 10) {
        Alert.alert('Phone Required', 'Please enter a valid 10-digit mobile money number');
        return;
      }
    }
    if (selected === 'card' && showAddCard) {
      if (!cardName || !cardNumber || !expiry || !cvc) {
        Alert.alert('Missing Info', 'Please fill in all card details');
        return;
      }
      if (!luhnCheck(cardNumber)) {
        Alert.alert('Invalid Card', 'The card number you entered is not valid. Please check and try again.');
        return;
      }
      if (!isValidExpiry(expiry)) {
        Alert.alert('Invalid Expiry', 'Please enter a valid expiry date (MM/YY) that has not passed.');
        return;
      }
      const expectedCvcLength = detectedNetwork === 'Amex' ? 4 : 3;
      if (cvc.replace(/\D/g, '').length < expectedCvcLength) {
        Alert.alert('Invalid CVC', `Please enter a valid ${expectedCvcLength}-digit security code.`);
        return;
      }
    }

    const items = useCartStore.getState().items;
    const restaurantId = useCartStore.getState().restaurantId;
    if (!items.length) {
      Alert.alert('Empty Cart', 'Add items before placing an order.');
      return;
    }
    if (!restaurantId) {
      Alert.alert('Error', 'Restaurant information is missing. Please go back and try again.');
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
        deliveryAddress: deliveryAddress || 'Address not specified',
        notes: '',
        deliveryFee,
        paymentMethod: selected === 'mobile' ? 'mobile_money' : selected,
      });

      if (selected === 'cash') {
        clearCart();
        router.replace(`/checkout/congratulations?orderId=${orderId}`);
        return;
      }

      if (selected === 'mobile') {
        const network = mobileProvider === 'mtn' ? 'MTN' : 'AIRTEL';
        try {
          const result = await initMobileMoney({
            phone: mobileNumber.replace(/\D/g, ''),
            network,
            amount: total,
            email: user?.email || 'customer@foodorder.ug',
            orderId,
            customerName: user?.full_name || 'Customer',
          });

          if (result.redirectUrl) {
            setPendingPayment({
              type: 'mobile',
              network,
              txRef: result.txRef,
              orderId,
              redirectUrl: result.redirectUrl,
            });
            await Linking.openURL(result.redirectUrl);
          } else {
            Alert.alert(
              'Authorization Sent',
              `A prompt has been sent to ${mobileNumber}. Approve it to complete payment.\n\nYour order is saved.`,
              [
                {
                  text: 'Check Payment Status',
                  onPress: () => setPendingPayment({
                    type: 'mobile',
                    network,
                    txRef: result.txRef,
                    orderId,
                    redirectUrl: null,
                  }),
                },
                { text: 'Pay Later (Cash)', onPress: () => { clearCart(); router.replace(`/checkout/congratulations?orderId=${orderId}`); }, style: 'cancel' },
              ]
            );
          }
        } catch (payErr) {
          console.error('Mobile money payment error:', payErr);
          Alert.alert(
            'Payment Issue',
            `${payErr.message || 'Mobile money payment failed'}\n\nWould you like to pay cash on delivery instead?`,
            [
              { text: 'Cancel Order', style: 'destructive', onPress: () => { setIsPlacing(false); router.back(); } },
              {
                text: 'Pay Cash',
                onPress: () => { clearCart(); router.replace(`/checkout/congratulations?orderId=${orderId}`); },
              },
            ]
          );
          return;
        }
        return;
      }

      if (selected === 'card') {
        try {
          const { paymentLink, txRef } = await initCardPayment({
            amount: total,
            email: user?.email || 'customer@foodorder.ug',
            orderId,
            customerName: user?.full_name || 'Customer',
          });
          if (paymentLink) {
            setPendingPayment({
              type: 'card',
              txRef,
              orderId,
              redirectUrl: paymentLink,
            });
            await Linking.openURL(paymentLink);
          } else {
            throw new Error('Could not generate payment link');
          }
        } catch (payErr) {
          console.error('Card payment error:', payErr);
          Alert.alert(
            'Card Payment Issue',
            `${payErr.message || 'Card payment failed'}\n\nPay cash on delivery instead?`,
            [
              { text: 'Cancel', style: 'cancel', onPress: () => { setIsPlacing(false); router.back(); } },
              {
                text: 'Pay Cash',
                onPress: () => { clearCart(); router.replace(`/checkout/congratulations?orderId=${orderId}`); },
              },
            ]
          );
          return;
        }
        return;
      }
    } catch (err) {
      console.error('Order placement error:', err);
      showToast({ type: 'error', message: err.message || 'Failed to place order. Please try again.' });
      setIsPlacing(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!pendingPayment?.txRef) return;
    setIsPlacing(true);
    try {
      const result = await verifyPayment(pendingPayment.txRef);
      if (result.success && (result.status === 'successful' || result.status === 'completed')) {
        clearCart();
        setPendingPayment(null);
        router.replace(`/checkout/congratulations?orderId=${pendingPayment.orderId}`);
      } else {
        Alert.alert(
          'Payment Not Yet Confirmed',
          `Status: ${result.status || 'pending'}\n\nPlease complete the payment in the browser and check again.`,
          [
            { text: 'Check Again', onPress: handleVerifyPayment },
            { text: 'Pay Cash', onPress: () => { clearCart(); setPendingPayment(null); router.replace(`/checkout/congratulations?orderId=${pendingPayment.orderId}`); } },
            { text: 'Cancel Order', style: 'destructive', onPress: () => { setPendingPayment(null); router.back(); } },
          ]
        );
      }
    } catch (err) {
      Alert.alert(
        'Verification Failed',
        `${err.message}\n\nPlease check again or choose another payment method.`,
        [
          { text: 'Try Again', onPress: handleVerifyPayment },
          { text: 'Pay Cash', onPress: () => { clearCart(); setPendingPayment(null); router.replace(`/checkout/congratulations?orderId=${pendingPayment.orderId}`); } },
        ]
      );
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
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

        {selected === 'card' && !showAddCard && (
          <>
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
              <Text variant="body" style={[styles.addNewText, { color: c.primary }]}>SAVE A CARD</Text>
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
                if (!luhnCheck(cardNumber)) {
                  Alert.alert('Invalid Card', 'Please check the card number and try again.');
                  return;
                }
                if (!isValidExpiry(expiry)) {
                  Alert.alert('Invalid Expiry', 'Please check the expiry date.');
                  return;
                }
                if (cvc.replace(/\D/g, '').length < 3) {
                  Alert.alert('Invalid CVC', 'CVC must be 3 or 4 digits.');
                  return;
                }
                setShowAddCard(false);
                showToast({ type: 'success', message: `${detectedNetwork || 'Card'} saved. Tap PAY & CONFIRM to complete.` });
              }}
            >
              <Text variant="body" style={[styles.addCardSubmitText, { color: c.textInverse }]}>SAVE CARD</Text>
            </Pressable>
          </View>
        )}

        {selected === 'mobile' && (
          <View style={[styles.mobileCard, { backgroundColor: c.backgroundSecondary }]}>
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
                A prompt will be sent to your phone to authorize the payment of{' '}
                <Text style={{ fontWeight: '700', color: c.text }}>{formatCurrency(total)}</Text>.{' '}
                Make sure {mobileProvider === 'mtn' ? 'MTN MoMo' : 'Airtel Money'} is active and funded.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.totalSection}>
          <Text variant="caption" style={[styles.totalLabel, { color: c.textMuted }]}>TOTAL:</Text>
          <Text variant="h1" style={[styles.totalPrice, { color: c.text }]}>{formatCurrency(total)}</Text>
        </View>
      </ScrollView>

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

      <Modal visible={!!pendingPayment} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: c.background }]}>
            <View style={styles.modalIconWrap}>
              <Ionicons name="time-outline" size={48} color={c.primary} />
            </View>
            <Text variant="h3" style={[styles.modalTitle, { color: c.text }]}>Payment Pending</Text>
            <Text variant="body" style={[styles.modalDesc, { color: c.textSecondary }]}>
              {pendingPayment?.type === 'card'
                ? 'Complete the card payment in the browser that opened, then tap "Verify Payment" below.'
                : `Authorize the ${pendingPayment?.network || 'mobile money'} prompt on your phone, then tap "Verify Payment".`}
            </Text>
            <Text variant="caption" style={[styles.modalHint, { color: c.textMuted }]}>
              Your order is saved. You can also choose to pay cash on delivery.
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalBtn, { backgroundColor: c.primary }]}
                onPress={handleVerifyPayment}
                disabled={isPlacing}
              >
                {isPlacing ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text variant="body" style={[styles.modalBtnText, { color: c.textInverse }]}>Verify Payment</Text>
                )}
              </Pressable>
              <Pressable
                style={[styles.modalBtnSecondary, { borderColor: c.border }]}
                onPress={() => {
                  clearCart();
                  setPendingPayment(null);
                  router.replace(`/checkout/congratulations?orderId=${pendingPayment?.orderId}`);
                }}
              >
                <Text variant="body" style={[styles.modalBtnTextSecondary, { color: c.text }]}>Pay Cash Instead</Text>
              </Pressable>
            </View>
          </View>
        </View>
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
  content: { paddingHorizontal: spacing.xl, gap: spacing.xl },

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

  totalSection: { alignItems: 'flex-start' },
  totalLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
  totalPrice: { fontSize: 32, fontWeight: '800' },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: spacing.xl, paddingTop: spacing.base,
  },
  payBtn: {
    paddingVertical: spacing.base,
    borderRadius: radius.full, alignItems: 'center',
  },
  payBtnText: { fontWeight: '700', fontSize: 16, letterSpacing: 0.5 },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    width: '100%', borderRadius: radius.lg,
    padding: spacing.xl, alignItems: 'center', gap: spacing.md,
  },
  modalIconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center',
  },
  modalTitle: { fontWeight: '700', fontSize: 20 },
  modalDesc: { textAlign: 'center', lineHeight: 22, fontSize: 14 },
  modalHint: { textAlign: 'center', fontSize: 12, lineHeight: 18 },
  modalActions: { width: '100%', gap: spacing.md, marginTop: spacing.sm },
  modalBtn: {
    paddingVertical: spacing.base, borderRadius: radius.full, alignItems: 'center',
  },
  modalBtnText: { fontWeight: '700', fontSize: 16 },
  modalBtnSecondary: {
    paddingVertical: spacing.base, borderRadius: radius.full, alignItems: 'center',
    borderWidth: 1.5,
  },
  modalBtnTextSecondary: { fontWeight: '600', fontSize: 15 },
});
