import { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput, Alert, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../src/components/ui';
import { useTheme } from '../../src/providers/ThemeProvider';
import { chefMenuItems } from '../../src/services/mock/data';
import { spacing, radius } from '../../src/theme';

const CATEGORIES = ['Pizza', 'Burger', 'Salad', 'Chicken', 'Seafood', 'Sides', 'Dessert', 'Drinks'];

export default function EditItemScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const c = useTheme();

  const item = chefMenuItems.find((i) => i.id === id);

  const [name, setName] = useState(item?.name || '');
  const [description, setDescription] = useState('A delicious dish prepared with fresh ingredients.');
  const [price, setPrice] = useState(item?.price?.toString() || '');
  const [category, setCategory] = useState(item?.category || 'Pizza');

  const handleSave = () => {
    if (!name || !price) {
      Alert.alert('Missing Info', 'Please fill in name and price');
      return;
    }
    Alert.alert('✅ Updated', `${name} has been updated.`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('Delete Item?', `"${name}" will be permanently removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        Alert.alert('🗑️ Deleted', 'Item removed from menu.');
        router.back();
      }},
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: c.backgroundSecondary }]}>
          <Ionicons name="arrow-back" size={22} color={c.text} />
        </Pressable>
        <Text variant="h3" style={{ color: c.text }}>Edit Item</Text>
        <Pressable onPress={handleDelete} hitSlop={8}>
          <Ionicons name="trash-outline" size={22} color="#EF4444" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Current image */}
        {item?.image && (
          <Image source={{ uri: item.image }} style={styles.previewImage} />
        )}

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>ITEM NAME</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.backgroundSecondary, borderColor: c.border, color: c.text }]}
              value={name}
              onChangeText={setName}
              placeholderTextColor={c.textMuted}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>DESCRIPTION</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: c.backgroundSecondary, borderColor: c.border, color: c.text }]}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              placeholderTextColor={c.textMuted}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>PRICE ($)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.backgroundSecondary, borderColor: c.border, color: c.text }]}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              placeholderTextColor={c.textMuted}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>CATEGORY</Text>
            <View style={styles.catGrid}>
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  style={[
                    styles.catPill, { borderColor: c.border },
                    category === cat && { backgroundColor: c.primary, borderColor: c.primary },
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text variant="bodySmall" style={[
                    { color: c.textSecondary, fontWeight: '600' },
                    category === cat && { color: '#FFF' },
                  ]}>{cat}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.base, backgroundColor: c.background }]}>
        <Pressable style={[styles.saveBtn, { backgroundColor: c.primary }]} onPress={handleSave}>
          <Text variant="body" style={styles.saveBtnText}>SAVE CHANGES</Text>
        </Pressable>
      </View>
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
  content: { paddingHorizontal: spacing.xl, gap: spacing.xl },
  previewImage: { width: '100%', height: 180, borderRadius: radius.lg },
  form: { gap: spacing.lg },
  fieldGroup: { gap: spacing.xs },
  fieldLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  input: {
    borderWidth: 1, borderRadius: radius.md,
    paddingVertical: spacing.md, paddingHorizontal: spacing.base, fontSize: 15,
  },
  textArea: { minHeight: 80 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  catPill: {
    paddingVertical: spacing.sm, paddingHorizontal: spacing.base,
    borderRadius: radius.full, borderWidth: 1.5,
  },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: spacing.xl, paddingTop: spacing.base,
  },
  saveBtn: { paddingVertical: spacing.base, borderRadius: radius.full, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16, letterSpacing: 0.5 },
});
