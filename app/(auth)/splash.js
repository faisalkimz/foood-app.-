import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { FoodLogo } from '../../src/components/shared';
import { useTheme } from '../../src/providers/ThemeProvider';

/**
 * Single white splash screen with orange sunburst decoration.
 * Logo fades in → holds → navigates to onboarding.
 */
export default function SplashScreen() {
  const router = useRouter();
  const c = useTheme();

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const sunburstScale = useRef(new Animated.Value(0.3)).current;
  const sunburstOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Logo fades in
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: false,
      }),
      // Sunburst scales in
      Animated.parallel([
        Animated.spring(sunburstScale, {
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: false,
        }),
        Animated.timing(sunburstOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: false,
        }),
      ]),
      Animated.delay(900),
    ]).start(() => {
      router.replace('/(auth)/onboarding');
    });
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <StatusBar style={c.background === '#FFFFFF' ? 'dark' : 'light'} />

      {/* Orange sunburst arcs — bottom-right corner */}
      <Animated.View
        style={[
          styles.sunburst,
          {
            opacity: sunburstOpacity,
            transform: [{ scale: sunburstScale }],
          },
        ]}
      >
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <View
            key={i}
            style={[
              styles.arc,
              {
                backgroundColor: c.primary,
                width: (i + 1) * 75,
                height: (i + 1) * 75,
                borderRadius: ((i + 1) * 75) / 2,
                opacity: i % 2 === 0 ? 0.18 : 0.08,
              },
            ]}
          />
        ))}
      </Animated.View>

      {/* Small decorative dots */}
      <Animated.View style={[styles.decor, { opacity: sunburstOpacity }]}>
        <View style={[styles.dot, { backgroundColor: c.primary, width: 10, height: 10, top: '14%', right: '18%', opacity: 0.3 }]} />
        <View style={[styles.dot, { backgroundColor: c.primary, width: 6, height: 6, top: '24%', left: '14%', opacity: 0.2 }]} />
        <View style={[styles.dot, { backgroundColor: c.primary, width: 12, height: 12, top: '48%', right: '10%', opacity: 0.15 }]} />
        <View style={[styles.dot, { backgroundColor: c.primary, width: 8, height: 8, bottom: '42%', left: '20%', opacity: 0.2 }]} />
      </Animated.View>

      {/* Food logo — centered */}
      <Animated.View style={[styles.logoWrap, { opacity: logoOpacity }]}>
        <FoodLogo variant="light" size={52} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunburst: {
    position: 'absolute',
    bottom: -40,
    right: -40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arc: {
    position: 'absolute',
  },
  decor: {
    ...StyleSheet.absoluteFillObject,
  },
  dot: {
    position: 'absolute',
    borderRadius: 50,
  },
});
