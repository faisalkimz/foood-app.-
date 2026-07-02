import { useState, useEffect, useRef } from 'react';
import {
  View, StyleSheet, ScrollView, Pressable, Image, Alert,
  ActivityIndicator, TextInput, FlatList, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, showToast } from '@/components/ui';
import { ChatMessage } from '@/components/shared';
import { formatCurrency } from '@/utils/format';
import { useTheme } from '@/providers/ThemeProvider';
import { supabase } from '@/services/supabase';
import { updateOrderStatus } from '@/services/restaurantService';
import { spacing, radius } from '@/theme';
import Constants from 'expo-constants';

const STEPS = [
  { key: 'pending', label: 'Order Received', icon: 'receipt' },
  { key: 'confirmed', label: 'Accepted', icon: 'checkmark-circle' },
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

function formatTime(iso) {
  const d = iso ? new Date(iso) : new Date();
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'pm' : 'am';
  return `${h % 12 || 12}:${m}${ampm}`;
}

export default function ChefOrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const c = useTheme();
  const flatListRef = useRef(null);

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const chatChannelRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setCurrentUserId(user.id);

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

  // Load existing chat messages
  useEffect(() => {
    if (!id || !currentUserId) return;
    (async () => {
      const { data: existingMessages } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('order_id', id)
        .order('created_at', { ascending: true });

      if (existingMessages) {
        setMessages(existingMessages.map(msg => ({
          id: msg.id,
          text: msg.message,
          sender: msg.sender_id === currentUserId ? 'me' : 'customer',
          time: formatTime(msg.created_at),
        })));
      }
    })();
  }, [id, currentUserId]);

  useEffect(() => {
    if (!id) return;
    if (chatChannelRef.current) return;

    const channel = supabase
      .channel(`chef-chat-${id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `order_id=eq.${id}`,
      }, (payload) => {
        const newMsg = payload.new;
        setMessages((prev) => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, {
            id: newMsg.id,
            text: newMsg.message,
            sender: newMsg.sender_id === currentUserId ? 'me' : 'customer',
            time: formatTime(newMsg.created_at),
          }];
        });
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      })
      .subscribe();

    chatChannelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      chatChannelRef.current = null;
    };
  }, [id, currentUserId]);

  useEffect(() => {
    if (showChat) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 300);
    }
  }, [showChat, messages.length]);

  const API_URL = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('chat_messages').insert({
        order_id: id,
        sender_id: user.id,
        message: text,
      });
      fetch(`${API_URL}/api/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id, message: text, senderId: user.id }),
      }).catch(() => {});
    } catch { /* silent */ }
  };

  const currentStep = order ? getStepIndex(order.status) : 0;

  const handleNextStep = async () => {
    if (!order) return;
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
        <Pressable
          onPress={() => setShowChat(!showChat)}
          style={[styles.chatToggleBtn, { backgroundColor: showChat ? c.primary : c.backgroundSecondary }]}
        >
          <Ionicons name="chatbubble" size={20} color={showChat ? '#FFF' : c.primary} />
        </Pressable>
      </View>

      {showChat ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ChatMessage item={item} isMe={item.sender === 'me'} c={c} />}
            contentContainerStyle={[chatStyles.messagesList, { paddingBottom: spacing.md }]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={chatStyles.emptyChat}>
                <Ionicons name="chatbubbles-outline" size={40} color={c.textMuted} />
                <Text variant="body" style={{ color: c.textMuted, textAlign: 'center', marginTop: spacing.sm }}>
                  No messages yet. Say hello to your customer!
                </Text>
              </View>
            }
          />
          <View style={[chatStyles.inputBar, { paddingBottom: insets.bottom + spacing.sm, backgroundColor: c.background, borderTopColor: c.borderLight }]}>
            <View style={[chatStyles.inputWrap, { backgroundColor: c.backgroundSecondary, borderColor: c.border }]}>
              <TextInput
                style={[chatStyles.textInput, { color: c.text }]}
                placeholder="Reply to customer..."
                placeholderTextColor={c.textMuted}
                value={input}
                onChangeText={setInput}
                onSubmitEditing={handleSend}
                returnKeyType="send"
              />
              <Pressable onPress={handleSend} hitSlop={8}>
                <Ionicons name="send" size={20} color={input.trim() ? c.primary : c.textMuted} />
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.customerCard, { backgroundColor: c.backgroundSecondary }]}>
              <Image
                source={{ uri: order.customerImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(order.customer)}&background=FF6B35&color=fff` }}
                style={styles.avatar}
              />
              <View style={styles.customerInfo}>
                <Text variant="body" style={[styles.customerName, { color: c.text }]}>{order.customer}</Text>
                {order.customerPhone ? (
                  <View style={styles.addressRow}>
                    <Ionicons name="call-outline" size={14} color={c.primary} />
                    <Text variant="caption" style={{ color: c.textMuted }}>{order.customerPhone}</Text>
                  </View>
                ) : null}
                {order.address ? (
                  <View style={styles.addressRow}>
                    <Ionicons name="location" size={14} color={c.primary} />
                    <Text variant="caption" style={{ color: c.textMuted, flex: 1 }}>{order.address}</Text>
                  </View>
                ) : null}
              </View>
            </View>

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
                  <Text variant="body" style={{ color: c.text, fontWeight: '700' }}>{formatCurrency(item.price)}</Text>
                </View>
              ))}
              <View style={[styles.totalRow, { borderTopColor: c.border }]}>
                <Text variant="h3" style={{ color: c.text }}>Total</Text>
                <Text variant="h3" style={{ color: c.primary }}>{formatCurrency(order.total)}</Text>
              </View>
            </View>

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
        </>
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
  chatToggleBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
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

const chatStyles = StyleSheet.create({
  messagesList: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, flexGrow: 1 },
  emptyChat: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  inputBar: {
    paddingHorizontal: spacing.xl, paddingTop: spacing.sm, borderTopWidth: 1,
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: radius.full, borderWidth: 1,
    paddingHorizontal: spacing.base, gap: spacing.sm,
  },
  textInput: { flex: 1, paddingVertical: spacing.md, fontSize: 15 },
});
