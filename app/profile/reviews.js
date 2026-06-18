import { View, StyleSheet, Pressable, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../src/components/ui';
import { useTheme } from '../../src/providers/ThemeProvider';
import { spacing, radius } from '../../src/theme';

const reviews = [
  { id: '1', restaurant: 'Pizza Hut', rating: 5, comment: 'Amazing pizza! Delivery was super fast. Will order again for sure.', date: '2 days ago', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100' },
  { id: '2', restaurant: 'McDonald', rating: 4, comment: 'Good burgers as always. The fries were a bit cold though.', date: '1 week ago', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100' },
  { id: '3', restaurant: 'Starbucks', rating: 5, comment: 'Best coffee in town. The latte was perfect!', date: '2 weeks ago', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=100' },
  { id: '4', restaurant: 'KFC', rating: 3, comment: 'Chicken was good but took too long to deliver.', date: '3 weeks ago', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=100' },
];

const Stars = ({ count, color }) => (
  <View style={{ flexDirection: 'row', gap: 2 }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Ionicons key={i} name={i <= count ? 'star' : 'star-outline'} size={14} color={i <= count ? '#FFB800' : color} />
    ))}
  </View>
);

export default function ReviewsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: c.backgroundSecondary }]}>
          <Ionicons name="arrow-back" size={22} color={c.text} />
        </Pressable>
        <Text variant="h3" style={{ color: c.text }}>My Reviews</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: insets.bottom + spacing.xl, gap: spacing.md }}
        renderItem={({ item }) => (
          <View style={[styles.reviewCard, { backgroundColor: c.backgroundSecondary }]}>
            <View style={styles.reviewHeader}>
              <Image source={{ uri: item.image }} style={styles.reviewImage} />
              <View style={styles.reviewInfo}>
                <Text variant="body" style={[styles.reviewName, { color: c.text }]}>{item.restaurant}</Text>
                <Stars count={item.rating} color={c.textMuted} />
              </View>
              <Text variant="caption" style={{ fontSize: 11 }}>{item.date}</Text>
            </View>
            <Text variant="bodySmall" style={{ color: c.textSecondary, lineHeight: 20 }}>
              {item.comment}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingBottom: spacing.md,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  reviewCard: { borderRadius: radius.lg, padding: spacing.base, gap: spacing.md },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  reviewImage: { width: 48, height: 48, borderRadius: radius.md },
  reviewInfo: { flex: 1, gap: 4 },
  reviewName: { fontWeight: '700', fontSize: 15 },
});
