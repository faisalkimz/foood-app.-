import { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../src/components/ui';
import { useCartStore } from '../../src/store';
import { colors, spacing, radius } from '../../src/theme';

const paymentMethods = [
  { id: 'cash', label: 'Cash', icon: 'cash-outline' },
  { id: 'visa', label: 'Visa', icon: 'card-outline' },
  { id: 'mastercard', label: 'Mastercard', icon: 'card' },
  { id: 'paypal', label: 'PayPal', icon: 'logo-paypal' },
];

export default function PaymentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const [selected, setSelected] = useState('mastercard');

  const total = getSubtotal();

  const handlePayConfirm = () => {
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
        {/* Payment method selector */}
        <View style={styles.methodsRow}>
          {paymentMethods.map((method) => (
            <Pressable
              key={method.id}
              style={[
                styles.methodCard,
                selected === method.id && styles.methodCardActive,
              ]}
              onPress={() => setSelected(method.id)}
            >
              <Ionicons
                name={method.icon}
                size={28}
                color={selected === method.id ? colors.primary : colors.textMuted}
              />
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

        {/* Card visual */}
        <View style={styles.cardVisual}>
          <View style={styles.cardHeader}>
            <Ionicons name="card" size={24} color={colors.textInverse} />
            <Text variant="bodySmall" style={styles.cardType}>Master Card</Text>
          </View>
          <Text variant="body" style={styles.cardNumber}>
            •••• •••• •••• 436
          </Text>
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

        {/* Add new card */}
        <Pressable style={styles.addCardBtn}>
          <Ionicons name="add" size={20} color={colors.primary} />
          <Text variant="body" style={styles.addCardText}>ADD NEW</Text>
        </Pressable>

        {/* Total */}
        <View style={styles.totalRow}>
          <Text variant="caption" style={styles.totalLabel}>TOTAL:</Text>
          <Text variant="h1" style={styles.totalPrice}>${total}</Text>
        </View>
      </ScrollView>

      {/* Pay & Confirm button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.base }]}>
        <Pressable style={styles.payBtn} onPress={handlePayConfirm}>
          <Text variant="body" style={styles.payBtnText}>PAY & CONFIRM</Text>
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
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },
  methodsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  methodCard: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  methodCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  methodLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  methodLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  cardVisual: {
    backgroundColor: colors.splashDark,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardType: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  cardNumber: {
    color: colors.textInverse,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cardValue: {
    color: colors.textInverse,
    fontWeight: '500',
  },
  addCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  addCardText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  totalRow: {
    alignItems: 'flex-start',
  },
  totalLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  totalPrice: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.base,
    backgroundColor: colors.background,
  },
  payBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.base,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  payBtnText: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
