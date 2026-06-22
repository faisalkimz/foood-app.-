import { useState } from 'react';
import {
  View, StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Input, showToast } from '../../src/components/ui';
import { colors, spacing, radius } from '../../src/theme';
import { signInWithOTP } from '../../src/services/authService';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return showToast({ type: 'warning', title: 'Missing Email', message: 'Please enter your email address.' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) return showToast({ type: 'warning', title: 'Invalid Email', message: 'Please enter a valid email address.' });

    setLoading(true);
    try {
      await signInWithOTP(trimmed);
      router.push({ pathname: '/(auth)/verification', params: { email: trimmed, mode: 'login' } });
    } catch (err) {
      showToast({ type: 'error', title: 'Sign In Failed', message: err.message || 'Could not send code. Please try again.' });
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
      <View style={[styles.header, { paddingTop: insets.top + spacing['2xl'] }]}>
        <Text variant="h1" style={styles.heading}>Log In</Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          Enter your email and we'll send you a verification code
        </Text>
      </View>

      {/* White content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Form */}
        <View style={styles.form}>
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
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text variant="body" style={styles.loginButtonText}>
              {loading ? 'SENDING CODE...' : 'SEND CODE →'}
            </Text>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.signUpRow}>
            <Text variant="bodySmall" style={styles.signUpLabel}>
              Don't have an account?{' '}
            </Text>
            <Pressable onPress={() => router.push('/(auth)/signup')} hitSlop={8}>
              <Text variant="bodySmall" style={styles.signUpLink}>SIGN UP</Text>
            </Pressable>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="mail-outline" size={16} color={colors.primary} />
            <Text variant="bodySmall" style={styles.infoText}>
              We'll email you a 6-digit code to verify your identity — no password needed.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.splashDark },
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['2xl'],
  },
  heading: {
    color: colors.textInverse,
    fontSize: 30,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  subtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 15 },
  content: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  contentInner: {
    padding: spacing.xl,
    paddingTop: spacing['2xl'],
    gap: spacing['2xl'],
  },
  form: { gap: spacing.lg },
  inputGroup: { gap: spacing.xs },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.base,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  loginButtonDisabled: { opacity: 0.6 },
  loginButtonText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: { alignItems: 'center', gap: spacing.lg },
  signUpRow: { flexDirection: 'row', alignItems: 'center' },
  signUpLabel: { color: colors.textSecondary },
  signUpLink: { color: colors.primary, fontWeight: '700' },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.primaryLight || 'rgba(255,107,53,0.08)',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  infoText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});
