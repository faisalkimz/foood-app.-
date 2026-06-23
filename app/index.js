import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function Index() {
  const { isOnboarded, isAuthenticated, role, isLoading } = useAuthStore();

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
