import { useState, useRef } from 'react';
import {
  View, StyleSheet, TextInput, Pressable,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../src/components/ui';
import { showToast } from '../../src/components/ui';
import { colors, spacing, radius } from '../../src/theme';
import { verifyOTP, signInWithOTP, signUpWithOTP, getProfile, updateProfile } from '../../src/services/authService';
import { useAuthStore } from '../../src/store/authStore';

const CODE_LENGTH = 6;

export default function VerificationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { email, name, phone, mode } = useLocalSearchParams(); // mode: 'login' | 'signup' | 'forgot'

  const [code, setCode] = useState(Array(CODE_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);
  const login = useAuthStore((s) => s.login);

  const handleCodeChange = (text, index) => {
    const newCode = [...code];
    // Handle paste of full code
    if (text.length > 1) {
      const chars = text.replace(/\D/g, '').slice(0, CODE_LENGTH).split('');
      chars.forEach((char, i) => { if (i < CODE_LENGTH) newCode[i] = char; });
      setCode(newCode);
      const nextEmpty = newCode.findIndex((c) => c === '');
      const focusIdx = nextEmpty === -1 ? CODE_LENGTH - 1 : nextEmpty;
      inputRefs.current[focusIdx]?.focus();
      return;
    }

    const digit = text.replace(/\D/g, '');
    newCode[index] = digit;
    setCode(newCode);
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== CODE_LENGTH) return;

    setLoading(true);
    try {
      const { user } = await verifyOTP(email, fullCode);

      if (!user) throw new Error('Verification failed. Please try again.');

      // Fetch profile to get role
      let profile;
      try {
        profile = await getProfile(user.id);
      } catch {
        // Profile created by trigger — might take a moment
        profile = { role: 'customer', full_name: name || user.email };
      }

      // Save extra fields (name, phone) to profile if this is signup
      if (mode === 'signup') {
        const updates = {};
        if (name) updates.full_name = name;
        if (phone) updates.phone_number = phone;
        if (Object.keys(updates).length > 0) {
          try {
            const updated = await updateProfile(user.id, updates);
            profile = { ...profile, ...updated };
          } catch {
            // Non-critical — profile still works
          }
        }
      }

      // Update auth store
      login({ ...user, ...profile }, profile.role || 'customer');

      // Route based on role
      const role = profile.role || 'customer';
      if (role === 'chef') {
        router.replace('/(chef)');
      } else {
        // First signup → location onboarding, returning login → home
        router.replace(mode === 'signup' ? '/(auth)/location' : '/(tabs)');
      }
    } catch (err) {
      showToast({
        type: 'error',
        message: err.message?.includes('expired')
          ? 'This code has expired. Please request a new one.'
          : err.message || 'The code you entered is incorrect. Please try again.',
      });
      setCode(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      if (mode === 'signup') {
        await signUpWithOTP(email);
      } else {
        await signInWithOTP(email);
      }
      setCode(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      showToast({ type: 'success', message: `New verification code sent to ${email}` });
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Could not resend code. Please try again.' });
    } finally {
      setResending(false);
    }
  };

  const isComplete = code.every((c) => c !== '');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Dark header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing['2xl'] }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textInverse} />
        </Pressable>
        <Text variant="h1" style={styles.heading}>Verification</Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          We sent a verification code to
        </Text>
        <Text variant="body" style={styles.email}>{email}</Text>
      </View>

      {/* White content */}
      <View style={styles.content}>
        {/* OTP Input boxes */}
        <View style={styles.codeRow}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.codeInput,
                focusedIndex === index && styles.codeInputFocused,
                digit && styles.codeInputFilled,
              ]}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => setFocusedIndex(index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              selectionColor={colors.primary}
              editable={!loading}
            />
          ))}
        </View>

        {/* Verify button */}
        <Pressable
          style={[styles.verifyButton, (!isComplete || loading) && styles.verifyButtonDisabled]}
          onPress={handleVerify}
          disabled={!isComplete || loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text variant="body" style={styles.verifyText}>VERIFY →</Text>
          )}
        </Pressable>

        {/* Resend */}
        <View style={styles.resendRow}>
          <Text variant="bodySmall" style={styles.resendLabel}>
            Didn't receive the code?{' '}
          </Text>
          <Pressable onPress={handleResend} hitSlop={8} disabled={resending}>
            <Text variant="bodySmall" style={[styles.resendLink, resending && { opacity: 0.5 }]}>
              {resending ? 'Sending...' : 'Resend'}
            </Text>
          </Pressable>
        </View>

        {/* Info note */}
        <View style={styles.noteBox}>
          <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
          <Text variant="bodySmall" style={styles.noteText}>
            Check your spam folder if you don't see it. The code expires in 10 minutes.
          </Text>
        </View>
      </View>
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
    marginBottom: spacing.md,
  },
  heading: {
    color: colors.textInverse,
    fontSize: 30,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  email: { color: colors.textInverse, fontWeight: '600', marginTop: 2 },
  content: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing['2xl'],
  },
  codeInput: {
    width: 40,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1.5,
    borderColor: colors.border,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  codeInputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight || 'rgba(255,107,53,0.06)',
  },
  codeInputFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  verifyButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.base,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    marginBottom: spacing.xl,
  },
  verifyButtonDisabled: { opacity: 0.5 },
  verifyText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  resendLabel: { color: colors.textSecondary },
  resendLink: { color: colors.primary, fontWeight: '600' },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  noteText: { flex: 1, color: colors.textSecondary, fontSize: 12, lineHeight: 17 },
});
