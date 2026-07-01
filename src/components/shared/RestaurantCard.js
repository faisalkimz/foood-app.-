import { View, Image, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card } from '../ui';
import { useTheme } from '../../providers/ThemeProvider';
import { spacing, radius } from '../../theme';
import { formatCurrency } from '../../utils/format';

export default function RestaurantCard({ restaurant, onPress, isFavourite, onToggleFavourite }) {
  const c = useTheme();

  return (
    <Pressable onPress={onPress}>
      <Card style={[styles.card, { backgroundColor: c.backgroundSecondary }]} padded={false}>
        <Image source={{ uri: restaurant.image }} style={styles.image} />
        {onToggleFavourite && (
          <Pressable
            style={styles.heartBtn}
            onPress={() => onToggleFavourite(restaurant.id)}
            hitSlop={8}
          >
            <Ionicons
              name={isFavourite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavourite ? '#EF4444' : '#FFF'}
            />
          </Pressable>
        )}
        <View style={styles.content}>
          <Text variant="h3" numberOfLines={1} style={[styles.name, { color: c.text }]}>
            {restaurant.name}
          </Text>
          <Text variant="caption" numberOfLines={1} style={{ color: c.textSecondary, fontSize: 12 }}>
            {restaurant.cuisine}
          </Text>
          <View style={styles.meta}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color={c.primary} />
              <Text variant="caption" style={[styles.ratingText, { color: c.text }]}>
                {restaurant.rating}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="bicycle-outline" size={14} color={c.primary} />
              <Text variant="caption" style={{ color: c.textSecondary, fontSize: 12 }}>
                {restaurant.freeDelivery ? 'Free' : formatCurrency(restaurant.deliveryFee)}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={c.primary} />
              <Text variant="caption" style={{ color: c.textSecondary, fontSize: 12 }}>
                {restaurant.deliveryTime} min
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.base },
  image: { width: '100%', height: 140, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
  heartBtn: {
    position: 'absolute', top: spacing.sm, right: spacing.sm,
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  content: { padding: spacing.md, gap: spacing.xs },
  name: { fontSize: 17, fontWeight: '700' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.xs },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontWeight: '700', fontSize: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
});
