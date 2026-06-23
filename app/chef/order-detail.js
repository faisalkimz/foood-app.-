import { useState, useEffect } from 'react';
import {
  View, StyleSheet, ScrollView, Pressable, Image, Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, showToast } from '../../src/components/ui';
import { useTheme } from '../../src/providers/ThemeProvider';
import { supabase } from '../../src/services/supabase';
import { updateOrderStatus } from '../../src/services/restaurantService';
import { spacing, radius } from '../../src/theme';

const STEPS = [
  { key: 'received', label: 'Order Received', icon: 'receipt' },
  { key: 'accepted', label: 'Accepted', icon: 'checkmark-circle' },
  { key: 'preparing', label: 'Preparing', icon: 'flame' },
  { key: 'ready', label: 'Ready', icon: 'bag-check' },
  { key: 'delivered', label: 'Delivered', icon: 'bicycle' },
];

function getStepIndex(status) {
  const map = { pending: 0, confirmed: 1, preparing: 2, ready: 3, delivered: 4 };
  return map[status] ?? 0;
}

const NEXT_STATUS = {
  0: { label: 'ACCEPT ORDER', next: 'confirmed' },
  1: { label: 'START PREPARING', next: 'preparing' },
  2: { label: 'MARK AS READY', next: 'ready' },
  3: { label: 'CONFIRM DELIVERY', next: 'delivered' },
};

export default function ChefOrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const c = useTheme();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items ( id, name, image_url, unit_price, quantity ),
            profiles:customer_id ( full_name, avatar_url, phone_number )
          `)
          .eq('id', id)
          .single();
        if (error) throw error;
        setOrder({
          id: data.id,
          status: data.status,
          customer: data.profiles?.full_name || 'Customer',
          customerImage: data.profiles?.avatar_url || null,
          customerPhone: data.profiles?.phone_number || '',
          items: (data.order_items || []).map((i) => ({
            name: i.name, qty: i.quantity,
            price: parseFloat(i.unit_price), image: i.image_url,
          })),
          total: parseFloat(data.total_amount || 0),
          address: data.delivery_address
            ? [data.delivery_address.name, data.delivery_address.street, data.delivery_address.city]
                .filter(Boolean).join(', ')
            : '',
          notes: data.notes || '',
          createdAt: data.created_at,
        });
      } catch {
        // order stays null
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const currentStep = order ? getStepIndex(order.status) : 0;

  const handleNextStep = async () => {
    const nextInfo = NEXT_STATUS[currentStep];
    if (!nextInfo || isSaving) return;
    setIsSaving(true);
    try {
      await updateOrderStatus(order.id, nextInfo.next);
      setOrder({ ...order, status: nextInfo.next });
      showToast({ type: 'success', message: `Order status: ${STEPS[currentStep + 1].label}` });
    } catch {
      showToast({ type: 'error', message: 'Failed to update status.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: c.background, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: c.backgroundSecondary }]}>
            <Ionicons name="arrow-back" size={22} color={c.text} />
          </Pressable>
          <Text variant="h3" style={{ color: c.text }}>Order Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={56} color={c.textMuted} />
          <Text variant="body" style={{ color: c.textMuted }}>Order not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: c.backgroundSecondary }]}>
          <Ionicons name="arrow-back" size={22} color={c.text} />
        </Pressable>
        <Text variant="h3" style={{ color: c.text }}>Order #{order.id.slice(-6).toUpperCase()}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Customer info */}
        <View style={[styles.customerCard, { backgroundColor: c.backgroundSecondary }]}>
          <Image
            source={{ uri: order.customerImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(order.customer)}&background=FF6B35&color=fff` }}
            style={styles.avatar}
          />
          <View style={styles.customerInfo}>
            <Text variant="body" style={[styles.customerName, { color: c.text }]}>{order.customer}</Text>
            {order.address ? (
              <View style={styles.addressRow}>
                <Ionicons name="location" size={14} color={c.primary} />
                <Text variant="caption" style={{ color: c.textMuted, flex: 1 }}>{order.address}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Status timeline */}
        <View style={[styles.timelineCard, { backgroundColor: c.backgroundSecondary }]}>
          <Text variant="label" style={[styles.sectionLabel, { color: c.textMuted }]}>ORDER STATUS</Text>
          {STEPS.map((step, idx) => {
            const isActive = idx <= currentStep;
            const isLast = idx === STEPS.length - 1;
            return (
              <View key={step.key} style={styles.timelineStep}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineDot, { backgroundColor: isActive ? c.primary : c.border }]}>
                    <Ionicons name={step.icon} size={14} color={isActive ? '#FFF' : c.textMuted} />
                  </View>
                  {!isLast && (
                    <View style={[styles.timelineLine, { backgroundColor: isActive ? c.primary : c.border }]} />
                  )}
                </View>
                <Text variant="body" style={[
                  styles.timelineLabel,
                  { color: isActive ? c.text : c.textMuted },
                  isActive && { fontWeight: '700' },
                ]}>
                  {step.label}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Order items */}
        <View style={[styles.itemsCard, { backgroundColor: c.backgroundSecondary }]}>
          <Text variant="label" style={[styles.sectionLabel, { color: c.textMuted }]}>ORDER ITEMS</Text>
          {order.items.map((item, idx) => (
            <View
              key={idx}
              style={[styles.itemRow, idx < order.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.borderLight }]}
            >
              <View style={styles.itemLeft}>
                <View style={[styles.qtyBadge, { backgroundColor: c.primary + '20' }]}>
                  <Text variant="caption" style={{ color: c.primary, fontWeight: '800' }}>{item.qty}x</Text>
                </View>
                <Text variant="body" style={{ color: c.text, fontWeight: '500' }}>{item.name}</Text>
              </View>
              <Text variant="body" style={{ color: c.text, fontWeight: '700' }}>UGX {item.price.toLocaleString()}</Text>
            </View>
          ))}
          <View style={[styles.totalRow, { borderTopColor: c.border }]}>
            <Text variant="h3" style={{ color: c.text }}>Total</Text>
            <Text variant="h3" style={{ color: c.primary }}>UGX {order.total.toLocaleString()}</Text>
          </View>
        </View>

        {/* Special note */}
        {order.notes ? (
          <View style={[styles.noteCard, { backgroundColor: '#FFF7ED', borderColor: '#FDBA7420' }]}>
            <Ionicons name="chatbubble-ellipses" size={18} color="#F59E0B" />
            <View style={{ flex: 1 }}>
              <Text variant="label" style={{ color: '#92400E', fontSize: 11 }}>SPECIAL INSTRUCTIONS</Text>
              <Text variant="body" style={{ color: '#78350F', marginTop: 2 }}>{order.notes}</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Action button */}
      {currentStep < STEPS.length - 1 && NEXT_STATUS[currentStep] && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.base, backgroundColor: c.background }]}>
          <Pressable
            style={[styles.actionBtn, { backgroundColor: c.primary, opacity: isSaving ? 0.6 : 1 }]}
            onPress={handleNextStep}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text variant="body" style={styles.actionBtnText}>
                {NEXT_STATUS[currentStep].label}
              </Text>
            )}
          </Pressable>
        </View>
      )}
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
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  content: { paddingHorizontal: spacing.xl, gap: spacing.md },
  customerCard: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.base,
    borderRadius: radius.lg, gap: spacing.md,
  },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  customerInfo: { flex: 1, gap: 4 },
  customerName: { fontWeight: '700', fontSize: 16 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timelineCard: { padding: spacing.base, borderRadius: radius.lg },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: spacing.md },
  timelineStep: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  timelineLeft: { alignItems: 'center' },
  timelineDot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  timelineLine: { width: 2, height: 24, marginVertical: 2 },
  timelineLabel: { fontSize: 14, paddingTop: 5, flex: 1 },
  itemsCard: { padding: spacing.base, borderRadius: radius.lg },
  itemRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.md,
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  qtyBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: spacing.md, marginTop: spacing.sm, borderTopWidth: 1,
  },
  noteCard: {
    flexDirection: 'row', gap: spacing.md, padding: spacing.base,
    borderRadius: radius.lg, borderWidth: 1,
  },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: spacing.xl, paddingTop: spacing.base,
  },
  actionBtn: { paddingVertical: spacing.base, borderRadius: radius.full, alignItems: 'center' },
  actionBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16, letterSpacing: 0.5 },
});
