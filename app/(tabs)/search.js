import { View, FlatList, StyleSheet, Pressable, Image, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useMemo } from 'react';
import { Header, SearchBar, RestaurantCard } from '../../src/components/shared';
import { Text } from '../../src/components/ui';
import { restaurants, recentKeywords, suggestedRestaurants, popularFoods, categories } from '../../src/services/mock/data';
import { useTheme } from '../../src/providers/ThemeProvider';
import { spacing, radius } from '../../src/theme';

const SORT_OPTIONS = ['Relevance', 'Rating', 'Delivery Time', 'Distance'];
const PRICE_RANGES = ['$', '$$', '$$$', '$$$$'];

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const c = useTheme();

  // Filter state
  const [showFilter, setShowFilter] = useState(false);
  const [selectedSort, setSelectedSort] = useState('Relevance');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [freeDeliveryOnly, setFreeDeliveryOnly] = useState(false);

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((item) => item !== cat) : [...prev, cat]
    );
  };

  const togglePrice = (p) => {
    setSelectedPrices((prev) =>
      prev.includes(p) ? prev.filter((v) => v !== p) : [...prev, p]
    );
  };

  const resetFilters = () => {
    setSelectedSort('Relevance');
    setSelectedCategories([]);
    setSelectedPrices([]);
    setFreeDeliveryOnly(false);
  };

  const activeFilterCount = selectedCategories.length + selectedPrices.length + (freeDeliveryOnly ? 1 : 0) + (selectedSort !== 'Relevance' ? 1 : 0);

  const filtered = useMemo(() => {
    let results = restaurants;

    if (query) {
      results = results.filter(
        (r) =>
          r.name.toLowerCase().includes(query.toLowerCase()) ||
          r.cuisine.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (selectedCategories.length > 0) {
      results = results.filter((r) =>
        selectedCategories.some((cat) => r.cuisine.toLowerCase().includes(cat.toLowerCase()))
      );
    }

    if (freeDeliveryOnly) {
      results = results.filter((r) => r.freeDelivery);
    }

    // Sort
    if (selectedSort === 'Rating') {
      results = [...results].sort((a, b) => b.rating - a.rating);
    } else if (selectedSort === 'Delivery Time') {
      results = [...results].sort((a, b) => parseInt(a.deliveryTime) - parseInt(b.deliveryTime));
    }

    return results;
  }, [query, selectedCategories, selectedPrices, freeDeliveryOnly, selectedSort]);

  const showResults = query.length > 0 || activeFilterCount > 0;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Header title="Search" showBack onBack={() => router.back()} />

      {/* Search + filter row */}
      <View style={styles.searchRow}>
        <View style={styles.searchFlex}>
          <SearchBar value={query} onChangeText={setQuery} autoFocus />
        </View>
        <Pressable
          style={[styles.filterBtn, { backgroundColor: activeFilterCount > 0 ? c.primary : c.backgroundSecondary }]}
          onPress={() => setShowFilter(true)}
        >
          <Ionicons name="options" size={20} color={activeFilterCount > 0 ? '#FFF' : c.text} />
          {activeFilterCount > 0 && (
            <View style={[styles.filterBadge, { backgroundColor: '#FFF' }]}>
              <Text variant="caption" style={{ color: c.primary, fontWeight: '800', fontSize: 10 }}>
                {activeFilterCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {showResults ? (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.xl, paddingBottom: insets.bottom + spacing.xl }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color={c.textMuted} />
              <Text variant="body" style={{ color: c.textMuted }}>No results found</Text>
              <Text variant="caption">Try adjusting your filters</Text>
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
                      style={[styles.tag, { backgroundColor: c.backgroundSecondary, borderColor: c.border }]}
                      onPress={() => setQuery(keyword)}
                    >
                      <Text variant="bodySmall" style={{ color: c.textSecondary, fontSize: 13 }}>{keyword}</Text>
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
                      <Image source={{ uri: full?.image }} style={styles.suggestedImage} />
                      <View style={styles.suggestedInfo}>
                        <Text variant="body" style={{ fontWeight: '600', fontSize: 15, color: c.text }}>{r.name}</Text>
                        <View style={styles.suggestedRating}>
                          <Ionicons name="star" size={12} color="#FFB800" />
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
                      <Text variant="body" style={{ fontWeight: '600', fontSize: 14, color: c.text }} numberOfLines={1}>
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

      {/* Filter Modal */}
      <Modal visible={showFilter} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowFilter(false)} />
          <View style={[styles.modalContent, { backgroundColor: c.background, paddingBottom: insets.bottom + spacing.xl }]}>
            {/* Modal header */}
            <View style={styles.modalHeader}>
              <Text variant="h3" style={{ color: c.text }}>Filters</Text>
              <Pressable onPress={() => setShowFilter(false)} hitSlop={8}>
                <Ionicons name="close" size={24} color={c.text} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xl }}>
              {/* Sort */}
              <View>
                <Text variant="label" style={[styles.filterLabel, { color: c.textMuted }]}>SORT BY</Text>
                <View style={styles.chipRow}>
                  {SORT_OPTIONS.map((opt) => (
                    <Pressable
                      key={opt}
                      style={[
                        styles.chip,
                        { borderColor: c.border, backgroundColor: c.backgroundSecondary },
                        selectedSort === opt && { backgroundColor: c.primary, borderColor: c.primary },
                      ]}
                      onPress={() => setSelectedSort(opt)}
                    >
                      <Text variant="bodySmall" style={[
                        { color: c.textSecondary, fontWeight: '600' },
                        selectedSort === opt && { color: '#FFF' },
                      ]}>
                        {opt}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Categories */}
              <View>
                <Text variant="label" style={[styles.filterLabel, { color: c.textMuted }]}>CATEGORY</Text>
                <View style={styles.chipRow}>
                  {categories.map((cat) => (
                    <Pressable
                      key={cat.id}
                      style={[
                        styles.chip,
                        { borderColor: c.border, backgroundColor: c.backgroundSecondary },
                        selectedCategories.includes(cat.name) && { backgroundColor: c.primary, borderColor: c.primary },
                      ]}
                      onPress={() => toggleCategory(cat.name)}
                    >
                      <Text variant="bodySmall" style={[
                        { color: c.textSecondary, fontWeight: '600' },
                        selectedCategories.includes(cat.name) && { color: '#FFF' },
                      ]}>
                        {cat.emoji} {cat.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Price range */}
              <View>
                <Text variant="label" style={[styles.filterLabel, { color: c.textMuted }]}>PRICE RANGE</Text>
                <View style={styles.chipRow}>
                  {PRICE_RANGES.map((p) => (
                    <Pressable
                      key={p}
                      style={[
                        styles.priceChip,
                        { borderColor: c.border, backgroundColor: c.backgroundSecondary },
                        selectedPrices.includes(p) && { backgroundColor: c.primary, borderColor: c.primary },
                      ]}
                      onPress={() => togglePrice(p)}
                    >
                      <Text variant="body" style={[
                        { color: c.textSecondary, fontWeight: '700' },
                        selectedPrices.includes(p) && { color: '#FFF' },
                      ]}>
                        {p}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Free delivery */}
              <Pressable
                style={[styles.toggleRow, { backgroundColor: c.backgroundSecondary, borderColor: freeDeliveryOnly ? c.primary : c.border }]}
                onPress={() => setFreeDeliveryOnly(!freeDeliveryOnly)}
              >
                <Ionicons name="bicycle" size={20} color={freeDeliveryOnly ? c.primary : c.textMuted} />
                <Text variant="body" style={{ flex: 1, fontWeight: '600', color: c.text }}>
                  Free Delivery Only
                </Text>
                <Ionicons
                  name={freeDeliveryOnly ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={freeDeliveryOnly ? c.primary : c.textMuted}
                />
              </Pressable>
            </ScrollView>

            {/* Bottom buttons */}
            <View style={styles.modalActions}>
              <Pressable style={[styles.resetBtn, { borderColor: c.border }]} onPress={resetFilters}>
                <Text variant="body" style={{ color: c.text, fontWeight: '600' }}>Reset</Text>
              </Pressable>
              <Pressable style={[styles.applyBtn, { backgroundColor: c.primary }]} onPress={() => setShowFilter(false)}>
                <Text variant="body" style={{ color: '#FFF', fontWeight: '700' }}>
                  Apply{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.xl, paddingBottom: spacing.sm,
  },
  searchFlex: { flex: 1 },
  filterBtn: {
    width: 46, height: 46, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute', top: 4, right: 4,
    width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
  },
  section: { paddingHorizontal: spacing.xl, marginBottom: spacing.xl },
  sectionTitle: { marginBottom: spacing.md },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tag: {
    paddingVertical: spacing.sm, paddingHorizontal: spacing.base,
    borderRadius: radius.full, borderWidth: 1,
  },
  suggestedItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  suggestedImage: { width: 44, height: 44, borderRadius: 22 },
  suggestedInfo: { flex: 1 },
  suggestedRating: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  popularRow: { flexDirection: 'row', gap: spacing.md },
  popularCard: { flex: 1, gap: spacing.xs },
  popularImage: { width: '100%', height: 100, borderRadius: radius.md },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: spacing.md },

  // Filter Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: spacing.xl, paddingTop: spacing.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.xl,
  },
  filterLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingVertical: spacing.sm, paddingHorizontal: spacing.base,
    borderRadius: radius.full, borderWidth: 1.5,
  },
  priceChip: {
    width: 56, height: 40, borderRadius: radius.md, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.md, paddingHorizontal: spacing.base,
    borderRadius: radius.lg, borderWidth: 1.5,
  },
  modalActions: {
    flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl,
  },
  resetBtn: {
    flex: 1, paddingVertical: spacing.md, borderRadius: radius.full,
    borderWidth: 1.5, alignItems: 'center',
  },
  applyBtn: {
    flex: 2, paddingVertical: spacing.md, borderRadius: radius.full, alignItems: 'center',
  },
});
