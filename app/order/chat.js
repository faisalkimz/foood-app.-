import { useState, useRef, useEffect } from 'react';
import {
  View, StyleSheet, Pressable, TextInput, FlatList, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { useTheme } from '@/providers/ThemeProvider';
import { supabase } from '@/services/supabase';
import { spacing, radius } from '@/theme';

export default function ChatScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const c = useTheme();
  const flatListRef = useRef(null);

  const [contactName, setContactName] = useState('Restaurant');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    if (!orderId) return;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setCurrentUserId(user.id);

        const { data: order } = await supabase
          .from('orders')
          .select('restaurants ( name )')
          .eq('id', orderId)
          .single();
        if (order?.restaurants?.name) {
          setContactName(order.restaurants.name);
        }
      } catch {
        // fallback to default name
      }
    })();
  }, [orderId]);

  useEffect(() => {
    if (!orderId || !currentUserId) return;
    (async () => {
      const { data: existing } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (existing) {
        setMessages(existing.map(msg => ({
          id: msg.id,
          text: msg.message,
          sender: msg.sender_id === currentUserId ? 'me' : 'restaurant',
          time: formatTime(msg.created_at),
        })));
      }
    })();
  }, [orderId, currentUserId]);

  useEffect(() => {
    if (!orderId) return;
    const channel = supabase
      .channel(`customer-chat-${orderId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `order_id=eq.${orderId}`,
      }, (payload) => {
        const newMsg = payload.new;
        setMessages((prev) => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, {
            id: newMsg.id,
            text: newMsg.message,
            sender: newMsg.sender_id === currentUserId ? 'me' : 'restaurant',
            time: formatTime(newMsg.created_at),
          }];
        });
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderId, currentUserId]);

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 200);
  }, [messages.length]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('chat_messages').insert({
        order_id: orderId,
        sender_id: user.id,
        message: text,
      });
    } catch {
      // silent
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender === 'me';
    return (
      <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
        <View style={[
          styles.bubble,
          isMe
            ? [styles.bubbleMe, { backgroundColor: c.primary }]
            : [styles.bubbleRestaurant, { backgroundColor: c.backgroundSecondary }],
        ]}>
          <Text variant="body" style={[
            styles.bubbleText,
            { color: isMe ? '#FFF' : c.text },
          ]}>
            {item.text}
          </Text>
        </View>
        <Text variant="caption" style={[styles.timeText, isMe && styles.timeTextMe]}>
          {item.time}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: c.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, borderBottomColor: c.borderLight }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: c.backgroundSecondary }]}>
          <Ionicons name="arrow-back" size={22} color={c.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text variant="h3" style={{ color: c.text }}>{contactName}</Text>
          <View style={styles.onlineRow}>
            <View style={styles.onlineDot} />
            <Text variant="caption" style={{ fontSize: 11 }}>Online</Text>
          </View>
        </View>
        <Pressable
          style={[styles.headerAction, { backgroundColor: c.backgroundSecondary }]}
          onPress={() => router.push({ pathname: '/order/call', params: { orderId } })}
        >
          <Ionicons name="call" size={18} color={c.primary} />
        </Pressable>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={[styles.messagesList, { paddingBottom: spacing.md }]}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Ionicons name="chatbubbles-outline" size={40} color={c.textMuted} />
            <Text variant="body" style={{ color: c.textMuted, textAlign: 'center', marginTop: spacing.sm }}>
              Start chatting with {contactName}
            </Text>
          </View>
        }
      />

      <View style={[styles.inputBar, { paddingBottom: insets.bottom + spacing.sm, backgroundColor: c.background, borderTopColor: c.borderLight }]}>
        <View style={[styles.inputWrap, { backgroundColor: c.backgroundSecondary, borderColor: c.border }]}>
          <TextInput
            style={[styles.textInput, { color: c.text }]}
            placeholder="Write something..."
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
  );
}

function formatTime(iso) {
  const d = iso ? new Date(iso) : new Date();
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'pm' : 'am';
  return `${h % 12 || 12}:${m}${ampm}`;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.xl, paddingBottom: spacing.md, borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#2ECC71' },
  headerAction: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
  },
  messagesList: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, flexGrow: 1 },
  emptyChat: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  msgRow: { marginBottom: spacing.md, alignItems: 'flex-start' },
  msgRowMe: { alignItems: 'flex-end' },
  bubble: {
    maxWidth: '78%', paddingVertical: spacing.md, paddingHorizontal: spacing.base,
    borderRadius: radius.lg,
  },
  bubbleMe: { borderBottomRightRadius: 4 },
  bubbleRestaurant: { borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 15, lineHeight: 21 },
  timeText: { fontSize: 10, marginTop: 4 },
  timeTextMe: { textAlign: 'right' },
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
