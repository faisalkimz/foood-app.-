import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Image, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { useTheme } from '@/providers/ThemeProvider';
import { supabase } from '@/services/supabase';
import { fetchOrder } from '@/services/orderService';
import { spacing, radius } from '@/theme';
import { formatCurrency } from '@/utils/format';

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: 'receipt', color: '#6B7280' },
  { key: 'accepted', label: 'Confirmed', icon: 'checkmark-circle', color: '#3B82F6' },
  { key: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle', color: '#3B82F6' },
  { key: 'preparing', label: 'Preparing', icon: 'flame', color: '#F59E0B' },
  { key: 'ready', label: 'Ready for Pickup', icon: 'bag-check', color: '#8B5CF6' },
  { key: 'out_for_delivery', label: 'On the Way', icon: 'bicycle', color: '#FF6B35' },
  { key: 'delivering', label: 'On the Way', icon: 'bicycle', color: '#FF6B35' },
  { key: 'delivered', label: 'Delivered', icon: 'checkmark-done-circle', color: '#10B981' },
];

function getStepIndex(status) {
  const idx = STATUS_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

function getStatusLabel(status) {
  const step = STATUS_STEPS.find((s) => s.key === status);
  return step?.label || status;
}

function getStatusColor(status) {
  const step = STATUS_STEPS.find((s) => s.key === status);
  return step?.color || '#6B7280';
}

export default function TrackOrderScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const c = useTheme();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const channelRef = useRef(null);

  // Fetch order on mount
  useEffect(() => {
    (async () => {
      try {
        // Handle 'latest' — get the most recent order
        if (id === 'latest') {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data } = await supabase
              .from('orders')
              .select('id')
              .eq('customer_id', user.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();
            if (data) {
              const orderData = await fetchOrder(data.id);
              setOrder(orderData);
            }
          }
        } else {
          const orderData = await fetchOrder(id);
          setOrder(orderData);
        }
      } catch (err) {
        console.error('Failed to load order:', err);
        // order stays null, will show error state
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!order?.id) return;
    if (channelRef.current) return;

    const channel = supabase
      .channel(`order-${order.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${order.id}`,
      }, (payload) => {
        if (payload.new?.status) {
          setOrder((prev) => prev ? { ...prev, status: payload.new.status } : prev);
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [order?.id]);

  const currentStep = order ? getStepIndex(order.status) : 0;

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
          <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} style={[styles.backBtn, { backgroundColor: c.backgroundSecondary }]}>
            <Ionicons name="arrow-back" size={22} color={c.text} />
          </Pressable>
          <Text variant="h3" style={{ color: c.text }}>Track Order</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={56} color={c.textMuted} />
          <Text variant="body" style={{ color: c.textMuted }}>Order not found</Text>
        </View>
      </View>
    );
  }

  const isCancelled = order.status === 'cancelled';
  const isDelivered = order.status === 'delivered';

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}
          style={[styles.backBtn, { backgroundColor: c.backgroundSecondary }]}
        >
          <Ionicons name="arrow-back" size={22} color={c.text} />
        </Pressable>
        <Text variant="h3" style={{ color: c.text }}>Track Order</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Status banner */}
        <View style={[styles.statusBanner, { backgroundColor: getStatusColor(order.status) + '15' }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(order.status) }]} />
          <Text variant="h3" style={[styles.statusText, { color: getStatusColor(order.status) }]}>
            {getStatusLabel(order.status)}
          </Text>
          {!isDelivered && !isCancelled && (
            <Text variant="caption" style={[styles.etaText, { color: getStatusColor(order.status) }]}>
              Est. 20–35 min
            </Text>
          )}
        </View>

        {/* Status timeline */}
        {!isCancelled && (
          <View style={[styles.timelineCard, { backgroundColor: c.backgroundSecondary }]}>
            {STATUS_STEPS.map((step, idx) => {
              const isActive = idx <= currentStep;
              const isLast = idx === STATUS_STEPS.length - 1;
              return (
                <View key={step.key} style={styles.timelineStep}>
                  <View style={styles.timelineLeft}>
                    <View style={[
                      styles.timelineDot,
                      { backgroundColor: isActive ? step.color : c.border },
                    ]}>
                      <Ionicons name={step.icon} size={14} color={isActive ? '#FFF' : c.textMuted} />
                    </View>
                    {!isLast && (
                      <View style={[styles.timelineLine, { backgroundColor: isActive ? step.color : c.border }]} />
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
        )}

        {/* Cancelled banner */}
        {isCancelled && (
          <View style={[styles.cancelledBanner, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="close-circle" size={24} color="#DC2626" />
            <Text variant="body" style={{ color: '#DC2626', fontWeight: '700' }}>This order has been cancelled</Text>
          </View>
        )}

        {/* Restaurant info */}
        <View style={[styles.infoCard, { backgroundColor: c.backgroundSecondary }]}>
          <View style={styles.infoRow}>
            <Image
              source={{ uri: order.restaurant.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(order.restaurant.name)}&background=FF6B35&color=fff` }}
              style={styles.restaurantImage}
            />
            <View style={styles.infoContent}>
              <Text variant="body" style={{ fontWeight: '700', fontSize: 15, color: c.text }}>
                {order.restaurant.name}
              </Text>
              <Text variant="caption" style={{ color: c.textMuted }}>
                Ordered {formatDate(order.createdAt)}
              </Text>
            </View>
            {!isDelivered && !isCancelled && (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable
                  onPress={() => router.push({ pathname: '/order/chat', params: { orderId: order.id } })}
                  style={[styles.contactBtn, { backgroundColor: c.primary + '15' }]}
                >
                  <Ionicons name="chatbubble" size={16} color={c.primary} />
                </Pressable>
                <Pressable
                  onPress={() => router.push({ pathname: '/order/call', params: { orderId: order.id } })}
                  style={[styles.contactBtn, { backgroundColor: '#10B981' + '15' }]}
                >
                  <Ionicons name="call" size={16} color="#10B981" />
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {/* Order items */}
        <View style={[styles.infoCard, { backgroundColor: c.backgroundSecondary }]}>
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
                <Text variant="body" style={{ color: c.text, fontWeight: '500' }}>{item.name || 'Item'}</Text>
              </View>
              <Text variant="body" style={{ color: c.text, fontWeight: '700' }}>{formatCurrency(item.price || 0)}</Text>
            </View>
          ))}
          <View style={[styles.totalRow, { borderTopColor: c.border }]}>
            <Text variant="body" style={{ color: c.textMuted }}>Delivery Fee</Text>
            <Text variant="body" style={{ color: c.text, fontWeight: '600' }}>
              {(order.deliveryFee || 0) > 0 ? formatCurrency(order.deliveryFee) : 'Free'}
            </Text>
          </View>
          <View style={styles.feeRow}>
            <Text variant="h3" style={{ color: c.text }}>Total</Text>
            <Text variant="h3" style={{ color: c.primary }}>{formatCurrency(order.total || 0)}</Text>
          </View>
        </View>

        {/* Notes */}
        {order.notes ? (
          <View style={[styles.noteCard, { backgroundColor: '#FFF7ED', borderColor: '#FDBA7420' }]}>
            <Ionicons name="chatbubble-ellipses" size={18} color="#F59E0B" />
            <View style={{ flex: 1 }}>
              <Text variant="label" style={{ color: '#92400E', fontSize: 11 }}>NOTE</Text>
              <Text variant="body" style={{ color: '#78350F', marginTop: 2 }}>{order.notes}</Text>
            </View>
          </View>
        ) : null}

        {/* Delivery address */}
        {order.address ? (
          <View style={[styles.infoCard, { backgroundColor: c.backgroundSecondary }]}>
            <View style={styles.addressRow}>
              <View style={[styles.addressIcon, { backgroundColor: c.primary + '20' }]}>
                <Ionicons name="location" size={18} color={c.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="label" style={{ color: c.textMuted, fontSize: 11 }}>DELIVERY ADDRESS</Text>
                <Text variant="body" style={{ color: c.text, fontWeight: '500', marginTop: 2 }}>{order.address}</Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Back to home */}
        {isDelivered && (
          <Pressable
            style={[styles.homeBtn, { backgroundColor: c.primary }]}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text variant="body" style={styles.homeBtnText}>BACK TO HOME</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'pm' : 'am';
  return `${d.getDate()} ${months[d.getMonth()]}, ${h % 12 || 12}:${m}${ampm}`;
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

  // Status banner
  statusBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.base, paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontWeight: '800', fontSize: 18, flex: 1 },
  etaText: { fontWeight: '600', fontSize: 13 },

  // Timeline
  timelineCard: { padding: spacing.base, borderRadius: radius.lg },
  timelineStep: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  timelineLeft: { alignItems: 'center' },
  timelineDot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  timelineLine: { width: 2, height: 20, marginVertical: 2 },
  timelineLabel: { fontSize: 14, paddingTop: 5, flex: 1 },

  // Cancelled
  cancelledBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.base, borderRadius: radius.lg,
  },

  // Info cards
  infoCard: { borderRadius: radius.lg, padding: spacing.base },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  restaurantImage: { width: 56, height: 56, borderRadius: radius.md },
  infoContent: { flex: 1, gap: 2 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: spacing.md },

  // Items
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
  feeRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: spacing.xs,
  },

  // Note
  noteCard: {
    flexDirection: 'row', gap: spacing.md, padding: spacing.base,
    borderRadius: radius.lg, borderWidth: 1,
  },

  // Address
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  addressIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  // Home button
  homeBtn: { paddingVertical: spacing.base, borderRadius: radius.full, alignItems: 'center', marginTop: spacing.md },
  homeBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16, letterSpacing: 0.5 },

  // Contact buttons
  contactBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
