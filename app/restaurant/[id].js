import { useState } from 'react';
import { View, FlatList, StyleSheet, Image, Pressable, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card } from '../../src/components/ui';
import { restaurants, menuItems, categories } from '../../src/services/mock/data';
import { useCartStore } from '../../src/store';
import { useTheme } from '../../src/providers/ThemeProvider';
import { colors, spacing, radius } from '../../src/theme';

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const addItem = useCartStore((s) => s.addItem);
  const c = useTheme();

  const restaurant = restaurants.find((r) => r.id === id);
  const menu = menuItems[id] || [];

  if (!restaurant) {
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <View style={[styles.backRow, { paddingTop: insets.top + spacing.sm }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={c.text} />
          </Pressable>
        </View>
        <Text variant="body" style={styles.notFound}>Restaurant not found</Text>
      </View>
    );
  }

  // Filter tags from cuisine string
  const tags = restaurant.cuisine.split(' · ').map((t) => t.trim());
  const [selectedTag, setSelectedTag] = useState(0);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header image with back + menu buttons */}
      <View>
        <Image source={{ uri: restaurant.image }} style={styles.coverImage} />
        <View style={[styles.headerOverlay, { paddingTop: insets.top + spacing.sm }]}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={() => Alert.alert('Options', '', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Add to Favourites', onPress: () => Alert.alert('❤️ Added', 'Restaurant saved to favourites!') },
            { text: 'Share', onPress: () => Alert.alert('📤 Shared', 'Link copied to clipboard!') },
          ])}>
            <Ionicons name="ellipsis-horizontal" size={22} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={[styles.body, { backgroundColor: c.background }]}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Restaurant info */}
        <View style={styles.info}>
          <Text variant="caption" style={[styles.viewLabel, { color: c.textMuted }]}>Restaurant View</Text>
          <Text variant="h1" style={[styles.name, { color: c.text }]}>{restaurant.name}</Text>
          <Text variant="bodySmall" style={[styles.description, { color: c.textSecondary }]}>
            Maecenas sed diam eget risus varius blandit sit amet non magna. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.
          </Text>

          {/* Meta row */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={14} color={c.primary} />
              <Text variant="bodySmall" style={[styles.metaValue, { color: c.text }]}>{restaurant.rating}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="bicycle-outline" size={16} color={c.primary} />
              <Text variant="bodySmall" style={[styles.metaValue, { color: c.text }]}>
                {restaurant.freeDelivery ? 'Free' : `$${restaurant.deliveryFee}`}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={c.primary} />
              <Text variant="bodySmall" style={[styles.metaValue, { color: c.text }]}>{restaurant.deliveryTime} min</Text>
            </View>
          </View>

          {/* Tags */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScroll}>
            <View style={styles.tagsRow}>
              {tags.map((tag, idx) => (
                <Pressable
                  key={idx}
                  style={[styles.tag, { backgroundColor: c.backgroundSecondary, borderColor: c.border }, idx === selectedTag && { backgroundColor: c.primary, borderColor: c.primary }]}
                  onPress={() => setSelectedTag(idx)}
                >
                  <Text
                    variant="caption"
                    style={[styles.tagText, { color: c.textSecondary }, idx === selectedTag && { color: '#FFF' }]}
                  >
                    {tag}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Menu items */}
        <View style={styles.menuSection}>
          <Text variant="h3" style={[styles.menuTitle, { color: c.text }]}>
            {tags[selectedTag] || 'Menu'} ({menu.length})
          </Text>
          <View style={styles.menuGrid}>
            {menu.map((item) => (
              <Pressable
                key={item.id}
                style={[styles.menuCard, { backgroundColor: c.backgroundSecondary }]}
                onPress={() => router.push(`/food/${item.id}`)}
              >
                <Image source={{ uri: item.image }} style={styles.menuImage} />
                <View style={styles.menuInfo}>
                  <Text variant="body" style={[styles.menuName, { color: c.text }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text variant="caption" numberOfLines={1}>
                    {item.restaurant || restaurant.name}
                  </Text>
                  <Text variant="body" style={[styles.menuPrice, { color: c.primary }]}>
                    ${item.price}
                  </Text>
                </View>
                <Pressable
                  style={styles.addBtn}
                  onPress={() => {
                    const result = addItem(item);
                    if (result?.error) {
                      Alert.alert('Different Restaurant', result.error);
                    } else {
                      Alert.alert('✅ Added!', `${item.name} added to cart`);
                    }
                  }}
                  hitSlop={8}
                >
                  <Ionicons name="add" size={20} color={colors.textInverse} />
                </Pressable>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  notFound: {
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  backRow: {
    paddingHorizontal: spacing.xl,
  },
  coverImage: {
    width: '100%',
    height: 220,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
  info: {
    padding: spacing.xl,
    gap: spacing.sm,
  },
  viewLabel: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
  },
  description: {
    color: colors.textSecondary,
    lineHeight: 20,
    fontSize: 13,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaValue: {
    fontWeight: '600',
    fontSize: 13,
  },
  tagsScroll: {
    marginTop: spacing.sm,
  },
  tagsRow: {
    flexDirection: 'row',
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
  tagActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tagText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  tagTextActive: {
    color: colors.textInverse,
  },
  menuSection: {
    paddingHorizontal: spacing.xl,
  },
  menuTitle: {
    marginBottom: spacing.md,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  menuCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  menuImage: {
    width: '100%',
    height: 110,
  },
  menuInfo: {
    padding: spacing.sm,
    gap: 2,
  },
  menuName: {
    fontWeight: '700',
    fontSize: 14,
  },
  menuPrice: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 15,
    marginTop: spacing.xs,
  },
  addBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
