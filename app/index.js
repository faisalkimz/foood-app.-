import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore, useLocationStore } from '../src/store';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as Location from 'expo-location';

export default function Index() {
  const { isOnboarded, isAuthenticated, role, isLoading } = useAuthStore();
  const { isLocationSet, setLocation } = useLocationStore();

  // Auto-detect location silently on subsequent logins (not first signup)
  useEffect(() => {
    if (isAuthenticated && isLocationSet) {
      // Already has a location — try to refresh it silently in the background
      (async () => {
        try {
          const { status } = await Location.getForegroundPermissionsAsync();
          if (status === 'granted') {
            const position = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            const [geo] = await Location.reverseGeocodeAsync(position.coords);
            if (geo) {
              const address = {
                name: geo.name || geo.street || 'My Location',
                street: geo.street || '',
                city: geo.city || geo.subregion || '',
                region: geo.region || '',
                country: geo.country || '',
                postalCode: geo.postalCode || '',
              };
              await setLocation(address, position.coords);
            }
          }
        } catch {
          // Silently fail — keep old location
        }
      })();
    }
  }, [isAuthenticated, isLocationSet]);

  // Wait for session to be restored from AsyncStorage
  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  if (!isOnboarded) {
    return <Redirect href="/(auth)/splash" />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // Role-based routing
  if (role === 'chef') {
    return <Redirect href="/(chef)" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
