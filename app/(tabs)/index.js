import { useState } from 'react';
import { View, ScrollView, StyleSheet, FlatList, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../src/components/ui';
import { SearchBar, RestaurantCard } from '../../src/components/shared';
import { useAuthStore } from '../../src/store';
import { useTheme } from '../../src/providers/ThemeProvider';
import { categories, restaurants } from '../../src/services/mock/data';
import { spacing, radius } from '../../src/theme';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const c = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('1');

  const selectedCatName = categories.find((cat) => cat.id === selectedCategory)?.name || 'All';
  const filteredRestaurants =
    selectedCatName === 'All'
      ? restaurants
      : restaurants.filter((r) => r.cuisine.toLowerCase().includes(selectedCatName.toLowerCase()));

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
      showsVerticalScrollIndicator={false}
    >
      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <View>
          <Pressable style={styles.deliverRow} onPress={() => router.push('/profile/address')}>
            <Text variant="caption" style={[styles.deliverLabel, { color: c.primary }]}>DELIVER TO</Text>
            <Ionicons name="chevron-down" size={14} color={c.primary} />
          </Pressable>
          <Text variant="body" style={[styles.address, { color: c.text }]}>Halal Lab office</Text>
        </View>
        <Pressable style={[styles.avatarBtn, { borderColor: c.primary }]} onPress={() => router.push('/(tabs)/profile')}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' }}
            style={styles.avatar}
          />
        </Pressable>
      </View>

      {/* Greeting */}
      <View style={styles.section}>
        <Text variant="body" style={[styles.greetingLight, { color: c.textSecondary }]}>
          Hey {user?.name?.split(' ')[0] || 'Halal'},{' '}
          <Text variant="h2" style={[styles.greetingBold, { color: c.text }]}>Good Afternoon!</Text>
        </Text>
      </View>

      {/* Search */}
      <View style={styles.section}>
        <SearchBar onPress={() => router.push('/(tabs)/search')} />
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="h3" style={{ color: c.text }}>All Categories</Text>
          <Pressable hitSlop={8} onPress={() => router.push('/(tabs)/search')}>
            <Text variant="bodySmall" style={{ color: c.primary }}>See All &gt;</Text>
          </Pressable>
        </View>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => (
            <Pressable style={styles.categoryItem} onPress={() => setSelectedCategory(item.id)}>
              <View style={[
                styles.categoryCircle,
                { backgroundColor: c.backgroundSecondary, borderColor: 'transparent' },
                selectedCategory === item.id && { borderColor: c.primary, backgroundColor: c.primaryLight },
              ]}>
                <Image source={{ uri: item.image }} style={styles.categoryImage} />
              </View>
              <Text variant="caption" style={[
                styles.categoryName,
                { color: c.textSecondary },
                selectedCategory === item.id && { color: c.primary, fontWeight: '700' },
              ]}>
                {item.name}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {/* Restaurants */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="h3" style={{ color: c.text }}>
            {selectedCatName === 'All' ? 'Open Restaurants' : `${selectedCatName} Restaurants`}
          </Text>
          <Pressable hitSlop={8} onPress={() => router.push('/(tabs)/search')}>
            <Text variant="bodySmall" style={{ color: c.primary }}>See All &gt;</Text>
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
            <Ionicons name="restaurant-outline" size={40} color={c.textMuted} />
            <Text variant="bodySmall" style={{ color: c.textMuted }}>
              No restaurants found for {selectedCatName}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.xl, paddingBottom: spacing.sm,
  },
  deliverRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  deliverLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  address: { fontWeight: '600', fontSize: 15 },
  avatarBtn: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', borderWidth: 2 },
  avatar: { width: '100%', height: '100%' },
  section: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  greetingLight: { fontSize: 16 },
  greetingBold: { fontWeight: '700', fontSize: 16 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md,
  },
  categoriesList: { gap: spacing.lg, paddingRight: spacing.xl },
  categoryItem: { alignItems: 'center', gap: spacing.xs },
  categoryCircle: {
    width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', borderWidth: 2,
  },
  categoryImage: { width: 36, height: 36, borderRadius: 18 },
  categoryName: { fontSize: 11, fontWeight: '500' },
  emptyCategory: {
    alignItems: 'center', justifyContent: 'center', paddingVertical: spacing['3xl'], gap: spacing.md,
  },
});
