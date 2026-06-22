import { useState } from 'react';
import {
  View, StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, Pressable, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Input } from '../../src/components/ui';
import { colors, spacing, radius } from '../../src/theme';
import { signInWithOTP } from '../../src/services/authService';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Dark header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.base }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textInverse} />
        </Pressable>
        <Text variant="h1" style={styles.heading}>Sign In</Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          Enter your email and we'll send you a sign-in code
        </Text>
      </View>

      {/* White content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inputGroup}>
          <Text variant="label" style={styles.inputLabel}>EMAIL</Text>
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
          style={[styles.sendButton, (!email || loading) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!email || loading}
        >
          <Text variant="body" style={styles.sendText}>
            {loading ? 'SENDING...' : 'SEND CODE →'}
          </Text>
        </Pressable>

        <View style={styles.infoBox}>
          <Ionicons name="mail-outline" size={16} color={colors.primary} />
          <Text variant="bodySmall" style={styles.infoText}>
            We'll send a 6-digit verification code to your email. Use it to sign in.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.splashDark },
  header: {
    backgroundColor: colors.splashDark,
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
    color: colors.textInverse,
    fontSize: 30,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  subtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  content: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  contentInner: { padding: spacing.xl, gap: spacing.xl },
  inputGroup: { gap: spacing.xs, marginTop: spacing.sm },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sendButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.base,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  sendButtonDisabled: { opacity: 0.5 },
  sendText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.primaryLight || 'rgba(255,107,53,0.08)',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  infoText: { flex: 1, color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
});
