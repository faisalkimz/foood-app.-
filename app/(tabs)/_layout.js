import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/providers/ThemeProvider';
import { useCartStore } from '../../src/store';

export default function TabsLayout() {
  const itemCount = useCartStore((s) => s.getItemCount());
  const c = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.tabBarActive,
        tabBarInactiveTintColor: c.tabBarInactive,
        tabBarStyle: {
          backgroundColor: c.tabBar,
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
        tabBarIconStyle: { marginTop: 2 },
      }}
    >
      <Tabs.Screen name="index" options={{
        title: 'Home',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
        ),
      }} />
      <Tabs.Screen name="search" options={{
        title: 'Search',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'search' : 'search-outline'} size={24} color={color} />
        ),
      }} />
      <Tabs.Screen name="cart" options={{
        title: 'Cart',
        tabBarBadge: itemCount > 0 ? itemCount : undefined,
        tabBarBadgeStyle: {
          backgroundColor: c.primary, color: c.textInverse, fontSize: 10,
          fontWeight: '700', minWidth: 18, height: 18, lineHeight: 18,
        },
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'cart' : 'cart-outline'} size={24} color={color} />
        ),
      }} />
      <Tabs.Screen name="orders" options={{
        title: 'Orders',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={24} color={color} />
        ),
      }} />
      <Tabs.Screen name="profile" options={{
        title: 'Profile',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
        ),
      }} />
    </Tabs>
  );
}
