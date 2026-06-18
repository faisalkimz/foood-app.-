import { View, FlatList, StyleSheet, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Header, SearchBar, RestaurantCard } from '../../src/components/shared';
import { Text } from '../../src/components/ui';
import { restaurants, recentKeywords, suggestedRestaurants, popularFoods } from '../../src/services/mock/data';
import { useTheme } from '../../src/providers/ThemeProvider';
import { colors, spacing, radius } from '../../src/theme';

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const c = useTheme();

  const filtered = query
    ? restaurants.filter(
        (r) =>
          r.name.toLowerCase().includes(query.toLowerCase()) ||
          r.cuisine.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const showResults = query.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Header title="Search" showBack onBack={() => router.back()} />

      <View style={styles.searchWrapper}>
        <SearchBar value={query} onChangeText={setQuery} autoFocus />
      </View>

      {showResults ? (
        /* Search results */
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.xl, paddingBottom: insets.bottom + spacing.xl }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color={colors.textMuted} />
              <Text variant="body" style={styles.emptyText}>No results found</Text>
            </View>
          }
          renderItem={({ item }) => (
            <RestaurantCard
              restaurant={item}
              onPress={() => router.push(`/restaurant/${item.id}`)}
            />
          )}
        />
      ) : (
        /* Default state — keywords + suggestions + popular */
        <FlatList
          data={[{ key: 'content' }]}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
          renderItem={() => (
            <View>
              {/* Recent Keywords */}
              <View style={styles.section}>
                <Text variant="h3" style={styles.sectionTitle}>Recent Keywords</Text>
                <View style={styles.tagsRow}>
                  {recentKeywords.map((keyword, idx) => (
                    <Pressable
                      key={idx}
                      style={styles.tag}
                      onPress={() => setQuery(keyword)}
                    >
                      <Text variant="bodySmall" style={styles.tagText}>{keyword}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Suggested Restaurants */}
              <View style={styles.section}>
                <Text variant="h3" style={styles.sectionTitle}>Suggested Restaurants</Text>
                {suggestedRestaurants.map((r) => {
                  const full = restaurants.find((rest) => rest.id === r.id);
                  return (
                    <Pressable
                      key={r.id}
                      style={styles.suggestedItem}
                      onPress={() => router.push(`/restaurant/${r.id}`)}
                    >
                      <Image
                        source={{ uri: full?.image }}
                        style={styles.suggestedImage}
                      />
                      <View style={styles.suggestedInfo}>
                        <Text variant="body" style={styles.suggestedName}>{r.name}</Text>
                        <View style={styles.suggestedRating}>
                          <Ionicons name="star" size={12} color={colors.rating} />
                          <Text variant="caption">{r.rating}</Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              {/* Popular Fast Food */}
              <View style={styles.section}>
                <Text variant="h3" style={styles.sectionTitle}>Popular Fast Food</Text>
                <View style={styles.popularRow}>
                  {popularFoods.map((food) => (
                    <Pressable
                      key={food.id}
                      style={styles.popularCard}
                      onPress={() => setQuery(food.name)}
                    >
                      <Image source={{ uri: food.image }} style={styles.popularImage} />
                      <Text variant="body" style={styles.popularName} numberOfLines={1}>
                        {food.name}
                      </Text>
                      <Text variant="caption" numberOfLines={1}>{food.restaurant}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchWrapper: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: radius.full,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  suggestedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  suggestedImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  suggestedInfo: {
    flex: 1,
  },
  suggestedName: {
    fontWeight: '600',
    fontSize: 15,
  },
  suggestedRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  popularRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  popularCard: {
    flex: 1,
    gap: spacing.xs,
  },
  popularImage: {
    width: '100%',
    height: 100,
    borderRadius: radius.md,
  },
  popularName: {
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing['4xl'],
    gap: spacing.md,
  },
  emptyText: {
    color: colors.textMuted,
  },
});
