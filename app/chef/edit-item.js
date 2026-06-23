import { useState, useEffect } from 'react';
import {
  View, StyleSheet, ScrollView, Pressable, TextInput, Alert, Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, showToast } from '../../src/components/ui';
import { useTheme } from '../../src/providers/ThemeProvider';
import { supabase } from '../../src/services/supabase';
import { updateMenuItem, deleteMenuItem } from '../../src/services/restaurantService';
import { spacing, radius } from '../../src/theme';

const CATEGORIES = ['Main', 'Pizza', 'Burger', 'Salad', 'Chicken', 'Seafood', 'Sides', 'Dessert', 'Drinks'];

export default function EditItemScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const c = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Main');

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        setName(data.name || '');
        setDescription(data.description || '');
        setPrice(data.price?.toString() || '');
        setCategory(data.category || 'Main');
        setImageUrl(data.image_url || '');
      } catch {
        showToast({ type: 'error', message: 'Could not load item.' });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const handleSave = async () => {
    if (!name || !price) {
      Alert.alert('Missing Info', 'Please fill in name and price');
      return;
    }
    setIsSaving(true);
    try {
      await updateMenuItem(id, {
        name,
        description,
        price: parseFloat(price),
        category,
        image: imageUrl,
      });
      showToast({ type: 'success', message: `${name} updated!` });
      router.back();
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to update.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Item?', `"${name}" will be permanently removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await deleteMenuItem(id);
            showToast({ type: 'success', message: 'Item removed from menu.' });
            router.back();
          } catch {
            showToast({ type: 'error', message: 'Failed to delete.' });
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: c.background, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

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
        {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.previewImage} /> : null}

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>ITEM NAME</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.backgroundSecondary, borderColor: c.border, color: c.text }]}
              value={name} onChangeText={setName} placeholderTextColor={c.textMuted}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>DESCRIPTION</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: c.backgroundSecondary, borderColor: c.border, color: c.text }]}
              value={description} onChangeText={setDescription}
              multiline numberOfLines={3} placeholderTextColor={c.textMuted} textAlignVertical="top"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>PRICE (UGX)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.backgroundSecondary, borderColor: c.border, color: c.text }]}
              value={price} onChangeText={setPrice}
              keyboardType="decimal-pad" placeholderTextColor={c.textMuted}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>IMAGE URL</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.backgroundSecondary, borderColor: c.border, color: c.text }]}
              value={imageUrl} onChangeText={setImageUrl}
              placeholder="https://..." placeholderTextColor={c.textMuted} autoCapitalize="none"
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
        <Pressable
          style={[styles.saveBtn, { backgroundColor: c.primary, opacity: isSaving ? 0.6 : 1 }]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text variant="body" style={styles.saveBtnText}>SAVE CHANGES</Text>
          )}
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
