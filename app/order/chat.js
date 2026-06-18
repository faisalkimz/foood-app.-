import { useState, useRef, useEffect } from 'react';
import {
  View, StyleSheet, Pressable, TextInput, FlatList, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../src/components/ui';
import { useTheme } from '../../src/providers/ThemeProvider';
import { spacing, radius } from '../../src/theme';

const DRIVER_NAME = 'Robert Fox';

const initialMessages = [
  { id: '1', text: 'Are you coming?', sender: 'me', time: '8:10pm' },
  { id: '2', text: 'Hey, Congratulation for order', sender: 'driver', time: '8:11pm' },
  { id: '3', text: 'Hey, Where are you now?', sender: 'me', time: '8:11pm' },
  { id: '4', text: "I'm Coming, just wait ...", sender: 'driver', time: '8:12pm' },
  { id: '5', text: 'Hurry Up, Man', sender: 'me', time: '8:12pm' },
];

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = useTheme();
  const flatListRef = useRef(null);

  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');

  useEffect(() => {
    // Scroll to bottom on mount
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 200);
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput('');

    // Simulate driver reply after 1.5s
    setTimeout(() => {
      const reply = {
        id: (Date.now() + 1).toString(),
        text: "OK, I'll be there soon! 🚗",
        sender: 'driver',
        time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, reply]);
    }, 1500);
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender === 'me';
    return (
      <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
        <View style={[
          styles.bubble,
          isMe
            ? [styles.bubbleMe, { backgroundColor: c.primary }]
            : [styles.bubbleDriver, { backgroundColor: c.backgroundSecondary }],
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
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, borderBottomColor: c.borderLight }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: c.backgroundSecondary }]}>
          <Ionicons name="arrow-back" size={22} color={c.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text variant="h3" style={{ color: c.text }}>{DRIVER_NAME}</Text>
          <View style={styles.onlineRow}>
            <View style={styles.onlineDot} />
            <Text variant="caption" style={{ fontSize: 11 }}>Online</Text>
          </View>
        </View>
        <Pressable style={[styles.headerAction, { backgroundColor: c.backgroundSecondary }]}>
          <Ionicons name="call" size={18} color={c.primary} />
        </Pressable>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={[styles.messagesList, { paddingBottom: spacing.md }]}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input bar */}
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
  messagesList: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  msgRow: { marginBottom: spacing.md, alignItems: 'flex-start' },
  msgRowMe: { alignItems: 'flex-end' },
  bubble: {
    maxWidth: '78%', paddingVertical: spacing.md, paddingHorizontal: spacing.base,
    borderRadius: radius.lg,
  },
  bubbleMe: { borderBottomRightRadius: 4 },
  bubbleDriver: { borderBottomLeftRadius: 4 },
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
