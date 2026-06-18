import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../src/components/ui';
import { colors, spacing, radius } from '../../src/theme';

export default function CongratulationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.xl }]}>
      {/* Success animation area */}
      <View style={styles.center}>
        {/* Success circle with checkmark */}
        <View style={styles.successCircleOuter}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={56} color={colors.textInverse} />
          </View>
        </View>

        {/* Decorative elements */}
        <View style={[styles.confetti, { top: '15%', left: '12%' }]}>
          <Ionicons name="star" size={16} color={colors.primary} />
        </View>
        <View style={[styles.confetti, { top: '20%', right: '15%' }]}>
          <Ionicons name="star" size={12} color={colors.warning} />
        </View>
        <View style={[styles.confetti, { top: '35%', left: '8%' }]}>
          <View style={[styles.confettiDot, { backgroundColor: colors.secondary }]} />
        </View>
        <View style={[styles.confetti, { top: '30%', right: '10%' }]}>
          <View style={[styles.confettiDot, { backgroundColor: colors.primary }]} />
        </View>
        <View style={[styles.confetti, { bottom: '40%', left: '18%' }]}>
          <Ionicons name="star" size={10} color={colors.secondary} />
        </View>
        <View style={[styles.confetti, { bottom: '38%', right: '20%' }]}>
          <View style={[styles.confettiDot, { backgroundColor: colors.warning }]} />
        </View>

        {/* Text */}
        <Text variant="h1" style={styles.title}>Congratulations!</Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          You successfully made a payment,{'\n'}enjoy our service!
        </Text>
      </View>

      {/* Track order button */}
      <View style={styles.bottom}>
        <Pressable
          style={styles.trackBtn}
          onPress={() => router.replace('/(tabs)/orders')}
        >
          <Text variant="body" style={styles.trackBtnText}>TRACK ORDER</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  successCircleOuter: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2xl'],
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confetti: {
    position: 'absolute',
  },
  confettiDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.textSecondary,
    lineHeight: 22,
    fontSize: 15,
  },
  bottom: {
    paddingHorizontal: spacing.xl,
  },
  trackBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.base,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  trackBtnText: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
