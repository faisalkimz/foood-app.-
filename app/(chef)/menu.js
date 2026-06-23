import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Image, Pressable, Switch, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, showToast } from '../../src/components/ui';
import { useTheme } from '../../src/providers/ThemeProvider';
import { fetchMyMenuItems, updateMenuItem, deleteMenuItem } from '../../src/services/restaurantService';
import { spacing, radius } from '../../src/theme';

export default function ChefMenuScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = useTheme();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadItems = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const { items: data } = await fetchMyMenuItems();
      setItems(data);
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to load menu.' });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Reload every time this screen comes into focus (e.g. after adding an item)
  useFocusEffect(useCallback(() => { loadItems(); }, []));

  const toggleAvailability = async (id, current) => {
    // Optimistically update UI
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isAvailable: !current } : i)));
    try {
      await updateMenuItem(id, { isAvailable: !current });
    } catch {
      // Revert on failure
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isAvailable: current } : i)));
      showToast({ type: 'error', message: 'Failed to update availability.' });
    }
  };

  const handleDelete = (id, name) => {
    Alert.alert('Delete Item?', `"${name}" will be permanently removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          setItems((prev) => prev.filter((i) => i.id !== id));
          try {
            await deleteMenuItem(id);
            showToast({ type: 'success', message: `${name} removed.` });
          } catch {
            loadItems(true); // Reload if delete failed
            showToast({ type: 'error', message: 'Failed to delete item.' });
          }
        },
      },
    ]);
  };

  const availableCount = items.filter((i) => i.isAvailable).length;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View>
          <Text variant="h2" style={{ color: c.text }}>Menu</Text>
          <Text variant="caption" style={{ color: c.textMuted }}>
            {availableCount} of {items.length} items available
          </Text>
        </View>
        <Pressable
          style={[styles.addBtn, { backgroundColor: c.primary }]}
          onPress={() => router.push('/chef/add-item')}
        >
          <Ionicons name="add" size={20} color="#FFF" />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      ) : (
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={{
          paddingHorizontal: spacing.xl,
          paddingBottom: insets.bottom + 100,
          paddingTop: spacing.md,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => { setIsRefreshing(true); loadItems(true); }}
            tintColor={c.primary}
          />
        }
        renderItem={({ item }) => (
          <Pressable
            style={[styles.menuCard, { backgroundColor: c.backgroundSecondary }]}
            onPress={() => router.push(`/chef/edit-item?id=${item.id}`)}
          >
            <Image
              source={{ uri: item.image || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300' }}
              style={[styles.menuImage, !item.isAvailable && styles.menuImageDim]}
            />
            {!item.isAvailable && (
              <View style={styles.unavailableBadge}>
                <Text variant="caption" style={styles.unavailableText}>Unavailable</Text>
              </View>
            )}
            <View style={styles.menuInfo}>
              <Text variant="body" style={[styles.menuName, { color: c.text }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text variant="caption" style={{ color: c.textMuted }}>{item.category}</Text>
              <View style={styles.menuBottom}>
                <Text variant="body" style={[styles.menuPrice, { color: c.primary }]}>
                  UGX {item.price.toLocaleString()}
                </Text>
                <Switch
                  value={item.isAvailable}
                  onValueChange={() => toggleAvailability(item.id, item.isAvailable)}
                  trackColor={{ false: '#E0E0E0', true: c.primary }}
                  thumbColor="#FFF"
                  style={{ transform: [{ scale: 0.7 }] }}
                />
              </View>
            </View>

            {/* Delete button */}
            <Pressable
              style={[styles.deleteBtn, { backgroundColor: c.background }]}
              onPress={() => handleDelete(item.id, item.name)}
              hitSlop={8}
            >
              <Ionicons name="trash-outline" size={14} color="#EF4444" />
            </Pressable>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="restaurant-outline" size={56} color={c.textMuted} />
            <Text variant="body" style={{ color: c.textMuted }}>No menu items yet</Text>
            <Pressable
              style={[styles.emptyBtn, { backgroundColor: c.primary }]}
              onPress={() => router.push('/chef/add-item')}
            >
              <Text variant="body" style={{ color: '#FFF', fontWeight: '700' }}>Add First Item</Text>
            </Pressable>
          </View>
        }
      />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.xl, paddingBottom: spacing.md,
  },
  addBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  gridRow: { gap: spacing.md, marginBottom: spacing.md },
  menuCard: {
    flex: 1, borderRadius: radius.lg, overflow: 'hidden', position: 'relative',
  },
  menuImage: { width: '100%', height: 120, backgroundColor: '#F0F0F0' },
  menuImageDim: { opacity: 0.4 },
  unavailableBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6,
  },
  unavailableText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  menuInfo: { padding: spacing.md, gap: 2 },
  menuName: { fontWeight: '700', fontSize: 14 },
  menuBottom: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 4,
  },
  menuPrice: { fontWeight: '800', fontSize: 15 },
  deleteBtn: {
    position: 'absolute', top: 8, right: 8,
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 2,
  },
  empty: {
    alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: spacing.md,
  },
  emptyBtn: {
    paddingVertical: spacing.md, paddingHorizontal: spacing.xl,
    borderRadius: radius.full, marginTop: spacing.md,
  },
});
