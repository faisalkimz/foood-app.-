import { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../src/components/ui';
import { useTheme } from '../../src/providers/ThemeProvider';
import { spacing, radius } from '../../src/theme';

export default function RestaurantInfoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = useTheme();

  const [name, setName] = useState('Rose Garden Restaurant');
  const [description, setDescription] = useState('Fresh ingredients, traditional recipes, and a passion for great food. We serve the best burgers, pizzas, and salads in town.');
  const [cuisine, setCuisine] = useState('Burger · Pizza · Salad · Wings');
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('22:00');
  const [phone, setPhone] = useState('+256 700 123 456');

  const handleSave = () => {
    Alert.alert('✅ Saved', 'Restaurant info updated.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
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
        {/* Cover image */}
        <Pressable style={[styles.coverWrap, { backgroundColor: c.backgroundSecondary }]} onPress={() => Alert.alert('📸 Cover Photo', 'Photo picker will be available once connected to backend')}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600' }}
            style={styles.coverImage}
          />
          <View style={[styles.editCoverBtn, { backgroundColor: c.primary }]}>
            <Ionicons name="camera" size={16} color="#FFF" />
          </View>
        </Pressable>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>RESTAURANT NAME</Text>
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
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor={c.textMuted}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>CUISINE TAGS</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.backgroundSecondary, borderColor: c.border, color: c.text }]}
              value={cuisine}
              onChangeText={setCuisine}
              placeholderTextColor={c.textMuted}
            />
          </View>

          <View style={styles.timeRow}>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>OPENS AT</Text>
              <TextInput
                style={[styles.input, { backgroundColor: c.backgroundSecondary, borderColor: c.border, color: c.text }]}
                value={openTime}
                onChangeText={setOpenTime}
                placeholderTextColor={c.textMuted}
              />
            </View>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>CLOSES AT</Text>
              <TextInput
                style={[styles.input, { backgroundColor: c.backgroundSecondary, borderColor: c.border, color: c.text }]}
                value={closeTime}
                onChangeText={setCloseTime}
                placeholderTextColor={c.textMuted}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>PHONE NUMBER</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.backgroundSecondary, borderColor: c.border, color: c.text }]}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor={c.textMuted}
            />
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
  coverWrap: { borderRadius: radius.lg, overflow: 'hidden', position: 'relative' },
  coverImage: { width: '100%', height: 180 },
  editCoverBtn: {
    position: 'absolute', bottom: 12, right: 12,
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  form: { gap: spacing.lg },
  fieldGroup: { gap: spacing.xs },
  fieldLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  input: {
    borderWidth: 1, borderRadius: radius.md,
    paddingVertical: spacing.md, paddingHorizontal: spacing.base, fontSize: 15,
  },
  textArea: { minHeight: 100 },
  timeRow: { flexDirection: 'row', gap: spacing.md },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: spacing.xl, paddingTop: spacing.base,
  },
  saveBtn: { paddingVertical: spacing.base, borderRadius: radius.full, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16, letterSpacing: 0.5 },
});
