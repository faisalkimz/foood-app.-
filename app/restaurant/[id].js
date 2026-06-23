import { useState, useEffect } from 'react';
import {
  View, FlatList, StyleSheet, Image, Pressable,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Skeleton } from '../../src/components/ui';
import { fetchRestaurant, fetchMenuItems } from '../../src/services/restaurantService';
import { useCartStore } from '../../src/store';
import { useTheme } from '../../src/providers/ThemeProvider';
import { spacing, radius } from '../../src/theme';

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const addItem = useCartStore((s) => s.addItem);
  const c = useTheme();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [rest, menu] = await Promise.all([
          fetchRestaurant(id),
          fetchMenuItems(id),
        ]);
        setRestaurant(rest);
        setMenuItems(menu);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <Skeleton.RestaurantDetail />
      </View>
    );
  }

  if (error || !restaurant) {
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <View style={[styles.backRow, { paddingTop: insets.top + spacing.sm }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={c.text} />
          </Pressable>
        </View>
        <View style={styles.center}>
          <Ionicons name="storefront-outline" size={48} color={c.textMuted} />
          <Text variant="body" style={{ color: c.textSecondary, marginTop: spacing.md }}>
            {error || 'Restaurant not found'}
          </Text>
        </View>
      </View>
    );
  }

  // Derive category tabs from menu items
  const allCategories = ['All', ...new Set(menuItems.map((i) => i.category))];
  const filteredMenu = selectedCategory === 'All'
    ? menuItems
    : menuItems.filter((i) => i.category === selectedCategory);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* ── Cover image with nav ── */}
      <View>
        <Image
          source={{ uri: restaurant.image }}
          style={styles.coverImage}
        />
        <View style={[styles.headerOverlay, { paddingTop: insets.top + spacing.sm }]}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
          </Pressable>
          <Pressable
            style={styles.iconBtn}
            onPress={() => Alert.alert('Options', '', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Add to Favourites', onPress: () => Alert.alert('❤️ Saved', 'Added to favourites!') },
              { text: 'Share', onPress: () => Alert.alert('📤 Shared', 'Link copied!') },
            ])}
          >
            <Ionicons name="ellipsis-horizontal" size={22} color="#1A1A1A" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Restaurant info ── */}
        <View style={styles.info}>
          <Text variant="h1" style={[styles.name, { color: c.text }]}>{restaurant.name}</Text>
          <Text variant="bodySmall" style={{ color: c.textSecondary }}>{restaurant.cuisine}</Text>

          {restaurant.description ? (
            <Text variant="bodySmall" style={[styles.description, { color: c.textSecondary }]}>
              {restaurant.description}
            </Text>
          ) : null}

          {/* Meta row */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={14} color="#FFB800" />
              <Text variant="bodySmall" style={[styles.metaValue, { color: c.text }]}>
                {restaurant.rating > 0 ? restaurant.rating.toFixed(1) : 'New'}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="bicycle-outline" size={16} color={c.primary} />
              <Text variant="bodySmall" style={[styles.metaValue, { color: c.text }]}>
                {restaurant.freeDelivery ? 'Free delivery' : `UGX ${restaurant.deliveryFee.toLocaleString()}`}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={c.primary} />
              <Text variant="bodySmall" style={[styles.metaValue, { color: c.text }]}>
                {restaurant.deliveryTime} min
              </Text>
            </View>
          </View>

          {/* Additional info */}
          {restaurant.openingHours ? (
            <View style={styles.metaItem}>
              <Ionicons name="alarm-outline" size={14} color={c.textMuted} />
              <Text variant="caption" style={{ color: c.textMuted }}>{restaurant.openingHours}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Category tabs ── */}
        {allCategories.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScroll}>
            <View style={styles.tagsRow}>
              {allCategories.map((cat) => (
                <Pressable
                  key={cat}
                  style={[
                    styles.tag,
                    { backgroundColor: c.backgroundSecondary, borderColor: c.border },
                    cat === selectedCategory && { backgroundColor: c.primary, borderColor: c.primary },
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text
                    variant="caption"
                    style={[
                      styles.tagText,
                      { color: c.textSecondary },
                      cat === selectedCategory && { color: '#FFF' },
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        )}

        {/* ── Menu items ── */}
        <View style={styles.menuSection}>
          <Text variant="h3" style={[styles.menuTitle, { color: c.text }]}>
            {selectedCategory} ({filteredMenu.length})
          </Text>

          {filteredMenu.length === 0 ? (
            <View style={styles.emptyMenu}>
              <Text style={{ fontSize: 36 }}>🍽️</Text>
              <Text variant="bodySmall" style={{ color: c.textMuted, marginTop: spacing.sm }}>
                No items in this category yet.
              </Text>
            </View>
          ) : (
            <View style={styles.menuGrid}>
              {filteredMenu.map((item) => (
                <Pressable
                  key={item.id}
                  style={[styles.menuCard, { backgroundColor: c.backgroundSecondary, borderColor: c.borderLight }]}
                  onPress={() => router.push(`/food/${item.id}`)}
                >
                  <Image source={{ uri: item.image }} style={styles.menuImage} />
                  <View style={styles.menuInfo}>
                    <Text variant="body" style={[styles.menuName, { color: c.text }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    {item.description ? (
                      <Text variant="caption" style={{ color: c.textMuted }} numberOfLines={1}>
                        {item.description}
                      </Text>
                    ) : null}
                    <Text variant="body" style={[styles.menuPrice, { color: c.primary }]}>
                      UGX {item.price.toLocaleString()}
                    </Text>
                  </View>
                  <Pressable
                    style={[styles.addBtn, { backgroundColor: c.primary }]}
                    onPress={() => {
                      const result = addItem({
                        ...item,
                        restaurantId: id,
                        restaurant: restaurant.name,
                      });
                      if (result?.error) {
                        Alert.alert('Different Restaurant', result.error, [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Start New Cart', style: 'destructive',
                            onPress: () => {
                              const cartStore = useCartStore.getState();
                              cartStore.clearCart();
                              cartStore.addItem({ ...item, restaurantId: id, restaurant: restaurant.name });
                            },
                          },
                        ]);
                      }
                    }}
                    hitSlop={8}
                  >
                    <Ionicons name="add" size={20} color="#FFF" />
                  </Pressable>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  backRow: { paddingHorizontal: spacing.xl },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  coverImage: { width: '100%', height: 220 },
  headerOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
  },
  info: { padding: spacing.xl, gap: spacing.sm },
  name: { fontSize: 24, fontWeight: '700' },
  description: { lineHeight: 20, fontSize: 13 },
  metaRow: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaValue: { fontWeight: '600', fontSize: 13 },
  tagsScroll: { marginBottom: spacing.sm },
  tagsRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.xl },
  tag: {
    paddingVertical: spacing.sm, paddingHorizontal: spacing.base,
    borderRadius: radius.full, borderWidth: 1,
  },
  tagText: { fontSize: 13, fontWeight: '500' },
  menuSection: { paddingHorizontal: spacing.xl },
  menuTitle: { marginBottom: spacing.md },
  emptyMenu: { alignItems: 'center', paddingVertical: spacing['2xl'] },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  menuCard: { width: '47%', borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1 },
  menuImage: { width: '100%', height: 110 },
  menuInfo: { padding: spacing.sm, gap: 2 },
  menuName: { fontWeight: '700', fontSize: 14 },
  menuPrice: { fontWeight: '700', fontSize: 15, marginTop: spacing.xs },
  addBtn: {
    position: 'absolute', top: spacing.sm, right: spacing.sm,
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
  },
});
