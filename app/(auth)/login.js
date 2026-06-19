import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Input } from '../../src/components/ui';
import { useAuthStore } from '../../src/store';
import { colors, spacing, radius } from '../../src/theme';
import { useState } from 'react';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // 'customer' | 'chef'

  const handleLogin = () => {
    login(
      { id: '1', name: role === 'chef' ? 'Chef User' : 'Guest User', email: email || 'guest@foodorder.com' },
      role
    );
    if (role === 'chef') {
      router.replace('/(chef)');
    } else {
      router.replace('/(auth)/location');
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
          Please sign in to your existing account
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
          {/* Role toggle */}
          <View style={styles.roleRow}>
            <Pressable
              style={[styles.rolePill, role === 'customer' && styles.rolePillActive]}
              onPress={() => setRole('customer')}
            >
              <Ionicons name="person" size={16} color={role === 'customer' ? colors.textInverse : colors.primary} />
              <Text variant="bodySmall" style={[styles.roleText, role === 'customer' && styles.roleTextActive]}>Customer</Text>
            </Pressable>
            <Pressable
              style={[styles.rolePill, role === 'chef' && styles.rolePillActive]}
              onPress={() => setRole('chef')}
            >
              <Ionicons name="restaurant" size={16} color={role === 'chef' ? colors.textInverse : colors.primary} />
              <Text variant="bodySmall" style={[styles.roleText, role === 'chef' && styles.roleTextActive]}>Chef</Text>
            </Pressable>
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

          <Pressable onPress={() => router.push('/(auth)/forgot-password')} hitSlop={8}>
            <Text variant="bodySmall" style={styles.forgotText}>
              Forgot Password
            </Text>
          </Pressable>

          <Pressable style={styles.loginButton} onPress={handleLogin}>
            <Text variant="body" style={styles.loginButtonText}>LOG IN</Text>
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

          <Text variant="bodySmall" style={styles.orText}>Or</Text>

          {/* Social login icons */}
          <View style={styles.socialRow}>
            <Pressable style={[styles.socialButton, styles.socialFacebook]} onPress={handleLogin}>
              <Ionicons name="logo-facebook" size={24} color={colors.textInverse} />
            </Pressable>
            <Pressable style={[styles.socialButton, styles.socialTwitter]} onPress={handleLogin}>
              <Ionicons name="logo-twitter" size={24} color={colors.textInverse} />
            </Pressable>
            <Pressable style={[styles.socialButton, styles.socialApple]} onPress={handleLogin}>
              <Ionicons name="logo-apple" size={24} color={colors.textInverse} />
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
  roleRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  rolePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  rolePillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleText: {
    fontWeight: '700',
    color: colors.primary,
    fontSize: 14,
  },
  roleTextActive: {
    color: colors.textInverse,
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
  forgotText: {
    color: colors.primary,
    fontWeight: '500',
    textAlign: 'right',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.base,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  loginButtonText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  signUpRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signUpLabel: {
    color: colors.textSecondary,
  },
  signUpLink: {
    color: colors.primary,
    fontWeight: '700',
  },
  orText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  socialRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialFacebook: {
    backgroundColor: '#395998',
  },
  socialTwitter: {
    backgroundColor: '#169CE8',
  },
  socialApple: {
    backgroundColor: '#1A1A1A',
  },
});
