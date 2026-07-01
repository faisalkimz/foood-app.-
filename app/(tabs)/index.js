import { useState, useEffect, useCallback } from 'react';
import {
  View, ScrollView, StyleSheet, FlatList, Pressable,
  Image, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Skeleton } from '@/components/ui';
import { SearchBar, RestaurantCard } from '@/components/shared';
import { useAuthStore, useLocationStore } from '@/store';
import { useTheme } from '@/providers/ThemeProvider';
import { fetchRestaurants } from '@/services/restaurantService';
import { supabase } from '@/services/supabase';
import { spacing, radius } from '@/theme';

import { CATEGORIES as categories } from '@/constants';

const CATEGORY_KEYWORDS = {
  burger: ['burger', 'burgers', 'hamburger'],
  pizza: ['pizza', 'pizzas'],
  chicken: ['chicken', 'fried chicken', 'grilled chicken', 'pollo'],
  sushi: ['sushi', 'sashimi', 'maki', 'japanese'],
  pasta: ['pasta', 'spaghetti', 'noodles', 'macaroni'],
  salad: ['salad', 'salads', 'wrap', 'bowl'],
  dessert: ['dessert', 'desserts', 'cake', 'ice cream', 'pastry', 'sweet'],
  coffee: ['coffee', 'cafe', 'coffee shop', 'tea', 'beverage', 'drinks'],
};

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
  const [favouriteIds, setFavouriteIds] = useState(new Set());

  const loadFavourites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('favourites')
        .select('restaurant_id')
        .eq('user_id', user.id);
      if (data) setFavouriteIds(new Set(data.map((f) => f.restaurant_id)));
    } catch { /* silent */ }
  };

  const toggleFavourite = async (restaurantId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/(auth)/login');
      return;
    }
    if (favouriteIds.has(restaurantId)) {
      await supabase.from('favourites').delete().eq('user_id', user.id).eq('restaurant_id', restaurantId);
      setFavouriteIds((prev) => { const next = new Set(prev); next.delete(restaurantId); return next; });
    } else {
      await supabase.from('favourites').insert({ user_id: user.id, restaurant_id: restaurantId });
      setFavouriteIds((prev) => new Set(prev).add(restaurantId));
    }
  };

  const loadRestaurants = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      const data = await fetchRestaurants();
      setRestaurants(data);
      loadFavourites();
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

  const filteredRestaurants = selectedCategory === 'all'
    ? restaurants
    : restaurants.filter((r) => {
        const keywords = CATEGORY_KEYWORDS[selectedCategory] || [selectedCategory];
        const cuisine = (r.cuisine || '').toLowerCase();
        const name = (r.name || '').toLowerCase();
        return keywords.some(kw => cuisine.includes(kw) || name.includes(kw));
      });

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
            isFavourite={favouriteIds.has(restaurant.id)}
            onToggleFavourite={toggleFavourite}
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
