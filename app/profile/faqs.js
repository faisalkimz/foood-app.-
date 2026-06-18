import { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../src/components/ui';
import { useTheme } from '../../src/providers/ThemeProvider';
import { spacing, radius } from '../../src/theme';

const faqs = [
  { q: 'How do I place an order?', a: 'Browse restaurants, select your items, add to cart, and proceed to checkout. You can pay with card, cash, or mobile money.' },
  { q: 'How long does delivery take?', a: 'Delivery times vary by restaurant and distance. Most orders arrive within 20-45 minutes. You can track your order in real-time.' },
  { q: 'Can I cancel my order?', a: 'Yes, you can cancel from the Orders tab before the restaurant starts preparing. After preparation begins, cancellation may not be available.' },
  { q: 'What payment methods do you accept?', a: 'We accept Cash on Delivery, Visa, Mastercard, MTN Mobile Money, and Airtel Money.' },
  { q: 'How do I contact my delivery driver?', a: 'Once your order is on the way, you can call or message your driver directly from the Track Order screen.' },
  { q: 'Is there a minimum order amount?', a: 'Minimum order amounts vary by restaurant. Check the restaurant page for details.' },
  { q: 'How do I apply a promo code?', a: 'Enter your promo code at checkout in the "Promo Code" field. The discount will be applied automatically.' },
  { q: 'How do I report an issue with my order?', a: 'Go to My Orders, select the order, and tap "Report Issue". Our support team will respond within 24 hours.' },
];

export default function FAQsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = useTheme();
  const [expanded, setExpanded] = useState(null);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: c.backgroundSecondary }]}>
          <Ionicons name="arrow-back" size={22} color={c.text} />
        </Pressable>
        <Text variant="h3" style={{ color: c.text }}>FAQs</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: insets.bottom + spacing.xl, gap: spacing.sm }}
        showsVerticalScrollIndicator={false}
      >
        {faqs.map((faq, idx) => (
          <Pressable
            key={idx}
            style={[styles.faqCard, { backgroundColor: c.backgroundSecondary }]}
            onPress={() => setExpanded(expanded === idx ? null : idx)}
          >
            <View style={styles.faqHeader}>
              <Text variant="body" style={[styles.faqQuestion, { color: c.text }]}>
                {faq.q}
              </Text>
              <Ionicons
                name={expanded === idx ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={c.textMuted}
              />
            </View>
            {expanded === idx && (
              <Text variant="bodySmall" style={[styles.faqAnswer, { color: c.textSecondary }]}>
                {faq.a}
              </Text>
            )}
          </Pressable>
        ))}
      </ScrollView>
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
  faqCard: { borderRadius: radius.lg, padding: spacing.base },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { fontWeight: '600', fontSize: 14, flex: 1, marginRight: spacing.sm },
  faqAnswer: { marginTop: spacing.md, lineHeight: 22, fontSize: 14 },
});
