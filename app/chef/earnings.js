import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../src/components/ui';
import { useTheme } from '../../src/providers/ThemeProvider';
import { chefStats, earningsHistory } from '../../src/services/mock/data';
import { spacing, radius } from '../../src/theme';

export default function EarningsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = useTheme();

  const maxAmount = Math.max(...earningsHistory.map((e) => e.amount));

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: c.backgroundSecondary }]}>
          <Ionicons name="arrow-back" size={22} color={c.text} />
        </Pressable>
        <Text variant="h3" style={{ color: c.text }}>Earnings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Revenue cards */}
        <View style={styles.revenueCards}>
          <View style={[styles.revenueCard, { backgroundColor: c.primary }]}>
            <Text variant="caption" style={styles.revLabel}>Today</Text>
            <Text variant="h1" style={styles.revAmount}>${chefStats.todayRevenue}</Text>
            <Text variant="caption" style={styles.revSub}>{chefStats.todayOrders} orders</Text>
          </View>
          <View style={styles.revenueRow}>
            <View style={[styles.revenueCardSmall, { backgroundColor: c.backgroundSecondary }]}>
              <Text variant="caption" style={{ color: c.textMuted }}>This Week</Text>
              <Text variant="h3" style={{ color: c.text, fontWeight: '800' }}>${chefStats.weekRevenue}</Text>
            </View>
            <View style={[styles.revenueCardSmall, { backgroundColor: c.backgroundSecondary }]}>
              <Text variant="caption" style={{ color: c.textMuted }}>This Month</Text>
              <Text variant="h3" style={{ color: c.text, fontWeight: '800' }}>${chefStats.monthRevenue}</Text>
            </View>
          </View>
        </View>

        {/* Bar chart */}
        <View style={[styles.chartCard, { backgroundColor: c.backgroundSecondary }]}>
          <Text variant="label" style={[styles.sectionLabel, { color: c.textMuted }]}>LAST 7 DAYS</Text>
          <View style={styles.chartContainer}>
            {earningsHistory.map((day) => {
              const height = (day.amount / maxAmount) * 120;
              return (
                <View key={day.id} style={styles.barCol}>
                  <View style={[styles.bar, { height, backgroundColor: c.primary }]}>
                    <View style={[styles.barInner, { backgroundColor: c.primary }]} />
                  </View>
                  <Text variant="caption" style={[styles.barLabel, { color: c.textMuted }]}>{day.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Payout history */}
        <View style={styles.payoutSection}>
          <Text variant="label" style={[styles.sectionLabel, { color: c.textMuted }]}>DAILY BREAKDOWN</Text>
          {earningsHistory.map((day) => (
            <View key={day.id} style={[styles.payoutRow, { backgroundColor: c.backgroundSecondary }]}>
              <View style={styles.payoutLeft}>
                <View style={[styles.payoutIcon, { backgroundColor: c.primary + '20' }]}>
                  <Ionicons name="cash" size={18} color={c.primary} />
                </View>
                <View>
                  <Text variant="body" style={[styles.payoutLabel, { color: c.text }]}>{day.label}</Text>
                  <Text variant="caption" style={{ color: c.textMuted }}>{day.orders} orders</Text>
                </View>
              </View>
              <Text variant="body" style={[styles.payoutAmount, { color: c.text }]}>
                ${day.amount.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
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
  revenueCards: { gap: spacing.md },
  revenueCard: {
    padding: spacing.xl, borderRadius: radius.xl, alignItems: 'center', gap: 4,
  },
  revLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  revAmount: { color: '#FFF', fontSize: 36, fontWeight: '800' },
  revSub: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
  revenueRow: { flexDirection: 'row', gap: spacing.md },
  revenueCardSmall: {
    flex: 1, padding: spacing.base, borderRadius: radius.lg, alignItems: 'center', gap: 4,
  },
  chartCard: { padding: spacing.base, borderRadius: radius.lg },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: spacing.md },
  chartContainer: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    height: 140, paddingTop: spacing.md,
  },
  barCol: { alignItems: 'center', flex: 1, gap: 6 },
  bar: {
    width: 28, borderRadius: 8, minHeight: 8,
    overflow: 'hidden', justifyContent: 'flex-end',
  },
  barInner: { width: '100%', borderRadius: 8 },
  barLabel: { fontSize: 11, fontWeight: '600' },
  payoutSection: { gap: spacing.sm },
  payoutRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.base, borderRadius: radius.lg,
  },
  payoutLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  payoutIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  payoutLabel: { fontWeight: '700', fontSize: 15 },
  payoutAmount: { fontWeight: '800', fontSize: 16 },
});
