import { useState } from 'react';
import {
  View, StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Input, showToast } from '../../src/components/ui';
import { spacing, radius } from '../../src/theme';
import { useTheme } from '../../src/providers/ThemeProvider';
import { signInWithOTP } from '../../src/services/authService';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return showToast({ type: 'warning', message: 'Please enter your email address.' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) return showToast({ type: 'warning', message: 'Please enter a valid email address.' });

    setLoading(true);
    try {
      await signInWithOTP(trimmed);
      router.push({ pathname: '/(auth)/verification', params: { email: trimmed, mode: 'login' } });
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Could not send code. Please try again.' });
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
      <View style={[styles.header, { paddingTop: insets.top + spacing['2xl'] }]}>
        <Text variant="h1" style={[styles.heading, { color: c.textInverse }]}>Log In</Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          Enter your email and we'll send you a verification code
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={[styles.content, { backgroundColor: c.background }]}
        contentContainerStyle={styles.contentInner}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Form */}
        <View style={styles.form}>
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
            style={[styles.loginButton, { backgroundColor: c.primary }, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text variant="body" style={[styles.loginButtonText, { color: c.textInverse }]}>
              {loading ? 'SENDING CODE...' : 'SEND CODE →'}
            </Text>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.signUpRow}>
            <Text variant="bodySmall" style={[styles.signUpLabel, { color: c.textSecondary }]}>
              Don't have an account?{' '}
            </Text>
            <Pressable onPress={() => router.push('/(auth)/signup')} hitSlop={8}>
              <Text variant="bodySmall" style={[styles.signUpLink, { color: c.primary }]}>SIGN UP</Text>
            </Pressable>
          </View>

          <View style={[styles.infoBox, { backgroundColor: c.primaryLight }]}>
            <Ionicons name="mail-outline" size={16} color={c.primary} />
            <Text variant="bodySmall" style={[styles.infoText, { color: c.textSecondary }]}>
              We'll email you a 6-digit code to verify your identity — no password needed.
            </Text>
          </View>
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
  heading: {
    fontSize: 30,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  subtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 15 },
  content: {
    flex: 1,
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
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  loginButton: {
    paddingVertical: spacing.base,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  loginButtonDisabled: { opacity: 0.6 },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: { alignItems: 'center', gap: spacing.lg },
  signUpRow: { flexDirection: 'row', alignItems: 'center' },
  signUpLabel: {},
  signUpLink: { fontWeight: '700' },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
