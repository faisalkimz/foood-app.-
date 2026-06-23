/**
 * Skeleton.js — Premium shimmer loading placeholders
 *
 * Usage:
 *   <Skeleton width={120} height={16} />                    // text line
 *   <Skeleton width={60} height={60} borderRadius={30} />   // circle avatar
 *   <Skeleton height={180} borderRadius={16} />             // card (full width)
 *   <Skeleton.Home />                                        // full home skeleton
 *   <Skeleton.Orders />                                      // full orders skeleton
 *   <Skeleton.RestaurantDetail />                             // restaurant detail skeleton
 */
import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useThemeStore } from '../../store';
import { spacing, radius } from '../../theme';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Core shimmer block ──────────────────────────────────────────────────────

function SkeletonBlock({ width, height = 16, borderRadius = 8, style }) {
  const isDark = useThemeStore((s) => s.isDark);
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-SCREEN_W, SCREEN_W],
  });

  const baseColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const shimmerColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.03)';

  return (
    <View
      style={[
        {
          width: width || '100%',
          height,
          borderRadius,
          backgroundColor: baseColor,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: shimmerColor,
          transform: [{ translateX }],
          width: '60%',
          borderRadius,
        }}
      />
    </View>
  );
}

// ─── Composed skeletons for specific screens ─────────────────────────────────

/** Single restaurant card skeleton */
function RestaurantCardSkeleton() {
  return (
    <View style={sk.card}>
      <SkeletonBlock height={160} borderRadius={radius.lg} />
      <View style={sk.cardBody}>
        <View style={sk.cardRow}>
          <SkeletonBlock width={140} height={18} />
          <SkeletonBlock width={40} height={18} borderRadius={radius.full} />
        </View>
        <SkeletonBlock width={200} height={12} style={{ marginTop: 6 }} />
        <View style={[sk.cardRow, { marginTop: 10 }]}>
          <SkeletonBlock width={70} height={12} />
          <SkeletonBlock width={5} height={5} borderRadius={3} />
          <SkeletonBlock width={60} height={12} />
          <SkeletonBlock width={5} height={5} borderRadius={3} />
          <SkeletonBlock width={50} height={12} />
        </View>
      </View>
    </View>
  );
}

/** Single order card skeleton */
function OrderCardSkeleton() {
  return (
    <View style={sk.orderCard}>
      <View style={sk.orderTop}>
        <SkeletonBlock width={48} height={48} borderRadius={12} />
        <View style={{ flex: 1, gap: 6 }}>
          <SkeletonBlock width={130} height={16} />
          <SkeletonBlock width={90} height={12} />
        </View>
        <SkeletonBlock width={72} height={26} borderRadius={radius.full} />
      </View>
      <View style={sk.orderDivider} />
      <View style={sk.orderBottom}>
        <SkeletonBlock width={100} height={12} />
        <SkeletonBlock width={80} height={14} />
      </View>
    </View>
  );
}

/** Category pill skeleton */
function CategorySkeleton() {
  return (
    <View style={sk.catRow}>
      {[60, 55, 65, 50, 55, 60, 50].map((w, i) => (
        <SkeletonBlock key={i} width={w} height={38} borderRadius={radius.full} />
      ))}
    </View>
  );
}

/** Full Home screen skeleton */
function HomeSkeleton() {
  return (
    <View style={sk.container}>
      {/* Header */}
      <View style={sk.headerRow}>
        <View style={{ flex: 1, gap: 6 }}>
          <SkeletonBlock width={80} height={10} />
          <SkeletonBlock width={180} height={16} />
          <SkeletonBlock width={120} height={11} />
        </View>
        <SkeletonBlock width={44} height={44} borderRadius={22} />
      </View>

      {/* Greeting */}
      <View style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.md }}>
        <SkeletonBlock width={200} height={14} />
        <SkeletonBlock width={240} height={22} style={{ marginTop: 6 }} />
      </View>

      {/* Search bar */}
      <View style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.lg }}>
        <SkeletonBlock height={48} borderRadius={radius.full} />
      </View>

      {/* Categories */}
      <CategorySkeleton />

      {/* Section header */}
      <View style={[sk.headerRow, { marginTop: spacing.lg, marginBottom: spacing.md }]}>
        <SkeletonBlock width={130} height={18} />
        <SkeletonBlock width={40} height={12} />
      </View>

      {/* Restaurant cards */}
      <View style={{ paddingHorizontal: spacing.xl, gap: spacing.lg }}>
        <RestaurantCardSkeleton />
        <RestaurantCardSkeleton />
      </View>
    </View>
  );
}

/** Full Orders screen skeleton */
function OrdersSkeleton() {
  return (
    <View style={sk.container}>
      {/* Tab pills */}
      <View style={[sk.catRow, { gap: 12, paddingHorizontal: spacing.xl, marginBottom: spacing.lg }]}>
        <SkeletonBlock width={110} height={36} borderRadius={radius.full} />
        <SkeletonBlock width={100} height={36} borderRadius={radius.full} />
      </View>

      {/* Order cards */}
      <View style={{ paddingHorizontal: spacing.xl, gap: spacing.md }}>
        <OrderCardSkeleton />
        <OrderCardSkeleton />
        <OrderCardSkeleton />
        <OrderCardSkeleton />
      </View>
    </View>
  );
}

/** Restaurant detail header skeleton */
function RestaurantDetailSkeleton() {
  return (
    <View style={sk.container}>
      {/* Hero image */}
      <SkeletonBlock height={220} borderRadius={0} />

      <View style={{ padding: spacing.xl, gap: spacing.md }}>
        {/* Title + rating */}
        <View style={sk.headerRow}>
          <SkeletonBlock width={180} height={22} />
          <SkeletonBlock width={50} height={22} borderRadius={radius.full} />
        </View>
        <SkeletonBlock width={240} height={14} />

        {/* Info pills */}
        <View style={[sk.cardRow, { gap: 12, marginTop: spacing.sm }]}>
          <SkeletonBlock width={80} height={30} borderRadius={radius.full} />
          <SkeletonBlock width={90} height={30} borderRadius={radius.full} />
          <SkeletonBlock width={70} height={30} borderRadius={radius.full} />
        </View>

        {/* Menu section */}
        <SkeletonBlock width={90} height={18} style={{ marginTop: spacing.lg }} />

        {/* Menu items */}
        {[1, 2, 3].map((i) => (
          <View key={i} style={sk.menuItem}>
            <View style={{ flex: 1, gap: 6 }}>
              <SkeletonBlock width={140} height={16} />
              <SkeletonBlock width={200} height={12} />
              <SkeletonBlock width={60} height={14} />
            </View>
            <SkeletonBlock width={80} height={80} borderRadius={12} />
          </View>
        ))}
      </View>
    </View>
  );
}

/** Food detail skeleton */
function FoodDetailSkeleton() {
  return (
    <View style={sk.container}>
      <SkeletonBlock height={280} borderRadius={0} />
      <View style={{ padding: spacing.xl, gap: spacing.md }}>
        <SkeletonBlock width={200} height={24} />
        <SkeletonBlock width={100} height={16} />
        <SkeletonBlock height={14} style={{ marginTop: spacing.sm }} />
        <SkeletonBlock width={'80%'} height={14} />
        <View style={[sk.cardRow, { marginTop: spacing.lg }]}>
          <SkeletonBlock width={80} height={20} />
          <SkeletonBlock width={100} height={40} borderRadius={radius.full} />
        </View>
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const sk = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: spacing.xl,
  },
  card: { borderRadius: radius.lg, overflow: 'hidden' },
  cardBody: { paddingTop: spacing.md, gap: 2 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  catRow: {
    flexDirection: 'row', gap: spacing.sm,
    paddingHorizontal: spacing.xl, overflow: 'hidden',
  },
  orderCard: {
    borderRadius: radius.lg, padding: spacing.base,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)',
  },
  orderTop: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
  },
  orderDivider: {
    height: 1, backgroundColor: 'rgba(0,0,0,0.04)',
    marginVertical: spacing.md,
  },
  orderBottom: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.md,
  },
});

// ─── Attach sub-components ───────────────────────────────────────────────────

SkeletonBlock.Home = HomeSkeleton;
SkeletonBlock.Orders = OrdersSkeleton;
SkeletonBlock.RestaurantDetail = RestaurantDetailSkeleton;
SkeletonBlock.FoodDetail = FoodDetailSkeleton;
SkeletonBlock.RestaurantCard = RestaurantCardSkeleton;
SkeletonBlock.OrderCard = OrderCardSkeleton;

export default SkeletonBlock;
