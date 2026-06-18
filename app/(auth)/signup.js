import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Input } from '../../src/components/ui';
import { useAuthStore } from '../../src/store';
import { colors, spacing, radius } from '../../src/theme';
import { useState } from 'react';

export default function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const login = useAuthStore((s) => s.login);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = () => {
    login({ id: '1', name: name || 'New User', email: email || 'user@foodorder.com' });
    router.push('/(auth)/verification');
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
          Please sign up to get started
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
            <Text variant="label" style={styles.inputLabel}>NAME</Text>
            <Input placeholder="John Doe" value={name} onChangeText={setName} />
          </View>

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

          <View style={styles.inputGroup}>
            <Text variant="label" style={styles.inputLabel}>PASSWORD</Text>
            <Input
              placeholder="••••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text variant="label" style={styles.inputLabel}>RE-TYPE PASSWORD</Text>
            <Input
              placeholder="••••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <Pressable style={styles.signupButton} onPress={handleSignup}>
            <Text variant="body" style={styles.signupButtonText}>SIGN UP</Text>
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
        </View>
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
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['2xl'],
  },
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
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
  },
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
  form: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.xs,
  },
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
  signupButtonText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginLabel: {
    color: colors.textSecondary,
  },
  loginLink: {
    color: colors.primary,
    fontWeight: '700',
  },
});
