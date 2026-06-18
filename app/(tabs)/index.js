import { useState } from 'react';
import { View, ScrollView, StyleSheet, FlatList, Pressable, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../src/components/ui';
import { SearchBar, RestaurantCard } from '../../src/components/shared';
import { useAuthStore, useCartStore } from '../../src/store';
import { categories, restaurants } from '../../src/services/mock/data';
import { colors, spacing, radius } from '../../src/theme';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const [selectedCategory, setSelectedCategory] = useState('1');

  // Filter restaurants by selected category
  const selectedCatName = categories.find((c) => c.id === selectedCategory)?.name || 'All';
  const filteredRestaurants =
    selectedCatName === 'All'
      ? restaurants
      : restaurants.filter((r) =>
          r.cuisine.toLowerCase().includes(selectedCatName.toLowerCase())
        );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
      showsVerticalScrollIndicator={false}
    >
      {/* Top bar — DELIVER TO + avatar */}
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <View>
          <View style={styles.deliverRow}>
            <Text variant="caption" style={styles.deliverLabel}>DELIVER TO</Text>
            <Ionicons name="chevron-down" size={14} color={colors.primary} />
          </View>
          <Text variant="body" style={styles.address}>Halal Lab office</Text>
        </View>
        <Pressable style={styles.avatarBtn} onPress={() => router.push('/(tabs)/profile')}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' }}
            style={styles.avatar}
          />
        </Pressable>
      </View>

      {/* Greeting */}
      <View style={styles.section}>
        <Text variant="body" style={styles.greetingLight}>
          Hey {user?.name?.split(' ')[0] || 'Halal'},{' '}
          <Text variant="h2" style={styles.greetingBold}>Good Afternoon!</Text>
        </Text>
      </View>

      {/* Search bar */}
      <View style={styles.section}>
        <SearchBar onPress={() => router.push('/(tabs)/search')} />
      </View>

      {/* Categories — now tappable with filtering */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="h3">All Categories</Text>
          <Pressable hitSlop={8}>
            <Text variant="bodySmall" style={styles.seeAll}>See All &gt;</Text>
          </Pressable>
        </View>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => (
            <Pressable
              style={styles.categoryItem}
              onPress={() => setSelectedCategory(item.id)}
            >
              <View style={[
                styles.categoryCircle,
                selectedCategory === item.id && styles.categoryCircleActive,
              ]}>
                <Image source={{ uri: item.image }} style={styles.categoryImage} />
              </View>
              <Text
                variant="caption"
                style={[
                  styles.categoryName,
                  selectedCategory === item.id && styles.categoryNameActive,
                ]}
              >
                {item.name}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {/* Filtered Restaurants */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="h3">
            {selectedCatName === 'All' ? 'Open Restaurants' : `${selectedCatName} Restaurants`}
          </Text>
          <Pressable hitSlop={8}>
            <Text variant="bodySmall" style={styles.seeAll}>See All &gt;</Text>
          </Pressable>
        </View>
        {filteredRestaurants.length > 0 ? (
          filteredRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              onPress={() => router.push(`/restaurant/${restaurant.id}`)}
            />
          ))
        ) : (
          <View style={styles.emptyCategory}>
            <Ionicons name="restaurant-outline" size={40} color={colors.textMuted} />
            <Text variant="bodySmall" style={styles.emptyCategoryText}>
              No restaurants found for {selectedCatName}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
  },
  deliverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  deliverLabel: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  address: {
    fontWeight: '600',
    fontSize: 15,
    color: colors.text,
  },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  greetingLight: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  greetingBold: {
    fontWeight: '700',
    color: colors.text,
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  seeAll: {
    color: colors.primary,
    fontWeight: '500',
    fontSize: 13,
  },
  categoriesList: {
    gap: spacing.lg,
    paddingRight: spacing.xl,
  },
  categoryItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  categoryCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryCircleActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  categoryImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  categoryName: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  categoryNameActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  emptyCategory: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.md,
  },
  emptyCategoryText: {
    color: colors.textMuted,
  },
});
