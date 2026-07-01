import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { ThemeProvider, useTheme } from '@/providers/ThemeProvider';
import { ToastProvider } from '@/components/ui';
import ErrorBoundary from '@/components/ErrorBoundary';
import NetworkBanner from '@/components/NetworkBanner';
import { useThemeStore } from '@/store';
import { useAuthStore } from '@/store/authStore';
import { useLocationStore } from '@/store/locationStore';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { supabase } from '@/services/supabase';
import { getProfile } from '@/services/authService';

function AppStack() {
  const c = useTheme();
  const isDark = useThemeStore((s) => s.isDark);
  const { initialize, login, logout, isLoading } = useAuthStore();
  const initializeLocation = useLocationStore((s) => s.initialize);
  const clearLocation = useLocationStore((s) => s.clearLocation);

  // Initialize push notifications globally
  const { user } = useAuthStore();
  usePushNotifications(user);

  useEffect(() => {
    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'INITIAL_SESSION') return;

        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const profile = await getProfile(session.user.id);
            login({ ...session.user, ...profile }, profile.role || 'customer');
          } catch {
            login(session.user, 'customer');
          }
          initializeLocation();
        } else if (event === 'SIGNED_OUT') {
          logout();
          clearLocation();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Show spinner while restoring session
  if (isLoading) {
    return (
      <View style={[styles.loader, { backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NetworkBanner />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: c.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(chef)" options={{ gestureEnabled: false }} />
        <Stack.Screen name="restaurant/[id]" options={{ presentation: 'card', gestureEnabled: true }} />
        <Stack.Screen name="food/[id]" options={{ presentation: 'modal', gestureEnabled: true }} />
        <Stack.Screen name="checkout/index" options={{ gestureEnabled: false }} />
        <Stack.Screen name="checkout/payment" options={{ gestureEnabled: false }} />
        <Stack.Screen
          name="checkout/congratulations"
          options={{ gestureEnabled: false, animation: 'fade' }}
        />
        <Stack.Screen name="order/[id]" />
        <Stack.Screen name="order/chat" />
        <Stack.Screen name="order/call" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
        <Stack.Screen name="profile/edit" />
        <Stack.Screen name="profile/address" />
        <Stack.Screen name="profile/notifications" />
        <Stack.Screen name="profile/favourites" />
        <Stack.Screen name="profile/payment-methods" />
        <Stack.Screen name="profile/faqs" />
        <Stack.Screen name="profile/reviews" />
        <Stack.Screen name="profile/settings" />
        {/* Chef sub-screens */}
        <Stack.Screen name="chef/add-item" />
        <Stack.Screen name="chef/edit-item" />
        <Stack.Screen name="chef/order-detail" />
        <Stack.Screen name="chef/restaurant-info" />
        <Stack.Screen name="chef/earnings" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ToastProvider>
            <ErrorBoundary>
              <AppStack />
            </ErrorBoundary>
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
