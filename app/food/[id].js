import { useState, useEffect } from 'react';
import { View, StyleSheet, Image, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Skeleton } from '../../src/components/ui';
import { supabase } from '../../src/services/supabase';
import { useCartStore } from '../../src/store';
import { useTheme } from '../../src/providers/ThemeProvider';
import { spacing, radius } from '../../src/theme';

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

  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('md');
  const [quantity, setQuantity] = useState(1);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*, restaurants ( id, name )')
          .eq('id', id)
          .single();
        if (error) throw error;
        setItem({
          id: data.id,
          name: data.name,
          description: data.description || '',
          price: parseFloat(data.price),
          image: data.image_url || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300',
          category: data.category,
          restaurantId: data.restaurant_id,
          restaurant: data.restaurants?.name || 'Restaurant',
        });
      } catch {
        // item stays null
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <Skeleton.FoodDetail />
      </View>
    );
  }

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
        `${quantity}x ${item.name} — UGX ${totalPrice}`,
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
        <Text variant="h2" style={[styles.totalPrice, { color: c.text }]}>UGX {totalPrice}</Text>

        <View style={styles.quantityRow}>
          <Pressable style={[styles.qtyBtn, { backgroundColor: c.primary }]} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
            <Ionicons name="remove" size={18} color={c.textInverse} />
          </Pressable>
          <Text variant="h3" style={[styles.qtyText, { color: c.text }]}>{quantity}</Text>
          <Pressable style={[styles.qtyBtn, { backgroundColor: c.primary }]} onPress={() => setQuantity(quantity + 1)}>
            <Ionicons name="add" size={18} color={c.textInverse} />
          </Pressable>
        </View>

        <Pressable style={[styles.addCartBtn, { backgroundColor: c.primary }]} onPress={handleAddToCart}>
          <Ionicons name="cart" size={20} color={c.textInverse} />
          <Text variant="body" style={[styles.addCartText, { color: c.textInverse }]}>ADD TO CART</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  headerBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.base, paddingBottom: spacing.sm,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  notFound: { textAlign: 'center', marginTop: spacing.xl },
  imageWrapper: {
    alignItems: 'center', paddingVertical: spacing.lg,
    borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
  },
  foodImage: { width: 220, height: 220, borderRadius: 110 },
  heartBtn: {
    position: 'absolute', top: spacing.base, right: spacing.xl,
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  content: { padding: spacing.xl },
  foodName: { fontSize: 26, fontWeight: '700', marginBottom: spacing.xs },
  description: { lineHeight: 20, fontSize: 13, marginBottom: spacing.md },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing.xl },
  ratingText: { fontWeight: '600', fontSize: 13 },
  sizeLabel: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5, marginBottom: spacing.sm },
  sizeRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  sizeBtn: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5,
  },
  sizeText: { fontWeight: '700', fontSize: 14 },
  ingredientsLabel: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5, marginBottom: spacing.sm },
  ingredientsRow: { flexDirection: 'row', gap: spacing.md },
  ingredientCircle: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  ingredientEmoji: { fontSize: 20 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingTop: spacing.base,
    borderTopWidth: 1,
  },
  totalPrice: { fontWeight: '800', fontSize: 24 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  qtyBtn: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  qtyText: { fontSize: 18, fontWeight: '700' },
  addCartBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
  },
  addCartText: { fontWeight: '700', fontSize: 13, letterSpacing: 0.3 },
});
