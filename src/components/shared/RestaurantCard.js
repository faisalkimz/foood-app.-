import { View, Image, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card } from '../ui';
import { useTheme } from '../../providers/ThemeProvider';
import { spacing, radius } from '../../theme';

export default function RestaurantCard({ restaurant, onPress }) {
  const c = useTheme();

  return (
    <Pressable onPress={onPress}>
      <Card style={[styles.card, { backgroundColor: c.backgroundSecondary }]} padded={false}>
        <Image source={{ uri: restaurant.image }} style={styles.image} />
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
                {restaurant.freeDelivery ? 'Free' : `UGX ${restaurant.deliveryFee.toLocaleString('en-UG')}`}
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
  content: { padding: spacing.md, gap: spacing.xs },
  name: { fontSize: 17, fontWeight: '700' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.xs },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontWeight: '700', fontSize: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
});
