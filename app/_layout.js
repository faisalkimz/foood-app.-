import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { ThemeProvider, useTheme } from '../src/providers/ThemeProvider';
import { useThemeStore } from '../src/store';

function AppStack() {
  const c = useTheme();
  const isDark = useThemeStore((s) => s.isDark);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
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
        <Stack.Screen name="restaurant/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="food/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="checkout/index" />
        <Stack.Screen name="checkout/payment" />
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
          <AppStack />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
