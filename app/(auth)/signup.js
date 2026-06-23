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
import { signUpWithOTP } from '../../src/services/authService';

export default function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    if (!trimmedName) return showToast({ type: 'warning', message: 'Please enter your full name.' });
    if (!trimmedEmail) return showToast({ type: 'warning', message: 'Please enter your email address.' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) return showToast({ type: 'warning', message: 'Please enter a valid email address.' });

    setLoading(true);
    try {
      await signUpWithOTP(trimmedEmail);
      router.push({
        pathname: '/(auth)/verification',
        params: {
          email: trimmedEmail,
          name: trimmedName,
          phone: trimmedPhone,
          mode: 'signup',
        },
      });
    } catch (err) {
      if (err.message?.toLowerCase().includes('already registered')) {
        showToast({ type: 'info', message: 'This email is already registered. Try logging in instead.' });
      } else {
        showToast({ type: 'error', message: err.message || 'Could not create account. Please try again.' });
      }
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
      <View style={[styles.header, { paddingTop: insets.top + spacing.xl }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textInverse} />
        </Pressable>
        <Text variant="h1" style={styles.heading}>Sign Up</Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          Create your account — we'll send a code to verify your email
        </Text>
      </View>

      {/* White content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text variant="label" style={styles.inputLabel}>FULL NAME</Text>
            <Input
              placeholder="John Doe"
              value={name}
              onChangeText={setName}
              autoComplete="name"
            />
          </View>

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

          <View style={styles.inputGroup}>
            <Text variant="label" style={styles.inputLabel}>PHONE NUMBER</Text>
            <Input
              placeholder="+256 700 123 456"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
          </View>

          <Pressable
            style={[styles.signupButton, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text variant="body" style={styles.signupButtonText}>
              {loading ? 'SENDING CODE...' : 'CREATE ACCOUNT →'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <View style={styles.loginRow}>
            <Text variant="bodySmall" style={styles.loginLabel}>
              Already have an account?{' '}
            </Text>
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <Text variant="bodySmall" style={styles.loginLink}>Sign In</Text>
            </Pressable>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="shield-checkmark-outline" size={16} color={colors.primary} />
            <Text variant="bodySmall" style={styles.infoText}>
              No password required. We verify your identity with a one-time code sent to your email.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.splashDark },
  header: { paddingHorizontal: spacing.xl, paddingBottom: spacing['2xl'] },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
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
  signupButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.base,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonDisabled: { opacity: 0.6 },
  signupButtonText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: { alignItems: 'center', gap: spacing.lg },
  loginRow: { flexDirection: 'row', alignItems: 'center' },
  loginLabel: { color: colors.textSecondary },
  loginLink: { color: colors.primary, fontWeight: '700' },
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
