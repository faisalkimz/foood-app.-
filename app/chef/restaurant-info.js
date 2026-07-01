import { useState, useEffect } from 'react';
import {
  View, StyleSheet, ScrollView, Pressable,
  TextInput, ActivityIndicator, Image, Switch, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Text, showToast } from '@/components/ui';
import { CURRENCY_SYMBOL } from '@/utils/format';
import { useTheme } from '@/providers/ThemeProvider';
import { spacing, radius } from '@/theme';
import { fetchMyRestaurant, updateMyRestaurant } from '@/services/restaurantService';
import { uploadImage } from '@/services/uploadService';

export default function RestaurantInfoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [restaurant, setRestaurant] = useState(null);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [imageUri, setImageUri] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchMyRestaurant();
        if (data) {
          setRestaurant(data);
          setName(data.name);
          setDescription(data.description || '');
          setCuisine(data.cuisine || '');
          setDeliveryTime(String(data.deliveryTime || 30));
          setDeliveryFee(String(data.deliveryFee || 0));
          setPhone(data.phone || '');
          setAddress(data.address || '');
          setOpeningHours(data.openingHours || '08:00 - 22:00');
          setIsActive(data.isActive !== false);
          setImageUri(data.image || '');
        }
      } catch (err) {
        showToast({ type: 'error', message: err.message || 'Failed to load restaurant info.' });
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const pickCoverImage = () => {
    Alert.alert('Restaurant Cover', 'Choose how to add a cover photo', [
      {
        text: 'Take Photo', onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') { showToast({ type: 'warning', message: 'Camera permission needed.' }); return; }
          const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [16, 9], quality: 0.7 });
          if (!result.canceled) setImageUri(result.assets[0].uri);
        },
      },
      {
        text: 'From Gallery', onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') { showToast({ type: 'warning', message: 'Gallery permission needed.' }); return; }
          const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [16, 9], quality: 0.7 });
          if (!result.canceled) setImageUri(result.assets[0].uri);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showToast({ type: 'warning', message: 'Restaurant name is required.' });
      return;
    }
    setIsSaving(true);
    try {
      let finalImage = imageUri;
      if (imageUri && imageUri.startsWith('file://')) {
        try {
          finalImage = await uploadImage(imageUri, 'restaurants');
        } catch {
          showToast({ type: 'warning', message: 'Image upload failed, using local URI.' });
          finalImage = imageUri;
        }
      }
      await updateMyRestaurant({
        name: name.trim(),
        description: description.trim(),
        cuisine: cuisine.trim(),
        deliveryTime: parseInt(deliveryTime) || 30,
        deliveryFee: parseFloat(deliveryFee) || 0,
        phone: phone.trim(),
        address: address.trim(),
        openingHours: openingHours.trim(),
        isActive,
        image: finalImage,
      });
      showToast({ type: 'success', message: 'Restaurant info updated!' });
      router.back();
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to save. Try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: c.backgroundSecondary }]}>
          <Ionicons name="arrow-back" size={22} color={c.text} />
        </Pressable>
        <Text variant="h3" style={{ color: c.text }}>Restaurant Info</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Cover image — tappable */}
        <Pressable onPress={pickCoverImage} style={[styles.coverWrap, { backgroundColor: c.backgroundSecondary }]}>
          <Image
            source={{ uri: imageUri || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Restaurant')}&background=FF6B35&color=fff&size=600` }}
            style={styles.coverImage}
          />
          <View style={styles.coverOverlay}>
            <Ionicons name="camera" size={20} color="#FFF" />
            <Text variant="caption" style={{ color: '#FFF', fontWeight: '700' }}>Change Cover</Text>
          </View>
        </Pressable>

        <View style={styles.form}>
          {field('RESTAURANT NAME', name, setName, { placeholder: 'e.g. Rose Garden Kitchen' })}
          {field('DESCRIPTION', description, setDescription, { multiline: true, placeholder: 'Tell customers what makes you special…' })}
          {field('CUISINE TYPE', cuisine, setCuisine, { placeholder: 'e.g. Burger · Pizza · Grills' })}

          <View style={styles.timeRow}>
            {field('DELIVERY TIME (min)', deliveryTime, setDeliveryTime, { keyboardType: 'number-pad', placeholder: '30' }, true)}
            {field(`DELIVERY FEE (${CURRENCY_SYMBOL})`, deliveryFee, setDeliveryFee, { keyboardType: 'decimal-pad', placeholder: '0' }, true)}
          </View>

          {field('PHONE NUMBER', phone, setPhone, { keyboardType: 'phone-pad', placeholder: '+256 700 000 000' })}
          {field('ADDRESS / AREA', address, setAddress, { placeholder: 'e.g. Kampala Road, Nakasero' })}
          {field('OPENING HOURS', openingHours, setOpeningHours, { placeholder: '08:00 - 22:00' })}

          {/* Active toggle */}
          <View style={[styles.toggleRow, { borderColor: c.borderLight }]}>
            <View>
              <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>RESTAURANT STATUS</Text>
              <Text variant="bodySmall" style={{ color: c.textSecondary }}>
                {isActive ? 'Open — visible to customers' : 'Closed — hidden from customers'}
              </Text>
            </View>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: c.border, true: c.primary }}
              thumbColor="#FFF"
            />
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
            : <Text variant="body" style={styles.saveBtnText}>SAVE CHANGES</Text>}
        </Pressable>
      </View>
    </View>
  );

  function field(label, value, onChange, props = {}, flex = false) {
    return (
      <View style={[styles.fieldGroup, flex && { flex: 1 }]}>
        <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>{label}</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: c.backgroundSecondary, borderColor: c.border, color: c.text },
            props.multiline && styles.textArea,
          ]}
          value={value}
          onChangeText={onChange}
          placeholderTextColor={c.textMuted}
          {...props}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingBottom: spacing.md,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: spacing.xl, gap: spacing.xl },
  coverWrap: { borderRadius: radius.lg, overflow: 'hidden' },
  coverImage: { width: '100%', height: 180 },
  coverOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  form: { gap: spacing.lg },
  fieldGroup: { gap: spacing.xs },
  fieldLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  input: {
    borderWidth: 1.5, borderRadius: radius.md,
    paddingVertical: spacing.md, paddingHorizontal: spacing.base, fontSize: 15,
  },
  textArea: { minHeight: 90, textAlignVertical: 'top', paddingTop: spacing.md },
  timeRow: { flexDirection: 'row', gap: spacing.md },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: spacing.base, borderTopWidth: 1, gap: spacing.md,
  },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: spacing.xl, paddingTop: spacing.base,
  },
  saveBtn: { paddingVertical: spacing.base, borderRadius: radius.full, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16, letterSpacing: 0.5 },
});
