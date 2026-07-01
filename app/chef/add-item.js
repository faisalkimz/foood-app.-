import { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput, ActivityIndicator, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Text, showToast } from '@/components/ui';
import { CURRENCY_SYMBOL } from '@/utils/format';
import { useTheme } from '@/providers/ThemeProvider';
import { spacing, radius } from '@/theme';
import { fetchMyRestaurant, addMenuItem } from '@/services/restaurantService';
import { uploadImage } from '@/services/uploadService';

const CATEGORIES = ['Main', 'Pizza', 'Burger', 'Salad', 'Chicken', 'Seafood', 'Sides', 'Dessert', 'Drinks'];

export default function AddItemScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = useTheme();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageLocal, setImageLocal] = useState(null); // local picked image URI
  const [category, setCategory] = useState('Pizza');
  const [isSaving, setIsSaving] = useState(false);

  const pickImage = () => {
    Alert.alert('Add Photo', 'Choose how to add a food image', [
      {
        text: 'Take Photo', onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            showToast({ type: 'warning', message: 'Camera permission needed.' });
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.7,
          });
          if (!result.canceled) {
            setImageLocal(result.assets[0].uri);
            setImageUrl('');
          }
        },
      },
      {
        text: 'From Gallery', onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            showToast({ type: 'warning', message: 'Gallery permission needed.' });
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.7,
          });
          if (!result.canceled) {
            setImageLocal(result.assets[0].uri);
            setImageUrl('');
          }
        },
      },
      {
        text: 'Paste URL', onPress: () => {
          setImageLocal(null);
          // User will type in the URL input
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    if (!name.trim() || !price) {
      showToast({ type: 'warning', message: 'Please fill in name and price.' });
      return;
    }
    setIsSaving(true);
    try {
      const restaurant = await fetchMyRestaurant();
      if (!restaurant) {
        showToast({ type: 'error', message: 'Please set up your restaurant first (Profile → Restaurant Info).' });
        setIsSaving(false);
        return;
      }

      // Determine final image URL - upload local images to Supabase Storage
      let finalImage = imageUrl.trim();
      if (imageLocal) {
        try {
          finalImage = await uploadImage(imageLocal, 'menu-items');
        } catch {
          showToast({ type: 'warning', message: 'Image upload failed, using local URI.' });
          finalImage = imageLocal;
        }
      }

      await addMenuItem(restaurant.id, {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        image: finalImage,
        category,
        isAvailable: true,
      });
      showToast({ type: 'success', message: `${name} added to your menu!` });
      router.back();
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to add item. Try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const displayImage = imageLocal || (imageUrl.trim().length > 10 ? imageUrl.trim() : null);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: c.backgroundSecondary }]}>
          <Ionicons name="arrow-back" size={22} color={c.text} />
        </Pressable>
        <Text variant="h3" style={{ color: c.text }}>Add Menu Item</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Image picker area */}
        <Pressable
          onPress={pickImage}
          style={[
            styles.imagePicker,
            { borderColor: c.border, backgroundColor: c.backgroundSecondary },
          ]}
        >
          {displayImage ? (
            <Image source={{ uri: displayImage }} style={styles.imagePreview} resizeMode="cover" />
          ) : (
            <>
              <Ionicons name="camera-outline" size={36} color={c.textMuted} />
              <Text variant="bodySmall" style={{ color: c.textMuted, fontWeight: '600' }}>
                Tap to add food photo
              </Text>
              <Text variant="caption" style={{ color: c.textMuted }}>
                Camera · Gallery · URL
              </Text>
            </>
          )}
          {displayImage && (
            <View style={styles.imageOverlay}>
              <Ionicons name="camera" size={20} color="#FFF" />
              <Text variant="caption" style={{ color: '#FFF', fontWeight: '700' }}>Change</Text>
            </View>
          )}
        </Pressable>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>ITEM NAME</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.backgroundSecondary, borderColor: c.border, color: c.text }]}
              placeholder="e.g. Margherita Pizza"
              value={name}
              onChangeText={setName}
              placeholderTextColor={c.textMuted}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>DESCRIPTION</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: c.backgroundSecondary, borderColor: c.border, color: c.text }]}
              placeholder="Describe your dish..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              placeholderTextColor={c.textMuted}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>PRICE ({CURRENCY_SYMBOL})</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.backgroundSecondary, borderColor: c.border, color: c.text }]}
              placeholder="0.00"
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
                    styles.catPill,
                    { borderColor: c.border },
                    category === cat && { backgroundColor: c.primary, borderColor: c.primary },
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text variant="bodySmall" style={[
                    { color: c.textSecondary, fontWeight: '600' },
                    category === cat && { color: '#FFF' },
                  ]}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Save button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.base, backgroundColor: c.background }]}>
        <Pressable
          style={[styles.saveBtn, { backgroundColor: c.primary, opacity: isSaving ? 0.7 : 1 }]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving
            ? <ActivityIndicator size="small" color="#FFF" />
            : <Text variant="body" style={styles.saveBtnText}>ADD TO MENU</Text>}
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
  imagePicker: {
    height: 180, borderRadius: radius.lg, borderWidth: 1.5, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%', height: '100%', borderRadius: radius.lg,
  },
  imageOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
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
