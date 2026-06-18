import { useState } from 'react';
import { View, StyleSheet, Pressable, FlatList, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../src/components/ui';
import { useTheme } from '../../src/providers/ThemeProvider';
import { spacing, radius } from '../../src/theme';

const savedCards = [
  { id: '1', type: 'Visa', last4: '4536', expiry: '09/28', holder: 'Vishal Khadok' },
  { id: '2', type: 'Mastercard', last4: '8923', expiry: '12/27', holder: 'Vishal Khadok' },
];

export default function PaymentMethodScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = useTheme();
  const [cards, setCards] = useState(savedCards);

  const deleteCard = (id) => {
    Alert.alert('Delete Card?', 'This card will be permanently removed.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setCards((prev) => prev.filter((c) => c.id !== id)) },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: c.backgroundSecondary }]}>
          <Ionicons name="arrow-back" size={22} color={c.text} />
        </Pressable>
        <Text variant="h3" style={{ color: c.text }}>Payment Methods</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: insets.bottom + spacing.xl, gap: spacing.md }}
        renderItem={({ item }) => (
          <View style={[styles.cardItem, { backgroundColor: c.backgroundSecondary }]}>
            <View style={[styles.cardIcon, { backgroundColor: item.type === 'Visa' ? '#1A1F71' : '#EB001B' }]}>
              <Ionicons name="card" size={20} color="#FFF" />
            </View>
            <View style={styles.cardInfo}>
              <Text variant="body" style={[styles.cardType, { color: c.text }]}>
                {item.type} •••• {item.last4}
              </Text>
              <Text variant="caption">Expires {item.expiry}</Text>
            </View>
            <Pressable onPress={() => deleteCard(item.id)} hitSlop={8}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </Pressable>
          </View>
        )}
        ListFooterComponent={
          <Pressable style={[styles.addBtn, { borderColor: c.primary }]}>
            <Ionicons name="add" size={20} color={c.primary} />
            <Text variant="body" style={{ color: c.primary, fontWeight: '700' }}>ADD NEW CARD</Text>
          </Pressable>
        }
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
  cardItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.base, borderRadius: radius.lg,
  },
  cardIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1, gap: 2 },
  cardType: { fontWeight: '700', fontSize: 15 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    paddingVertical: spacing.base, borderRadius: radius.lg, borderWidth: 1.5, borderStyle: 'dashed', marginTop: spacing.md,
  },
});
