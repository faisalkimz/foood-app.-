import { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, FlatList, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { useTheme } from '@/providers/ThemeProvider';
import { fetchRestaurants } from '@/services/restaurantService';
import { spacing, radius } from '@/theme';

export default function FavouritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = useTheme();
  const [favs, setFavs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const all = await fetchRestaurants();
        // TODO: Replace with a real favourites table. For now show top rated.
        setFavs(all.slice(0, 4));
      } catch { /* silent */ }
      finally { setIsLoading(false); }
    })();
  }, []);

  const removeFav = (id) => {
    Alert.alert('Remove Favourite?', 'This restaurant will be removed from your favourites.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setFavs((prev) => prev.filter((r) => r.id !== id)) },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: c.backgroundSecondary }]}>
          <Ionicons name="arrow-back" size={22} color={c.text} />
        </Pressable>
        <Text variant="h3" style={{ color: c.text }}>Favourites</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.skeletonWrap}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={[styles.skeletonCard, { backgroundColor: c.backgroundSecondary }]}>
              <View style={[styles.skelImg, { backgroundColor: c.borderLight }]} />
              <View style={styles.skelContent}>
                <View style={[styles.skelLine, { backgroundColor: c.borderLight, width: '60%' }]} />
                <View style={[styles.skelLine, { backgroundColor: c.borderLight, width: '40%' }]} />
              </View>
            </View>
          ))}
        </View>
      ) : (
      <FlatList
        data={favs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: insets.bottom + spacing.xl, gap: spacing.md }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={56} color={c.textMuted} />
            <Text variant="body" style={{ color: c.textMuted }}>No favourites yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, { backgroundColor: c.backgroundSecondary }]}
            onPress={() => router.push(`/restaurant/${item.id}`)}
          >
            <Image source={{ uri: item.image }} style={styles.cardImage} />
            <View style={styles.cardContent}>
              <Text variant="body" style={[styles.cardName, { color: c.text }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text variant="caption" numberOfLines={1}>{item.cuisine}</Text>
              <View style={styles.cardMeta}>
                <Ionicons name="star" size={12} color="#FFB800" />
                <Text variant="caption" style={{ fontWeight: '700', color: c.text, fontSize: 12 }}>
                  {item.rating}
                </Text>
                <Text variant="caption"> · {item.deliveryTime} min</Text>
              </View>
            </View>
            <Pressable onPress={() => removeFav(item.id)} hitSlop={8} style={styles.heartBtn}>
              <Ionicons name="heart" size={22} color="#EF4444" />
            </Pressable>
          </Pressable>
        )}
      />
      )}
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
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: spacing.md },
  card: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.md,
    borderRadius: radius.lg, gap: spacing.md,
  },
  cardImage: { width: 64, height: 64, borderRadius: radius.md },
  cardContent: { flex: 1, gap: 2 },
  cardName: { fontWeight: '700', fontSize: 15 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  heartBtn: { padding: spacing.sm },
  skeletonWrap: { paddingHorizontal: spacing.xl, gap: spacing.md },
  skeletonCard: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.md,
    borderRadius: radius.lg, gap: spacing.md,
  },
  skelImg: { width: 64, height: 64, borderRadius: radius.md },
  skelContent: { flex: 1, gap: spacing.sm },
  skelLine: { height: 14, borderRadius: 7 },
});
