import { useState, useEffect, useCallback } from 'react';
import {
  View, ScrollView, StyleSheet, FlatList, Pressable,
  Image, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Skeleton } from '../../src/components/ui';
import { SearchBar, RestaurantCard } from '../../src/components/shared';
import { useAuthStore, useLocationStore } from '../../src/store';
import { useTheme } from '../../src/providers/ThemeProvider';
import { fetchRestaurants } from '../../src/services/restaurantService';
import { spacing, radius } from '../../src/theme';

// Food categories (static UI filter — not from DB)
const categories = [
  { id: 'all', name: 'All', emoji: '🍽️' },
  { id: 'burger', name: 'Burger', emoji: '🍔' },
  { id: 'pizza', name: 'Pizza', emoji: '🍕' },
  { id: 'chicken', name: 'Chicken', emoji: '🍗' },
  { id: 'sushi', name: 'Sushi', emoji: '🍣' },
  { id: 'pasta', name: 'Pasta', emoji: '🍝' },
  { id: 'salad', name: 'Salad', emoji: '🥗' },
  { id: 'dessert', name: 'Dessert', emoji: '🍰' },
  { id: 'coffee', name: 'Coffee', emoji: '☕' },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const savedAddresses = useLocationStore((s) => s.savedAddresses);
  const selectedAddressId = useLocationStore((s) => s.selectedAddressId);
  const address = savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses[0] || null;
  const c = useTheme();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadRestaurants = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      const data = await fetchRestaurants();
      setRestaurants(data);
    } catch (err) {
      setError('Could not load restaurants. Pull down to retry.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRestaurants();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadRestaurants(true);
  };

  // Filter by selected category
  const filteredRestaurants = selectedCategory === 'all'
    ? restaurants
    : restaurants.filter((r) =>
        r.cuisine.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        r.name.toLowerCase().includes(selectedCategory.toLowerCase())
      );

  // Address display
  const displayAddress = address
    ? [address.name, address.street].filter(Boolean).join(', ') || address.city || 'My Location'
    : 'Set delivery location';
  const displayCity = address
    ? [address.city, address.country].filter(Boolean).join(', ')
    : null;
  const displayLabel = address?.label || null;

  // Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning!' : hour < 17 ? 'Good Afternoon!' : 'Good Evening!';
  const firstName = user?.full_name?.split(' ')[0] || user?.name?.split(' ')[0] || 'there';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={c.primary}
          colors={[c.primary]}
        />
      }
    >
      {/* ── Top bar ── */}
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <View style={{ flex: 1 }}>
          <Pressable style={styles.deliverRow} onPress={() => router.push('/profile/address')}>
            <Text variant="caption" style={[styles.deliverLabel, { color: c.primary }]}>DELIVER TO</Text>
            {displayLabel ? (
              <View style={[styles.labelBadge, { backgroundColor: c.primaryLight }]}>
                <Text variant="caption" style={{ color: c.primary, fontWeight: '700', fontSize: 10 }}>
                  {displayLabel.toUpperCase()}
                </Text>
              </View>
            ) : null}
            <Ionicons name="chevron-down" size={14} color={c.primary} />
          </Pressable>
          <Text variant="body" style={[styles.address, { color: c.text }]} numberOfLines={1}>
            {displayAddress}
          </Text>
          {displayCity ? (
            <Text variant="caption" style={{ color: c.textMuted, fontSize: 11, marginTop: 1 }}>
              {displayCity}
            </Text>
          ) : null}
        </View>
        <Pressable
          style={[styles.avatarBtn, { borderColor: c.primary }]}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Image
            source={{ uri: user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'U')}&background=FF6B35&color=fff&bold=true` }}
            style={styles.avatar}
          />
        </Pressable>
      </View>

      {/* ── Greeting ── */}
      <View style={styles.section}>
        <Text variant="body" style={[styles.greetingLight, { color: c.textSecondary }]}>
          Hey {firstName},{' '}
          <Text variant="h2" style={[styles.greetingBold, { color: c.text }]}>{greeting}</Text>
        </Text>
      </View>

      {/* ── Search ── */}
      <View style={styles.section}>
        <SearchBar
          placeholder="Search restaurants or food…"
          onPress={() => router.push('/(tabs)/search')}
          editable={false}
        />
      </View>

      {/* ── Categories ── */}
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
        style={{ marginBottom: spacing.md }}
        renderItem={({ item }) => {
          const active = selectedCategory === item.id;
          return (
            <Pressable
              style={styles.categoryItem}
              onPress={() => setSelectedCategory(item.id)}
            >
              <View style={[
                styles.categoryCircle,
                { borderColor: active ? c.primary : c.borderLight, backgroundColor: active ? c.primaryLight : c.backgroundSecondary },
              ]}>
                <Text style={{ fontSize: 26 }}>{item.emoji}</Text>
              </View>
              <Text
                variant="caption"
                style={[styles.categoryName, { color: active ? c.primary : c.textSecondary, fontWeight: active ? '700' : '500' }]}
              >
                {item.name}
              </Text>
            </Pressable>
          );
        }}
      />

      {/* ── Restaurants ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="h3" style={{ color: c.text }}>
            {selectedCategory === 'all' ? 'All Restaurants' : `${categories.find(c => c.id === selectedCategory)?.name} Spots`}
          </Text>
          <Text variant="bodySmall" style={{ color: c.textMuted }}>
            {filteredRestaurants.length} open
          </Text>
        </View>

        {/* Loading */}
        {isLoading && <Skeleton.Home />}

        {/* Error */}
        {!isLoading && error && (
          <View style={styles.centerState}>
            <Ionicons name="cloud-offline-outline" size={48} color={c.textMuted} />
            <Text variant="body" style={{ color: c.textSecondary, textAlign: 'center', marginTop: spacing.md }}>
              {error}
            </Text>
          </View>
        )}

        {/* Empty (no restaurants in DB yet) */}
        {!isLoading && !error && filteredRestaurants.length === 0 && (
          <View style={styles.centerState}>
            <Text style={{ fontSize: 48 }}>🍽️</Text>
            <Text variant="h3" style={{ color: c.text, textAlign: 'center', marginTop: spacing.md }}>
              No Restaurants Yet
            </Text>
            <Text variant="bodySmall" style={{ color: c.textSecondary, textAlign: 'center', lineHeight: 20 }}>
              {selectedCategory !== 'all'
                ? `No ${categories.find(c => c.id === selectedCategory)?.name} restaurants found. Try a different category.`
                : 'Restaurants will appear here once chefs set up their profiles.'}
            </Text>
          </View>
        )}

        {/* Restaurants list */}
        {!isLoading && !error && filteredRestaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            onPress={() => router.push(`/restaurant/${restaurant.id}`)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: spacing.xl, paddingBottom: spacing.sm,
  },
  deliverRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  deliverLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  labelBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  address: { fontWeight: '600', fontSize: 15 },
  avatarBtn: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', borderWidth: 2, marginLeft: spacing.md },
  avatar: { width: '100%', height: '100%' },
  section: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  greetingLight: { fontSize: 16 },
  greetingBold: { fontWeight: '700', fontSize: 16 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md,
  },
  categoriesList: { gap: spacing.lg, paddingHorizontal: spacing.xl, paddingRight: spacing.xl },
  categoryItem: { alignItems: 'center', gap: spacing.xs },
  categoryCircle: {
    width: 62, height: 62, borderRadius: 31,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2,
  },
  categoryName: { fontSize: 11 },
  centerState: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: spacing['3xl'], gap: spacing.sm,
  },
});
