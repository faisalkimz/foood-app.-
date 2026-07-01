import { useState } from 'react';
import { View, StyleSheet, Pressable, FlatList, Alert, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, showToast } from '@/components/ui';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuthStore } from '@/store';
import { spacing, radius } from '@/theme';

const CARD_ICONS = {
  Visa: { color: '#1A1F71', icon: 'card' },
  Mastercard: { color: '#EB001B', icon: 'card' },
  Amex: { color: '#2E77BB', icon: 'card' },
};

function detectNetwork(num) {
  const clean = num.replace(/\s/g, '');
  if (clean.startsWith('4')) return 'Visa';
  if (clean.startsWith('5') || clean.startsWith('2')) return 'Mastercard';
  if (clean.startsWith('3')) return 'Amex';
  return 'Visa';
}

function formatCardNumber(text) {
  return text.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

export default function PaymentMethodScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = useTheme();
  const user = useAuthStore((s) => s.user);
  const userName = user?.full_name || user?.name || 'Card Holder';

  // Local state for cards (no DB table yet — persists only in session)
  const [cards, setCards] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [holder, setHolder] = useState(userName);

  // Mobile money accounts
  const [mobileAccounts, setMobileAccounts] = useState([]);
  const [showAddMobile, setShowAddMobile] = useState(false);
  const [mobileProvider, setMobileProvider] = useState('MTN MoMo');
  const [mobileNumber, setMobileNumber] = useState('');

  const deleteCard = (id) => {
    Alert.alert('Remove Card?', 'This card will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setCards((prev) => prev.filter((c) => c.id !== id)) },
    ]);
  };

  const deleteMobile = (id) => {
    Alert.alert('Remove Account?', 'This mobile money account will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setMobileAccounts((prev) => prev.filter((m) => m.id !== id)) },
    ]);
  };

  const handleAddCard = () => {
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 12 || !expiry) {
      Alert.alert('Missing Info', 'Please fill in card number and expiry.');
      return;
    }
    const last4 = cardNumber.replace(/\s/g, '').slice(-4);
    const type = detectNetwork(cardNumber);
    setCards((prev) => [...prev, { id: Date.now().toString(), type, last4, expiry, holder }]);
    showToast({ type: 'success', message: `${type} ····${last4} added!` });
    setShowAdd(false);
    setCardNumber('');
    setExpiry('');
    setHolder(userName);
  };

  const handleAddMobile = () => {
    if (!mobileNumber || mobileNumber.length < 10) {
      Alert.alert('Missing Info', 'Please enter a valid phone number.');
      return;
    }
    setMobileAccounts((prev) => [...prev, { id: Date.now().toString(), provider: mobileProvider, number: mobileNumber }]);
    showToast({ type: 'success', message: `${mobileProvider} added!` });
    setShowAddMobile(false);
    setMobileNumber('');
  };

  const allMethods = [
    ...cards.map((c) => ({ ...c, methodType: 'card' })),
    ...mobileAccounts.map((m) => ({ ...m, methodType: 'mobile' })),
  ];

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
        data={allMethods}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: insets.bottom + spacing.xl, gap: spacing.md }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="card-outline" size={56} color={c.textMuted} />
            <Text variant="body" style={{ color: c.textMuted }}>No payment methods saved</Text>
            <Text variant="caption" style={{ color: c.textMuted }}>Add a card or mobile money account below</Text>
          </View>
        }
        renderItem={({ item }) => {
          if (item.methodType === 'card') {
            const cardStyle = CARD_ICONS[item.type] || CARD_ICONS.Visa;
            return (
              <View style={[styles.cardItem, { backgroundColor: c.backgroundSecondary }]}>
                <View style={[styles.cardIcon, { backgroundColor: cardStyle.color }]}>
                  <Ionicons name={cardStyle.icon} size={20} color="#FFF" />
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
            );
          }
          // Mobile money
          return (
            <View style={[styles.cardItem, { backgroundColor: c.backgroundSecondary }]}>
              <View style={[styles.cardIcon, { backgroundColor: item.provider.includes('MTN') ? '#FFCC00' : '#ED1C24' }]}>
                <Ionicons name="phone-portrait" size={20} color={item.provider.includes('MTN') ? '#1A1A1A' : '#FFF'} />
              </View>
              <View style={styles.cardInfo}>
                <Text variant="body" style={[styles.cardType, { color: c.text }]}>{item.provider}</Text>
                <Text variant="caption">{item.number}</Text>
              </View>
              <Pressable onPress={() => deleteMobile(item.id)} hitSlop={8}>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </Pressable>
            </View>
          );
        }}
        ListFooterComponent={
          <View style={styles.footerBtns}>
            <Pressable style={[styles.addBtn, { borderColor: c.primary }]} onPress={() => setShowAdd(true)}>
              <Ionicons name="card" size={20} color={c.primary} />
              <Text variant="body" style={{ color: c.primary, fontWeight: '700' }}>ADD CARD</Text>
            </Pressable>
            <Pressable style={[styles.addBtn, { borderColor: '#FFCC00' }]} onPress={() => setShowAddMobile(true)}>
              <Ionicons name="phone-portrait" size={20} color="#D97706" />
              <Text variant="body" style={{ color: '#D97706', fontWeight: '700' }}>ADD MOBILE MONEY</Text>
            </Pressable>
          </View>
        }
      />

      {/* Add Card Modal */}
      <Modal visible={showAdd} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowAdd(false)} />
          <View style={[styles.modalContent, { backgroundColor: c.background, paddingBottom: insets.bottom + spacing.xl }]}>
            <View style={styles.modalHeader}>
              <Text variant="h3" style={{ color: c.text }}>Add Card</Text>
              <Pressable onPress={() => setShowAdd(false)} hitSlop={8}>
                <Ionicons name="close" size={24} color={c.text} />
              </Pressable>
            </View>
            <View style={styles.form}>
              <View style={styles.field}>
                <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>CARD NUMBER</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: c.backgroundSecondary, borderColor: c.border, color: c.text }]}
                  value={cardNumber} onChangeText={(t) => setCardNumber(formatCardNumber(t))}
                  placeholder="0000 0000 0000 0000" placeholderTextColor={c.textMuted}
                  keyboardType="number-pad" maxLength={19}
                />
              </View>
              <View style={styles.fieldRow}>
                <View style={[styles.field, { flex: 1 }]}>
                  <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>EXPIRY</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: c.backgroundSecondary, borderColor: c.border, color: c.text }]}
                    value={expiry} onChangeText={setExpiry}
                    placeholder="MM/YY" placeholderTextColor={c.textMuted} maxLength={5}
                  />
                </View>
                <View style={[styles.field, { flex: 1 }]}>
                  <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>HOLDER</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: c.backgroundSecondary, borderColor: c.border, color: c.text }]}
                    value={holder} onChangeText={setHolder}
                    placeholderTextColor={c.textMuted}
                  />
                </View>
              </View>
              <Pressable style={[styles.saveBtn, { backgroundColor: c.primary }]} onPress={handleAddCard}>
                <Text variant="body" style={styles.saveBtnText}>ADD CARD</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Mobile Money Modal */}
      <Modal visible={showAddMobile} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowAddMobile(false)} />
          <View style={[styles.modalContent, { backgroundColor: c.background, paddingBottom: insets.bottom + spacing.xl }]}>
            <View style={styles.modalHeader}>
              <Text variant="h3" style={{ color: c.text }}>Add Mobile Money</Text>
              <Pressable onPress={() => setShowAddMobile(false)} hitSlop={8}>
                <Ionicons name="close" size={24} color={c.text} />
              </Pressable>
            </View>
            <View style={styles.form}>
              <View style={styles.providerRow}>
                {['MTN MoMo', 'Airtel Money'].map((p) => (
                  <Pressable
                    key={p}
                    style={[
                      styles.providerBtn,
                      { borderColor: c.border, backgroundColor: c.backgroundSecondary },
                      mobileProvider === p && {
                        backgroundColor: p.includes('MTN') ? '#FFCC00' : '#ED1C24',
                        borderColor: p.includes('MTN') ? '#FFCC00' : '#ED1C24',
                      },
                    ]}
                    onPress={() => setMobileProvider(p)}
                  >
                    <Text variant="bodySmall" style={[
                      { fontWeight: '600', color: c.textSecondary },
                      mobileProvider === p && { color: p.includes('MTN') ? '#1A1A1A' : '#FFF', fontWeight: '800' },
                    ]}>{p}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.field}>
                <Text variant="label" style={[styles.fieldLabel, { color: c.textMuted }]}>PHONE NUMBER</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: c.backgroundSecondary, borderColor: c.border, color: c.text }]}
                  value={mobileNumber} onChangeText={setMobileNumber}
                  placeholder="0770 000 000" placeholderTextColor={c.textMuted}
                  keyboardType="phone-pad" maxLength={13}
                />
              </View>
              <Pressable style={[styles.saveBtn, { backgroundColor: c.primary }]} onPress={handleAddMobile}>
                <Text variant="body" style={styles.saveBtnText}>ADD ACCOUNT</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  empty: { alignItems: 'center', paddingTop: 80, gap: spacing.md },
  cardItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.base, borderRadius: radius.lg,
  },
  cardIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1, gap: 2 },
  cardType: { fontWeight: '700', fontSize: 15 },
  footerBtns: { gap: spacing.md, marginTop: spacing.md },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    paddingVertical: spacing.base, borderRadius: radius.lg, borderWidth: 1.5, borderStyle: 'dashed',
  },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: spacing.xl, paddingTop: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.xl,
  },
  form: { gap: spacing.lg },
  field: { gap: spacing.xs },
  fieldLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  fieldRow: { flexDirection: 'row', gap: spacing.md },
  input: {
    borderWidth: 1, borderRadius: radius.md,
    paddingVertical: spacing.md, paddingHorizontal: spacing.base, fontSize: 15,
  },
  providerRow: { flexDirection: 'row', gap: spacing.md },
  providerBtn: {
    flex: 1, paddingVertical: spacing.md, borderRadius: radius.md,
    borderWidth: 2, alignItems: 'center',
  },
  saveBtn: { paddingVertical: spacing.base, borderRadius: radius.full, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16, letterSpacing: 0.5 },
});
