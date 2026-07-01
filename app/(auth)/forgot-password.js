import { useState } from 'react';
import {
  View, StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, Pressable, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Input } from '@/components/ui';
import { spacing, radius } from '@/theme';
import { useTheme } from '@/providers/ThemeProvider';
import { signInWithOTP } from '@/services/authService';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return Alert.alert('Error', 'Please enter your email address.');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) return Alert.alert('Error', 'Please enter a valid email address.');

    setLoading(true);
    try {
      await signInWithOTP(trimmed);
      router.push({
        pathname: '/(auth)/verification',
        params: { email: trimmed, mode: 'forgot' },
      });
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to send code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: c.splashDark }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Dark header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.base, backgroundColor: c.splashDark }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={c.textInverse} />
        </Pressable>
        <Text variant="h1" style={[styles.heading, { color: c.textInverse }]}>Sign In</Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          Enter your email and we'll send you a sign-in code
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={[styles.content, { backgroundColor: c.background }]}
        contentContainerStyle={styles.contentInner}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inputGroup}>
          <Text variant="label" style={[styles.inputLabel, { color: c.text }]}>EMAIL</Text>
          <Input
            placeholder="example@gmail.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        <Pressable
          style={[styles.sendButton, { backgroundColor: c.primary }, (!email || loading) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!email || loading}
        >
          <Text variant="body" style={[styles.sendText, { color: c.textInverse }]}>
            {loading ? 'SENDING...' : 'SEND CODE →'}
          </Text>
        </Pressable>

        <View style={[styles.infoBox, { backgroundColor: c.primaryLight }]}>
          <Ionicons name="mail-outline" size={16} color={c.primary} />
          <Text variant="bodySmall" style={[styles.infoText, { color: c.textSecondary }]}>
            We'll send a 6-digit verification code to your email. Use it to sign in.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['2xl'],
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  heading: {
    fontSize: 30,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  subtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  content: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  contentInner: { padding: spacing.xl, gap: spacing.xl },
  inputGroup: { gap: spacing.xs, marginTop: spacing.sm },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sendButton: {
    paddingVertical: spacing.base,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  sendButtonDisabled: { opacity: 0.5 },
  sendText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18 },
});
