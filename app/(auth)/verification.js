import { useState, useRef } from 'react';
import { View, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../src/components/ui';
import { colors, spacing, radius } from '../../src/theme';

const CODE_LENGTH = 4;

export default function VerificationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [code, setCode] = useState(['', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef([]);

  const handleCodeChange = (text, index) => {
    const newCode = [...code];
    // Handle paste of full code
    if (text.length > 1) {
      const chars = text.slice(0, CODE_LENGTH).split('');
      chars.forEach((char, i) => {
        if (i < CODE_LENGTH) newCode[i] = char;
      });
      setCode(newCode);
      inputRefs.current[CODE_LENGTH - 1]?.focus();
      return;
    }

    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input
    if (text && index < CODE_LENGTH - 1) {
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

  const handleVerify = () => {
    const fullCode = code.join('');
    if (fullCode.length === CODE_LENGTH) {
      // Mock verification — accept any 4-digit code
      router.replace('/(auth)/location');
    }
  };

  const handleResend = () => {
    setCode(['', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  const isComplete = code.every((c) => c !== '');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Dark header area */}
      <View style={[styles.header, { paddingTop: insets.top + spacing['2xl'] }]}>
        <Text variant="h1" style={styles.heading}>Verification</Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          We have sent a code to your email
        </Text>
        <Text variant="body" style={styles.email}>example@gmail.com</Text>
      </View>

      {/* White content area */}
      <View style={styles.content}>
        {/* Code type toggle */}
        <View style={styles.toggleRow}>
          <Pressable style={[styles.toggleBtn, styles.toggleActive]} onPress={() => {}}>
            <Text variant="bodySmall" style={styles.toggleActiveText}>CODE</Text>
          </Pressable>
          <Pressable style={styles.toggleBtn} onPress={() => router.replace('/(auth)/forgot-password')}>
            <Text variant="bodySmall" style={styles.toggleText}>Password</Text>
          </Pressable>
        </View>

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
            />
          ))}
        </View>

        {/* Verify button */}
        <Pressable
          style={[styles.verifyButton, !isComplete && styles.verifyButtonDisabled]}
          onPress={handleVerify}
          disabled={!isComplete}
        >
          <Text variant="body" style={styles.verifyText}>VERIFY</Text>
        </Pressable>

        {/* Resend */}
        <View style={styles.resendRow}>
          <Text variant="bodySmall" style={styles.resendLabel}>
            Didn't receive code?{' '}
          </Text>
          <Pressable onPress={handleResend} hitSlop={8}>
            <Text variant="bodySmall" style={styles.resendLink}>Resend Again</Text>
          </Pressable>
        </View>
      </View>
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
  email: {
    color: colors.textInverse,
    fontWeight: '500',
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
  },
  toggleRow: {
    flexDirection: 'row',
    marginBottom: spacing['2xl'],
    gap: spacing.sm,
  },
  toggleBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    backgroundColor: colors.backgroundSecondary,
  },
  toggleActive: {
    backgroundColor: colors.splashDark,
  },
  toggleActiveText: {
    color: colors.textInverse,
    fontWeight: '600',
  },
  toggleText: {
    color: colors.textSecondary,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  codeInput: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1.5,
    borderColor: colors.border,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  codeInputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
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
    marginBottom: spacing.xl,
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  resendLabel: {
    color: colors.textSecondary,
  },
  resendLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});
