import { useState, useEffect } from 'react';
import {
  View, StyleSheet, ScrollView, Pressable, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../src/components/ui';
import { useTheme } from '../../src/providers/ThemeProvider';
import { supabase } from '../../src/services/supabase';
import { fetchMyRestaurant } from '../../src/services/restaurantService';
import { spacing, radius } from '../../src/theme';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function EarningsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [todayOrders, setTodayOrders] = useState(0);
  const [weekRevenue, setWeekRevenue] = useState(0);
  const [monthRevenue, setMonthRevenue] = useState(0);
  const [dailyBreakdown, setDailyBreakdown] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const restaurant = await fetchMyRestaurant();
        const now = new Date();
        const today = now.toISOString().split('T')[0];

        // Start of week (Sunday)
        const dayOfWeek = now.getDay();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - dayOfWeek);
        const weekStartStr = weekStart.toISOString().split('T')[0];

        // Start of month
        const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

        // Fetch orders for the last 7 days
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 6);
        const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

        const { data: orders } = await supabase
          .from('orders')
          .select('total_amount, status, created_at')
          .eq('restaurant_id', restaurant.id)
          .neq('status', 'cancelled')
          .gte('created_at', `${sevenDaysAgoStr}T00:00:00`)
          .order('created_at', { ascending: true });

        const allOrders = orders || [];

        // Today
        const todayData = allOrders.filter((o) => o.created_at.startsWith(today));
        setTodayOrders(todayData.length);
        setTodayRevenue(todayData.reduce((s, o) => s + parseFloat(o.total_amount || 0), 0));

        // Fetch week + month totals
        const { data: weekOrders } = await supabase
          .from('orders')
          .select('total_amount')
          .eq('restaurant_id', restaurant.id)
          .neq('status', 'cancelled')
          .gte('created_at', `${weekStartStr}T00:00:00`);

        const { data: monthOrders } = await supabase
          .from('orders')
          .select('total_amount')
          .eq('restaurant_id', restaurant.id)
          .neq('status', 'cancelled')
          .gte('created_at', `${monthStart}T00:00:00`);

        setWeekRevenue((weekOrders || []).reduce((s, o) => s + parseFloat(o.total_amount || 0), 0));
        setMonthRevenue((monthOrders || []).reduce((s, o) => s + parseFloat(o.total_amount || 0), 0));

        // Daily breakdown (last 7 days)
        const breakdown = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(now.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const dayOrders = allOrders.filter((o) => o.created_at.startsWith(dateStr));
          breakdown.push({
            id: dateStr,
            label: DAY_NAMES[d.getDay()],
            amount: dayOrders.reduce((s, o) => s + parseFloat(o.total_amount || 0), 0),
            orders: dayOrders.length,
          });
        }
        setDailyBreakdown(breakdown);
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const maxAmount = Math.max(...dailyBreakdown.map((e) => e.amount), 1);

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
            <Text variant="h1" style={styles.revAmount}>UGX {todayRevenue.toLocaleString()}</Text>
            <Text variant="caption" style={styles.revSub}>{todayOrders} orders</Text>
          </View>
          <View style={styles.revenueRow}>
            <View style={[styles.revenueCardSmall, { backgroundColor: c.backgroundSecondary }]}>
              <Text variant="caption" style={{ color: c.textMuted }}>This Week</Text>
              <Text variant="h3" style={{ color: c.text, fontWeight: '800' }}>UGX {weekRevenue.toLocaleString()}</Text>
            </View>
            <View style={[styles.revenueCardSmall, { backgroundColor: c.backgroundSecondary }]}>
              <Text variant="caption" style={{ color: c.textMuted }}>This Month</Text>
              <Text variant="h3" style={{ color: c.text, fontWeight: '800' }}>UGX {monthRevenue.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Bar chart */}
        <View style={[styles.chartCard, { backgroundColor: c.backgroundSecondary }]}>
          <Text variant="label" style={[styles.sectionLabel, { color: c.textMuted }]}>LAST 7 DAYS</Text>
          <View style={styles.chartContainer}>
            {dailyBreakdown.map((day) => {
              const height = Math.max((day.amount / maxAmount) * 120, 8);
              return (
                <View key={day.id} style={styles.barCol}>
                  <View style={[styles.bar, { height, backgroundColor: c.primary }]} />
                  <Text variant="caption" style={[styles.barLabel, { color: c.textMuted }]}>{day.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Daily breakdown */}
        <View style={styles.payoutSection}>
          <Text variant="label" style={[styles.sectionLabel, { color: c.textMuted }]}>DAILY BREAKDOWN</Text>
          {dailyBreakdown.map((day) => (
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
                UGX {day.amount.toLocaleString()}
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
  bar: { width: 28, borderRadius: 8, minHeight: 8 },
  barLabel: { fontSize: 11, fontWeight: '600' },
  payoutSection: { gap: spacing.sm },
  payoutRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.base, borderRadius: radius.lg,
  },
  payoutLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  payoutIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  payoutLabel: { fontWeight: '700', fontSize: 15 },
  payoutAmount: { fontWeight: '800', fontSize: 16 },
});
