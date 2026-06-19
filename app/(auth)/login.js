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

  const handleLogin = () => {
    login(
      { id: '1', name: 'Guest User', email: email || 'guest@foodorder.com' },
      'customer'
    );
    router.replace('/(auth)/location');
  };

  const handleChefLogin = () => {
    login(
      { id: '2', name: 'Chef User', email: email || 'chef@foodorder.com' },
      'chef'
    );
    router.replace('/(chef)');
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

          <Pressable style={[styles.loginButton, styles.chefButton]} onPress={handleChefLogin}>
            <Ionicons name="restaurant" size={18} color="#FFF" style={{ marginRight: 6 }} />
            <Text variant="body" style={styles.loginButtonText}>LOGIN AS CHEF</Text>
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
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  chefButton: {
    backgroundColor: '#22C55E',
    marginTop: spacing.xs,
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
