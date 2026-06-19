import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store';

export default function Index() {
  const { isOnboarded, isAuthenticated, role } = useAuthStore();

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
