import { useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../src/components/ui';
import { useTheme } from '../../src/providers/ThemeProvider';
import { spacing, radius } from '../../src/theme';

export default function CongratulationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = useTheme();

  // Animated values for entrance
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      // Bounce in the checkmark circle
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }),
      // Fade in the text
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.xl, backgroundColor: c.background }]}>
      {/* Success content */}
      <View style={styles.center}>
        {/* Animated checkmark */}
        <Animated.View style={[styles.successOuter, { backgroundColor: c.primaryLight, transform: [{ scale: scaleAnim }] }]}>
          <View style={[styles.successCircle, { backgroundColor: c.primary }]}>
            <Ionicons name="checkmark" size={56} color={c.textInverse} />
          </View>
        </Animated.View>

        {/* Confetti stars */}
        <View style={[styles.confetti, { top: '12%', left: '10%' }]}>
          <Ionicons name="star" size={18} color={c.primary} />
        </View>
        <View style={[styles.confetti, { top: '18%', right: '12%' }]}>
          <Ionicons name="star" size={14} color={c.warning} />
        </View>
        <View style={[styles.confetti, { top: '32%', left: '6%' }]}>
          <View style={[styles.confettiDot, { backgroundColor: c.secondary }]} />
        </View>
        <View style={[styles.confetti, { top: '28%', right: '8%' }]}>
          <View style={[styles.confettiDot, { backgroundColor: c.primary }]} />
        </View>
        <View style={[styles.confetti, { bottom: '42%', left: '16%' }]}>
          <Ionicons name="star" size={12} color={c.secondary} />
        </View>
        <View style={[styles.confetti, { bottom: '36%', right: '18%' }]}>
          <View style={[styles.confettiDot, { backgroundColor: c.warning }]} />
        </View>

        {/* Animated text */}
        <Animated.View style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          alignItems: 'center',
        }}>
          <Text variant="h1" style={[styles.title, { color: c.text }]}>Congratulations!</Text>
          <Text variant="bodySmall" style={[styles.subtitle, { color: c.textSecondary }]}>
            You successfully made a payment,{'\n'}enjoy our service!
          </Text>
        </Animated.View>
      </View>

      {/* Track order button */}
      <Animated.View style={[styles.bottom, { opacity: fadeAnim }]}>
        <Pressable
          style={[styles.trackBtn, { backgroundColor: c.primary }]}
          onPress={() => router.replace('/order/oo1')}
        >
          <Text variant="body" style={[styles.trackBtnText, { color: c.textInverse }]}>TRACK ORDER</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  successOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2xl'],
  },
  successCircle: {
    width: 105,
    height: 105,
    borderRadius: 53,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confetti: { position: 'absolute' },
  confettiDot: { width: 10, height: 10, borderRadius: 5 },
  title: {
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 15,
  },
  bottom: { paddingHorizontal: spacing.xl },
  trackBtn: {
    paddingVertical: spacing.base,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  trackBtnText: {
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
