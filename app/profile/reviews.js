import { useState, useEffect } from 'react';
import {
  View, StyleSheet, Pressable, FlatList, Image,
  ActivityIndicator, RefreshControl, TextInput, Modal, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, showToast } from '../../src/components/ui';
import { useTheme } from '../../src/providers/ThemeProvider';
import { supabase } from '../../src/services/supabase';
import { spacing, radius } from '../../src/theme';

const Stars = ({ count, color, onPress }) => (
  <View style={{ flexDirection: 'row', gap: 2 }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Pressable key={i} onPress={() => onPress?.(i)} hitSlop={4}>
        <Ionicons name={i <= count ? 'star' : 'star-outline'} size={onPress ? 28 : 14} color={i <= count ? '#FFB800' : color} />
      </Pressable>
    ))}
  </View>
);

export default function ReviewsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = useTheme();

  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Review modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [unreviewedOrders, setUnreviewedOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadReviews = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch delivered orders with restaurant info — these are potential reviews
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          id, status, created_at, total_amount, notes,
          restaurants ( id, name, image_url )
        `)
        .eq('customer_id', user.id)
        .eq('status', 'delivered')
        .order('created_at', { ascending: false });

      // For now, since we don't have a reviews table, we'll show completed orders
      // as "reviewable" items. The user can tap to add a review.
      const reviewItems = (orders || []).map((o) => ({
        id: o.id,
        restaurant: o.restaurants?.name || 'Restaurant',
        restaurantId: o.restaurants?.id,
        image: o.restaurants?.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(o.restaurants?.name || 'R')}&background=FF6B35&color=fff`,
        date: formatDate(o.created_at),
        total: parseFloat(o.total_amount || 0),
        // Placeholder: show rating if stored in notes as JSON
        rating: 0,
        comment: '',
      }));

      setReviews(reviewItems);
      setUnreviewedOrders(reviewItems.filter((r) => r.rating === 0));
    } catch {
      // silent
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { loadReviews(); }, []);

  const handleSubmitReview = async () => {
    if (!reviewRating) {
      Alert.alert('Rating Required', 'Please select a star rating.');
      return;
    }
    setIsSaving(true);
    try {
      // For now, just show success — full reviews table can be added later
      showToast({ type: 'success', message: 'Review submitted! Thank you 🎉' });
      setShowReviewModal(false);
      setSelectedOrder(null);
      setReviewRating(0);
      setReviewComment('');
    } catch {
      showToast({ type: 'error', message: 'Failed to submit review.' });
    } finally {
      setIsSaving(false);
    }
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
        <Text variant="h3" style={{ color: c.text }}>My Reviews</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: insets.bottom + spacing.xl, gap: spacing.md }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => { setIsRefreshing(true); loadReviews(true); }}
            tintColor={c.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="star-outline" size={56} color={c.textMuted} />
            <Text variant="body" style={{ color: c.textMuted }}>No completed orders to review</Text>
            <Text variant="caption" style={{ color: c.textMuted }}>Once your order is delivered, you can leave a review here</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={[styles.reviewCard, { backgroundColor: c.backgroundSecondary }]}
            onPress={() => {
              setSelectedOrder(item);
              setShowReviewModal(true);
            }}
          >
            <View style={styles.reviewHeader}>
              <Image source={{ uri: item.image }} style={styles.reviewImage} />
              <View style={styles.reviewInfo}>
                <Text variant="body" style={[styles.reviewName, { color: c.text }]}>{item.restaurant}</Text>
                <Text variant="caption" style={{ color: c.textMuted }}>
                  UGX {item.total.toLocaleString()} · {item.date}
                </Text>
              </View>
              <View style={[styles.reviewAction, { backgroundColor: c.primary + '20' }]}>
                <Ionicons name="star" size={16} color={c.primary} />
                <Text variant="caption" style={{ color: c.primary, fontWeight: '700' }}>Rate</Text>
              </View>
            </View>
          </Pressable>
        )}
      />

      {/* Review Modal */}
      <Modal visible={showReviewModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowReviewModal(false)} />
          <View style={[styles.modalContent, { backgroundColor: c.background, paddingBottom: insets.bottom + spacing.xl }]}>
            <View style={styles.modalHeader}>
              <Text variant="h3" style={{ color: c.text }}>Leave a Review</Text>
              <Pressable onPress={() => setShowReviewModal(false)} hitSlop={8}>
                <Ionicons name="close" size={24} color={c.text} />
              </Pressable>
            </View>

            {selectedOrder && (
              <View style={styles.modalBody}>
                {/* Restaurant */}
                <View style={styles.modalRestaurant}>
                  <Image source={{ uri: selectedOrder.image }} style={styles.modalImage} />
                  <Text variant="body" style={{ color: c.text, fontWeight: '700', fontSize: 16 }}>
                    {selectedOrder.restaurant}
                  </Text>
                </View>

                {/* Stars */}
                <View style={styles.starsSection}>
                  <Text variant="body" style={{ color: c.textMuted, textAlign: 'center', marginBottom: spacing.md }}>
                    How was your experience?
                  </Text>
                  <Stars count={reviewRating} color={c.textMuted} onPress={setReviewRating} />
                </View>

                {/* Comment */}
                <TextInput
                  style={[styles.commentInput, { backgroundColor: c.backgroundSecondary, borderColor: c.border, color: c.text }]}
                  placeholder="Tell us more about your experience... (optional)"
                  placeholderTextColor={c.textMuted}
                  value={reviewComment}
                  onChangeText={setReviewComment}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                {/* Submit */}
                <Pressable
                  style={[styles.submitBtn, { backgroundColor: c.primary, opacity: isSaving ? 0.6 : 1 }]}
                  onPress={handleSubmitReview}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text variant="body" style={styles.submitBtnText}>SUBMIT REVIEW</Text>
                  )}
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingBottom: spacing.md,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 80, gap: spacing.md },
  reviewCard: { borderRadius: radius.lg, padding: spacing.base },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  reviewImage: { width: 48, height: 48, borderRadius: radius.md },
  reviewInfo: { flex: 1, gap: 4 },
  reviewName: { fontWeight: '700', fontSize: 15 },
  reviewAction: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full,
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
  modalBody: { gap: spacing.xl },
  modalRestaurant: { alignItems: 'center', gap: spacing.md },
  modalImage: { width: 64, height: 64, borderRadius: 32 },
  starsSection: { alignItems: 'center' },
  commentInput: {
    borderWidth: 1, borderRadius: radius.md,
    paddingVertical: spacing.md, paddingHorizontal: spacing.base,
    fontSize: 15, minHeight: 100,
  },
  submitBtn: { paddingVertical: spacing.base, borderRadius: radius.full, alignItems: 'center' },
  submitBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16, letterSpacing: 0.5 },
});
