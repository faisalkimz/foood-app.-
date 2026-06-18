import { View, StyleSheet, Image, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../src/components/ui';
import { colors, spacing, radius } from '../../src/theme';

export default function LocationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleAccessLocation = () => {
    // In a real app, request location permission here
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.xl }]}>
      {/* Map illustration */}
      <View style={styles.illustrationWrap}>
        <Image
          source={require('../../assets/images/location_map.png')}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>

      {/* Bottom content */}
      <View style={styles.bottomContent}>
        <Pressable style={styles.locationBtn} onPress={handleAccessLocation}>
          <Text variant="body" style={styles.locationBtnText}>ACCESS LOCATION</Text>
          <View style={styles.locationIcon}>
            <Ionicons name="navigate" size={18} color={colors.primary} />
          </View>
        </Pressable>

        <Text variant="caption" style={styles.disclaimer}>
          DFOOD WILL ACCESS YOUR LOCATION{'\n'}ONLY WHILE USING THE APP
        </Text>
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
  illustrationWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  illustration: {
    width: '90%',
    height: '80%',
  },
  bottomContent: {
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    gap: spacing.lg,
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing['2xl'],
    borderRadius: radius.full,
    gap: spacing.sm,
    width: '100%',
  },
  locationBtnText: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  locationIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.textInverse,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclaimer: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
});
