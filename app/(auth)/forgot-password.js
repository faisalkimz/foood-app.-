import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Input } from '../../src/components/ui';
import { colors, spacing, radius } from '../../src/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');

  const handleSend = () => {
    // Navigate to verification with email
    router.push('/(auth)/verification');
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
        <Text variant="h1" style={styles.heading}>Forgot Password</Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          Please sign in to your existing account
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
          />
        </View>

        <Pressable
          style={[styles.sendButton, !email && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!email}
        >
          <Text variant="body" style={styles.sendText}>SEND CODE</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.splashDark,
  },
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
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  content: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  contentInner: {
    padding: spacing.xl,
    gap: spacing.xl,
  },
  inputGroup: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
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
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
