import { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../src/components/ui';
import { menuItems } from '../../src/services/mock/data';
import { useCartStore } from '../../src/store';
import { useTheme } from '../../src/providers/ThemeProvider';
import { colors, spacing, radius } from '../../src/theme';

const sizes = [
  { label: '10"', value: 'sm' },
  { label: '14"', value: 'md' },
  { label: '16"', value: 'lg' },
];

export default function FoodDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const addItem = useCartStore((s) => s.addItem);
  const c = useTheme();

  const allItems = Object.values(menuItems).flat();
  const item = allItems.find((i) => i.id === id);

  const [selectedSize, setSelectedSize] = useState('md');
  const [quantity, setQuantity] = useState(1);
  const [isFav, setIsFav] = useState(false);

  if (!item) {
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <View style={[styles.headerBar, { paddingTop: insets.top + spacing.sm }]}>
          <Pressable onPress={() => router.back()} style={[styles.iconBtn, { backgroundColor: c.backgroundSecondary }]}>
            <Ionicons name="arrow-back" size={22} color={c.text} />
          </Pressable>
          <Text variant="h3" style={{ color: c.text }}>Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text variant="body" style={[styles.notFound, { color: c.text }]}>Item not found</Text>
      </View>
    );
  }

  const totalPrice = item.price * quantity;

  const handleAddToCart = () => {
    const result = addItem({ ...item, quantity });
    if (result?.error) {
      Alert.alert(
        'Different Restaurant',
        'Your cart contains items from another restaurant. Clear cart first?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear & Add',
            style: 'destructive',
            onPress: () => {
              useCartStore.getState().clearCart();
              addItem({ ...item, quantity });
              Alert.alert('Added!', `${quantity}x ${item.name} added to cart`, [
                { text: 'Continue Shopping', style: 'cancel' },
                { text: 'Go to Cart', onPress: () => router.push('/(tabs)/cart') },
              ]);
            },
          },
        ]
      );
    } else {
      // Success! Show confirmation
      Alert.alert(
        '✅ Added to Cart!',
        `${quantity}x ${item.name} — $${totalPrice}`,
        [
          { text: 'Continue Shopping', style: 'cancel', onPress: () => router.back() },
          { text: 'Go to Cart', onPress: () => router.push('/(tabs)/cart') },
        ]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.headerBar, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={[styles.iconBtn, { backgroundColor: c.backgroundSecondary }]}>
          <Ionicons name="arrow-back" size={22} color={c.text} />
        </Pressable>
        <Text variant="h3" style={{ color: c.text }}>Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Food image */}
        <View style={[styles.imageWrapper, { backgroundColor: c.backgroundSecondary }]}>
          <Image source={{ uri: item.image }} style={styles.foodImage} />
          <Pressable style={[styles.heartBtn, { backgroundColor: c.background }]} onPress={() => setIsFav(!isFav)}>
            <Ionicons
              name={isFav ? 'heart' : 'heart-outline'}
              size={22}
              color={c.primary}
            />
          </Pressable>
        </View>

        <View style={styles.content}>
          <Text variant="h2" style={[styles.foodName, { color: c.text }]}>{item.name}</Text>
          <Text variant="bodySmall" style={[styles.description, { color: c.textSecondary }]}>{item.description}</Text>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={c.rating} />
            <Text variant="body" style={[styles.ratingText, { color: c.text }]}>{item.rating || '4.7'}</Text>
            <Ionicons name="bicycle-outline" size={14} color={c.primary} style={{ marginLeft: spacing.md }} />
            <Text variant="bodySmall" style={[styles.ratingText, { color: c.text }]}>Free</Text>
            <Ionicons name="time-outline" size={14} color={c.primary} style={{ marginLeft: spacing.md }} />
            <Text variant="bodySmall" style={[styles.ratingText, { color: c.text }]}>20 min</Text>
          </View>

          <Text variant="label" style={[styles.sizeLabel, { color: c.text }]}>SIZE:</Text>
          <View style={styles.sizeRow}>
            {sizes.map((s) => (
              <Pressable
                key={s.value}
                style={[styles.sizeBtn, { backgroundColor: c.backgroundSecondary, borderColor: c.border }, selectedSize === s.value && { backgroundColor: c.primary, borderColor: c.primary }]}
                onPress={() => setSelectedSize(s.value)}
              >
                <Text
                  variant="bodySmall"
                  style={[styles.sizeText, { color: c.text }, selectedSize === s.value && { color: '#FFF' }]}
                >
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text variant="label" style={[styles.ingredientsLabel, { color: c.text }]}>INGREDIENTS:</Text>
          <View style={styles.ingredientsRow}>
            {['🧅', '🧄', '🌶️', '🥬', '🍅'].map((emoji, idx) => (
              <View key={idx} style={[styles.ingredientCircle, { backgroundColor: c.backgroundSecondary }]}>
                <Text style={styles.ingredientEmoji}>{emoji}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.base, backgroundColor: c.background, borderTopColor: c.borderLight }]}>
        <Text variant="h2" style={[styles.totalPrice, { color: c.text }]}>${totalPrice}</Text>

        <View style={styles.quantityRow}>
          <Pressable style={styles.qtyBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
            <Ionicons name="remove" size={18} color={colors.textInverse} />
          </Pressable>
          <Text variant="h3" style={styles.qtyText}>{quantity}</Text>
          <Pressable style={styles.qtyBtn} onPress={() => setQuantity(quantity + 1)}>
            <Ionicons name="add" size={18} color={colors.textInverse} />
          </Pressable>
        </View>

        <Pressable style={styles.addCartBtn} onPress={handleAddToCart}>
          <Ionicons name="cart" size={20} color={colors.textInverse} />
          <Text variant="body" style={styles.addCartText}>ADD TO CART</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.base, paddingBottom: spacing.sm,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.backgroundSecondary,
    alignItems: 'center', justifyContent: 'center',
  },
  notFound: { textAlign: 'center', marginTop: spacing.xl },
  imageWrapper: {
    alignItems: 'center', paddingVertical: spacing.lg, backgroundColor: colors.backgroundSecondary,
    borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
  },
  foodImage: { width: 220, height: 220, borderRadius: 110 },
  heartBtn: {
    position: 'absolute', top: spacing.base, right: spacing.xl,
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center',
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  content: { padding: spacing.xl },
  foodName: { fontSize: 26, fontWeight: '700', marginBottom: spacing.xs },
  description: { color: colors.textSecondary, lineHeight: 20, fontSize: 13, marginBottom: spacing.md },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing.xl },
  ratingText: { fontWeight: '600', fontSize: 13 },
  sizeLabel: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5, marginBottom: spacing.sm, color: colors.text },
  sizeRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  sizeBtn: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: colors.backgroundSecondary,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.border,
  },
  sizeBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  sizeText: { fontWeight: '700', color: colors.text, fontSize: 14 },
  sizeTextActive: { color: colors.textInverse },
  ingredientsLabel: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5, marginBottom: spacing.sm, color: colors.text },
  ingredientsRow: { flexDirection: 'row', gap: spacing.md },
  ingredientCircle: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.backgroundSecondary,
    alignItems: 'center', justifyContent: 'center',
  },
  ingredientEmoji: { fontSize: 20 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingTop: spacing.base,
    backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.borderLight,
  },
  totalPrice: { color: colors.text, fontWeight: '800', fontSize: 24 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  qtyBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  qtyText: { fontSize: 18, fontWeight: '700' },
  addCartBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.primary, paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
  },
  addCartText: { color: colors.textInverse, fontWeight: '700', fontSize: 13, letterSpacing: 0.3 },
});
