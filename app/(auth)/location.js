import { useState } from 'react';
import { View, StyleSheet, Image, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Text } from '../../src/components/ui';
import { spacing, radius } from '../../src/theme';
import { useTheme } from '../../src/providers/ThemeProvider';
import { useLocationStore } from '../../src/store/locationStore';

export default function LocationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = useTheme();
  const setLocation = useLocationStore((s) => s.setLocation);
  const [detecting, setDetecting] = useState(false);

  const handleAccessLocation = async () => {
    if (detecting) return; // Prevent double-tap
    setDetecting(true);
    try {
      // 1. Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'We need location access to find restaurants near you. You can enable it later in Settings.',
          [
            { text: 'Skip', onPress: () => handleSkip() },
            { text: 'Try Again', onPress: () => { setDetecting(false); handleAccessLocation(); } },
          ]
        );
        setDetecting(false);
        return;
      }

      // 2. Get current position
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = position.coords;

      // 3. Reverse geocode to get address
      const [geo] = await Location.reverseGeocodeAsync({ latitude, longitude });

      const address = {
        name: geo?.name || geo?.street || 'My Location',
        street: geo?.street || '',
        city: geo?.city || geo?.subregion || '',
        region: geo?.region || '',
        country: geo?.country || '',
        postalCode: geo?.postalCode || '',
      };

      // 4. Save to store + Supabase (setLocation won't create duplicates now)
      await setLocation(address, { latitude, longitude });

      // 5. Navigate to home
      router.replace('/(tabs)');
    } catch (err) {
      Alert.alert(
        'Location Error',
        'Could not detect your location. Please try again or enter it manually.',
        [
          { text: 'Skip', onPress: () => handleSkip() },
          { text: 'Retry', onPress: () => { setDetecting(false); handleAccessLocation(); } },
        ]
      );
    } finally {
      setDetecting(false);
    }
  };

  const handleSkip = async () => {
    // Set a default location so the app still works
    await setLocation(
      { name: 'Location not set', street: '', city: '', region: '', country: '', postalCode: '' },
      null
    );
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background, paddingTop: insets.top, paddingBottom: insets.bottom + spacing.xl }]}>
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
        <Text variant="h2" style={[styles.title, { color: c.text }]}>Find Restaurants Near You</Text>
        <Text variant="bodySmall" style={[styles.subtitle, { color: c.textSecondary }]}>
          Allow location access so we can show you the best food options in your area.
        </Text>

        <Pressable
          style={[styles.locationBtn, { backgroundColor: c.primary }, detecting && styles.locationBtnDisabled]}
          onPress={handleAccessLocation}
          disabled={detecting}
        >
          {detecting ? (
            <>
              <ActivityIndicator color={c.textInverse} size="small" />
              <Text variant="body" style={[styles.locationBtnText, { color: c.textInverse }]}>DETECTING LOCATION...</Text>
            </>
          ) : (
            <>
              <Text variant="body" style={[styles.locationBtnText, { color: c.textInverse }]}>ACCESS LOCATION</Text>
              <View style={[styles.locationIcon, { backgroundColor: c.textInverse }]}>
                <Ionicons name="navigate" size={18} color={c.primary} />
              </View>
            </>
          )}
        </Pressable>

        <Pressable onPress={handleSkip} hitSlop={12}>
          <Text variant="bodySmall" style={[styles.skipText, { color: c.primary }]}>Skip for now</Text>
        </Pressable>

        <Text variant="caption" style={[styles.disclaimer, { color: c.textMuted }]}>
          FOODORDER WILL ACCESS YOUR LOCATION{'\n'}ONLY WHILE USING THE APP
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    gap: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.base,
    paddingHorizontal: spacing['2xl'],
    borderRadius: radius.full,
    gap: spacing.sm,
    width: '100%',
  },
  locationBtnDisabled: { opacity: 0.7 },
  locationBtnText: {
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  locationIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontWeight: '600',
    fontSize: 14,
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
});
