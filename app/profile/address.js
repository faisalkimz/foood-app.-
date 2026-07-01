import { useState, useCallback } from 'react';
import {
  View, StyleSheet, Pressable, ScrollView, TextInput,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Text } from '@/components/ui';
import { showToast } from '@/components/ui';
import { useTheme } from '@/providers/ThemeProvider';
import { spacing, radius } from '@/theme';
import { useLocationStore } from '@/store/locationStore';

const LABEL_OPTIONS = [
  { label: 'Home', icon: 'home-outline' },
  { label: 'Work', icon: 'briefcase-outline' },
  { label: 'School', icon: 'school-outline' },
  { label: 'Other', icon: 'location-outline' },
];

// ─── Sub-screen: address form (add / edit) ─────────────────────────────────
function AddressForm({ initial, onSave, onCancel }) {
  const c = useTheme();
  const [label, setLabel] = useState(initial?.label || 'Home');
  const [icon, setIcon] = useState(initial?.icon || 'home-outline');
  const [name, setName] = useState(initial?.name || '');
  const [street, setStreet] = useState(initial?.street || '');
  const [city, setCity] = useState(initial?.city || '');
  const [region, setRegion] = useState(initial?.region || '');
  const [country, setCountry] = useState(initial?.country || '');
  const [note, setNote] = useState(initial?.note || '');
  const [detecting, setDetecting] = useState(false);

  const detectCurrent = async () => {
    setDetecting(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showToast({ type: 'warning', message: 'Location permission denied.' });
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [geo] = await Location.reverseGeocodeAsync(pos.coords);
      if (geo) {
        setName(geo.name || geo.street || '');
        setStreet(geo.street || '');
        setCity(geo.city || geo.subregion || '');
        setRegion(geo.region || '');
        setCountry(geo.country || '');
        showToast({ type: 'success', message: 'Location detected!' });
      }
    } catch {
      showToast({ type: 'error', message: 'Could not detect location. Fill in manually.' });
    } finally {
      setDetecting(false);
    }
  };

  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    if (saving) return;
    if (!street && !name && !city) {
      showToast({ type: 'warning', message: 'Please enter at least a street or city.' });
      return;
    }
    setSaving(true);
    onSave({ label, icon, name, street, city, region, country, note });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={[styles.formContent, { paddingBottom: 120 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* GPS detect button */}
        <Pressable
          style={[styles.detectBtn, { borderColor: c.primary, backgroundColor: c.primaryLight }]}
          onPress={detectCurrent}
          disabled={detecting}
        >
          {detecting
            ? <ActivityIndicator size="small" color={c.primary} />
            : <Ionicons name="navigate" size={18} color={c.primary} />}
          <Text variant="body" style={[styles.detectBtnText, { color: c.primary }]}>
            {detecting ? 'Detecting…' : 'Use My Current Location'}
          </Text>
        </Pressable>

        <View style={[styles.dividerRow, { borderColor: c.borderLight }]}>
          <View style={[styles.dividerLine, { backgroundColor: c.borderLight }]} />
          <Text variant="caption" style={{ color: c.textMuted, paddingHorizontal: spacing.sm }}>or enter manually</Text>
          <View style={[styles.dividerLine, { backgroundColor: c.borderLight }]} />
        </View>

        {/* Label selector */}
        <View style={styles.fieldGroup}>
          <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>LABEL AS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.labelRow}>
            {LABEL_OPTIONS.map((opt) => (
              <Pressable
                key={opt.label}
                style={[
                  styles.labelPill,
                  { borderColor: c.border },
                  label === opt.label && { backgroundColor: c.primary, borderColor: c.primary },
                ]}
                onPress={() => { setLabel(opt.label); setIcon(opt.icon); }}
              >
                <Ionicons name={opt.icon} size={14} color={label === opt.label ? '#FFF' : c.textSecondary} />
                <Text variant="bodySmall" style={[
                  { fontWeight: '600', color: c.textSecondary },
                  label === opt.label && { color: '#FFF' },
                ]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Address name / landmark */}
        <View style={styles.fieldGroup}>
          <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>LANDMARK / NAME</Text>
          <TextInput
            style={[styles.input, { backgroundColor: c.backgroundSecondary, borderColor: c.border, color: c.text }]}
            placeholder="e.g. Kampala Mall, Nakumatt"
            value={name}
            onChangeText={setName}
            placeholderTextColor={c.textMuted}
          />
        </View>

        {/* Street */}
        <View style={styles.fieldGroup}>
          <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>STREET / ROAD</Text>
          <TextInput
            style={[styles.input, { backgroundColor: c.backgroundSecondary, borderColor: c.border, color: c.text }]}
            placeholder="e.g. Entebbe Road"
            value={street}
            onChangeText={setStreet}
            placeholderTextColor={c.textMuted}
          />
        </View>

        {/* City + Region row */}
        <View style={styles.fieldRow}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>CITY / AREA</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.backgroundSecondary, borderColor: c.border, color: c.text }]}
              placeholder="e.g. Kampala"
              value={city}
              onChangeText={setCity}
              placeholderTextColor={c.textMuted}
            />
          </View>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>REGION / STATE</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.backgroundSecondary, borderColor: c.border, color: c.text }]}
              placeholder="e.g. Central"
              value={region}
              onChangeText={setRegion}
              placeholderTextColor={c.textMuted}
            />
          </View>
        </View>

        {/* Country */}
        <View style={styles.fieldGroup}>
          <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>COUNTRY</Text>
          <TextInput
            style={[styles.input, { backgroundColor: c.backgroundSecondary, borderColor: c.border, color: c.text }]}
            placeholder="e.g. Uganda"
            value={country}
            onChangeText={setCountry}
            placeholderTextColor={c.textMuted}
          />
        </View>

        {/* Note */}
        <View style={styles.fieldGroup}>
          <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>DELIVERY NOTE (optional)</Text>
          <TextInput
            style={[styles.input, styles.noteInput, { backgroundColor: c.backgroundSecondary, borderColor: c.border, color: c.text }]}
            placeholder="e.g. Gate 3, apartment 12B, call on arrival…"
            value={note}
            onChangeText={setNote}
            placeholderTextColor={c.textMuted}
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>

      {/* Bottom buttons */}
      <View style={[styles.formBottom, { backgroundColor: c.background, borderTopColor: c.borderLight, paddingBottom: 24 }]}>
        <Pressable style={[styles.cancelBtn, { borderColor: c.border }]} onPress={onCancel}>
          <Text variant="body" style={{ color: c.textSecondary, fontWeight: '600' }}>Cancel</Text>
        </Pressable>
        <Pressable style={[styles.saveBtn, { backgroundColor: c.primary, opacity: saving ? 0.6 : 1 }]} onPress={handleSave} disabled={saving}>
          <Text variant="body" style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save Address'}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Main screen ────────────────────────────────────────────────────────────
export default function AddressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = useTheme();

  const {
    savedAddresses,
    selectedAddressId,
    addAddress,
    updateAddress,
    removeAddress,
    selectAddress,
  } = useLocationStore();

  const [view, setView] = useState('list'); // 'list' | 'add' | 'edit'
  const [editingAddr, setEditingAddr] = useState(null);

  const handleSelect = async (addr) => {
    await selectAddress(addr.id);
    showToast({ type: 'success', message: `Delivering to ${addr.name || addr.street || addr.city}` });
    router.back();
  };

  const handleAdd = async (data) => {
    try {
      await addAddress(data, null, true);
      showToast({ type: 'success', message: `${data.label} address saved!` });
      setView('list');
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to save.' });
    }
  };

  const handleEdit = async (data) => {
    await updateAddress(editingAddr.id, data);
    showToast({ type: 'success', message: 'Address updated.' });
    setView('list');
    setEditingAddr(null);
  };

  const handleDelete = (addr) => {
    Alert.alert(
      'Delete Address',
      `Remove "${addr.label}" address?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            await removeAddress(addr.id);
            showToast({ type: 'info', message: 'Address removed.' });
          },
        },
      ]
    );
  };

  const getAddressLine = (addr) => {
    const parts = [addr.name, addr.street, addr.city, addr.region, addr.country].filter(Boolean);
    return parts.join(', ') || 'No address details';
  };

  const title = view === 'list' ? 'Delivery Address' : view === 'add' ? 'Add New Address' : 'Edit Address';

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, backgroundColor: c.backgroundSecondary }]}>
        <Pressable
          onPress={() => view === 'list' ? router.back() : (setView('list'), setEditingAddr(null))}
          style={styles.backBtn}
          hitSlop={12}
        >
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </Pressable>
        <Text variant="h3" style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* ── LIST VIEW ── */}
      {view === 'list' && (
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Subtitle */}
          <View style={[styles.subtitleBar, { backgroundColor: c.backgroundSecondary }]}>
            <Ionicons name="globe-outline" size={14} color={c.textMuted} />
            <Text variant="caption" style={{ color: c.textMuted, flex: 1 }}>
              Order food worldwide — select or add any delivery location
            </Text>
          </View>

          {savedAddresses.length === 0 && (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: c.primaryLight }]}>
                <Ionicons name="location-outline" size={36} color={c.primary} />
              </View>
              <Text variant="h3" style={{ color: c.text, textAlign: 'center' }}>No Saved Addresses</Text>
              <Text variant="bodySmall" style={{ color: c.textSecondary, textAlign: 'center', lineHeight: 20 }}>
                Add your first delivery address to get started. You can save multiple locations.
              </Text>
            </View>
          )}

          {savedAddresses.map((addr) => {
            const isSelected = addr.id === selectedAddressId;
            return (
              <Pressable
                key={addr.id}
                style={[
                  styles.addressCard,
                  { borderColor: isSelected ? c.primary : c.borderLight, backgroundColor: isSelected ? c.primaryLight : c.background },
                ]}
                onPress={() => handleSelect(addr)}
              >
                {/* Left icon */}
                <View style={[styles.addrIcon, { backgroundColor: isSelected ? c.primary : c.backgroundSecondary }]}>
                  <Ionicons name={addr.icon || 'home-outline'} size={20} color={isSelected ? '#FFF' : c.textSecondary} />
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                  <View style={styles.addrTopRow}>
                    <Text variant="label" style={[styles.addrLabel, { color: isSelected ? c.primary : c.text }]}>
                      {addr.label}
                    </Text>
                    {isSelected && (
                      <View style={[styles.selectedBadge, { backgroundColor: c.primary }]}>
                        <Text variant="caption" style={{ color: '#FFF', fontSize: 10, fontWeight: '700' }}>SELECTED</Text>
                      </View>
                    )}
                  </View>
                  <Text variant="bodySmall" style={{ color: c.textSecondary }} numberOfLines={2}>
                    {getAddressLine(addr)}
                  </Text>
                  {addr.note ? (
                    <Text variant="caption" style={{ color: c.textMuted, marginTop: 2 }} numberOfLines={1}>
                      📝 {addr.note}
                    </Text>
                  ) : null}
                </View>

                {/* Actions */}
                <View style={styles.addrActions}>
                  <Pressable
                    hitSlop={10}
                    onPress={() => { setEditingAddr(addr); setView('edit'); }}
                    style={[styles.actionBtn, { backgroundColor: c.backgroundSecondary }]}
                  >
                    <Ionicons name="create-outline" size={16} color={c.textSecondary} />
                  </Pressable>
                  <Pressable
                    hitSlop={10}
                    onPress={() => handleDelete(addr)}
                    style={[styles.actionBtn, { backgroundColor: '#FEF2F2' }]}
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </Pressable>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* ── ADD / EDIT VIEW ── */}
      {(view === 'add' || view === 'edit') && (
        <AddressForm
          initial={view === 'edit' ? editingAddr : null}
          onSave={view === 'add' ? handleAdd : handleEdit}
          onCancel={() => { setView('list'); setEditingAddr(null); }}
        />
      )}

      {/* ── Floating "Add new" button (list view only) ── */}
      {view === 'list' && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.base, backgroundColor: c.background, borderTopColor: c.borderLight }]}>
          <Pressable
            style={[styles.addBtn, { backgroundColor: c.primary }]}
            onPress={() => setView('add')}
          >
            <Ionicons name="add" size={20} color="#FFF" />
            <Text variant="body" style={styles.addBtnText}>Add a New Address</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingBottom: spacing.md,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },

  // Subtitle bar
  subtitleBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },

  // Empty state
  emptyState: {
    alignItems: 'center', paddingHorizontal: spacing.xl,
    paddingTop: 60, gap: spacing.md,
  },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm,
  },

  // Address cards
  addressCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: spacing.xl, marginVertical: spacing.xs,
    borderRadius: radius.lg, borderWidth: 1.5,
    padding: spacing.base, gap: spacing.md,
  },
  addrIcon: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  addrTopRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 2 },
  addrLabel: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  selectedBadge: {
    paddingHorizontal: spacing.sm, paddingVertical: 2,
    borderRadius: radius.full,
  },
  addrActions: { gap: spacing.xs },
  actionBtn: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: spacing.xl, paddingTop: spacing.base,
    borderTopWidth: 1,
  },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, paddingVertical: spacing.base,
    borderRadius: radius.full,
  },
  addBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16, letterSpacing: 0.3 },

  // Form styles
  formContent: {
    paddingHorizontal: spacing.xl, paddingTop: spacing.xl, gap: spacing.lg,
  },
  detectBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, paddingVertical: spacing.base,
    borderRadius: radius.full, borderWidth: 1.5,
  },
  detectBtnText: { fontWeight: '700', fontSize: 15 },
  dividerRow: {
    flexDirection: 'row', alignItems: 'center',
    borderTopWidth: 0,
  },
  dividerLine: { flex: 1, height: 1 },
  fieldGroup: { gap: spacing.xs },
  fieldRow: { flexDirection: 'row', gap: spacing.md },
  fieldLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6 },
  input: {
    borderWidth: 1.5, borderRadius: radius.md,
    paddingVertical: spacing.md, paddingHorizontal: spacing.base,
    fontSize: 15,
  },
  noteInput: { minHeight: 80, textAlignVertical: 'top', paddingTop: spacing.md },
  labelRow: { flexDirection: 'row', gap: spacing.sm, paddingBottom: spacing.xs },
  labelPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    borderRadius: radius.full, borderWidth: 1.5,
  },
  formBottom: {
    flexDirection: 'row', gap: spacing.md,
    paddingHorizontal: spacing.xl, paddingTop: spacing.base,
    borderTopWidth: 1,
  },
  cancelBtn: {
    flex: 1, paddingVertical: spacing.base,
    borderRadius: radius.full, borderWidth: 1.5,
    alignItems: 'center',
  },
  saveBtn: {
    flex: 2, paddingVertical: spacing.base,
    borderRadius: radius.full, alignItems: 'center',
  },
  saveBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
