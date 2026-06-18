import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store';

export default function Index() {
  const { isOnboarded, isAuthenticated } = useAuthStore();

  if (!isOnboarded) {
    return <Redirect href="/(auth)/splash" />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
