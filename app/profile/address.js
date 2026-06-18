import { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../src/components/ui';
import { useTheme } from '../../src/providers/ThemeProvider';
import { spacing, radius } from '../../src/theme';

const savedAddresses = [
  { id: '1', label: 'HOME', icon: 'home', address: '3466 Royal Ln. Mesa, New Jersey 45463' },
  { id: '2', label: 'WORK', icon: 'briefcase', address: '3891 Ranchview Dr. Richardson, California 62639' },
];

const ADDRESS_LABELS = ['Home', 'Work', 'Other'];

export default function AddressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = useTheme();

  const [street, setStreet] = useState('');
  const [postCode, setPostCode] = useState('');
  const [apartment, setApartment] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('Home');

  const handleSaveLocation = () => {
    Alert.alert('✅ Saved', 'Your address has been saved.');
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: c.backgroundSecondary }]}>
          <Ionicons name="arrow-back" size={22} color={c.text} />
        </Pressable>
        <Text variant="h3" style={{ color: c.text }}>My Address</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Saved addresses */}
        {savedAddresses.map((addr) => (
          <Pressable key={addr.id} style={[styles.addressCard, { backgroundColor: c.backgroundSecondary }]}>
            <View style={styles.addressLeft}>
              <View style={[styles.addressIcon, { backgroundColor: c.primaryLight }]}>
                <Ionicons name={addr.icon} size={18} color={c.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="label" style={[styles.addressLabel, { color: c.text }]}>
                  {addr.label}
                </Text>
                <Text variant="bodySmall" style={{ color: c.textSecondary }} numberOfLines={2}>
                  {addr.address}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
          </Pressable>
        ))}

        {/* Address form */}
        <View style={[styles.formSection, { borderTopColor: c.borderLight }]}>
          <Text variant="label" style={[styles.formTitle, { color: c.text }]}>ADDRESS</Text>
          <View style={[styles.addressBox, { backgroundColor: c.backgroundSecondary, borderColor: c.border }]}>
            <Ionicons name="location" size={18} color={c.primary} />
            <Text variant="bodySmall" style={{ color: c.textSecondary, flex: 1 }}>
              3235 Royal Ln. Mesa, New Jersey 34567
            </Text>
          </View>

          <View style={styles.fieldRow}>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>STREET</Text>
              <TextInput
                style={[styles.input, { backgroundColor: c.backgroundSecondary, borderColor: c.border, color: c.text }]}
                placeholder="Mason Roger"
                value={street}
                onChangeText={setStreet}
                placeholderTextColor={c.textMuted}
              />
            </View>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>POST CODE</Text>
              <TextInput
                style={[styles.input, { backgroundColor: c.backgroundSecondary, borderColor: c.border, color: c.text }]}
                placeholder="34987"
                value={postCode}
                onChangeText={setPostCode}
                keyboardType="number-pad"
                placeholderTextColor={c.textMuted}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>APPARTMENT</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.backgroundSecondary, borderColor: c.border, color: c.text }]}
              placeholder="345"
              value={apartment}
              onChangeText={setApartment}
              placeholderTextColor={c.textMuted}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>LABEL AS</Text>
            <View style={styles.labelRow}>
              {ADDRESS_LABELS.map((lbl) => (
                <Pressable
                  key={lbl}
                  style={[
                    styles.labelPill,
                    { borderColor: c.border },
                    selectedLabel === lbl && { backgroundColor: c.primary, borderColor: c.primary },
                  ]}
                  onPress={() => setSelectedLabel(lbl)}
                >
                  <Text variant="bodySmall" style={[
                    { color: c.textSecondary, fontWeight: '600' },
                    selectedLabel === lbl && { color: '#FFF' },
                  ]}>
                    {lbl}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Save button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.base, backgroundColor: c.background }]}>
        <Pressable style={[styles.saveBtn, { backgroundColor: c.primary }]} onPress={handleSaveLocation}>
          <Text variant="body" style={styles.saveBtnText}>SAVE LOCATION</Text>
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
  content: { paddingHorizontal: spacing.xl, gap: spacing.md },
  addressCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: spacing.base, borderRadius: radius.lg,
  },
  addressLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  addressIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  addressLabel: { fontWeight: '700', fontSize: 13, letterSpacing: 0.5, marginBottom: 2 },
  formSection: { borderTopWidth: 1, paddingTop: spacing.lg, gap: spacing.lg },
  formTitle: { fontWeight: '700', fontSize: 14 },
  addressBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    padding: spacing.base, borderRadius: radius.md, borderWidth: 1,
  },
  fieldRow: { flexDirection: 'row', gap: spacing.md },
  fieldGroup: { gap: spacing.xs },
  fieldLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  input: {
    borderWidth: 1, borderRadius: radius.md,
    paddingVertical: spacing.md, paddingHorizontal: spacing.base, fontSize: 15,
  },
  labelRow: { flexDirection: 'row', gap: spacing.md },
  labelPill: {
    paddingVertical: spacing.sm, paddingHorizontal: spacing.xl,
    borderRadius: radius.full, borderWidth: 1.5,
  },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: spacing.xl, paddingTop: spacing.base,
  },
  saveBtn: { paddingVertical: spacing.base, borderRadius: radius.full, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16, letterSpacing: 0.5 },
});
