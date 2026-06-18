import { useState, useRef, useCallback } from 'react';
import {
  View,
  Image,
  StyleSheet,
  FlatList,
  Dimensions,
  Pressable,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Button } from '../../src/components/ui';
import { useAuthStore } from '../../src/store';
import { colors, spacing, radius } from '../../src/theme';

const { width, height } = Dimensions.get('window');

// Local images – copied from generated assets
const slides = [
  {
    id: '1',
    title: 'All your favorites',
    description:
      'Get all your loved foods in one place, you just place the order we do the rest.',
    image: require('../../assets/images/onboarding_browse.png'),
  },
  {
    id: '2',
    title: 'Order from chosen chef',
    description:
      'Get all your loved foods in one place, you just place the order we do the rest.',
    image: require('../../assets/images/onboarding_chef.png'),
  },
  {
    id: '3',
    title: 'Free delivery offers',
    description:
      'Get all your loved foods in one place, you just place the order we do the rest.',
    image: require('../../assets/images/onboarding_delivery.png'),
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const isLastSlide = currentIndex === slides.length - 1;

  const handleNext = useCallback(() => {
    if (isLastSlide) {
      completeOnboarding();
      router.replace('/(auth)/login');
    } else {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  }, [currentIndex, isLastSlide]);

  const handleSkip = useCallback(() => {
    completeOnboarding();
    router.replace('/(auth)/login');
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const renderSlide = useCallback(({ item }) => (
    <View style={styles.slide}>
      {/* Illustration */}
      <View style={styles.imageWrapper}>
        <Image source={item.image} style={styles.image} resizeMode="contain" />
      </View>

      {/* Text content */}
      <View style={styles.textContent}>
        <Text variant="h1" style={styles.title}>
          {item.title}
        </Text>
        <Text variant="body" style={styles.description}>
          {item.description}
        </Text>
      </View>
    </View>
  ), []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Skip button */}
      {!isLastSlide && (
        <Pressable onPress={handleSkip} style={styles.skipButton} hitSlop={12}>
          <Text variant="body" style={styles.skipText}>
            Skip
          </Text>
        </Pressable>
      )}

      {/* Slides carousel */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        style={styles.flatList}
      />

      {/* Bottom section: dots + button */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + spacing.xl }]}>
        {/* Pagination dots */}
        <View style={styles.dotsRow}>
          {slides.map((_, index) => {
            const dotWidth = scrollX.interpolate({
              inputRange: [
                (index - 1) * width,
                index * width,
                (index + 1) * width,
              ],
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });

            const dotOpacity = scrollX.interpolate({
              inputRange: [
                (index - 1) * width,
                index * width,
                (index + 1) * width,
              ],
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity: dotOpacity,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* CTA Button */}
        <Pressable
          style={styles.ctaButton}
          onPress={handleNext}
          android_ripple={{ color: colors.primaryDark }}
        >
          <Text variant="body" style={styles.ctaText}>
            {isLastSlide ? 'GET STARTED' : 'NEXT'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const SLIDE_IMAGE_HEIGHT = height * 0.42;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skipButton: {
    position: 'absolute',
    top: 56,
    right: spacing.xl,
    zIndex: 10,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  skipText: {
    color: colors.textSecondary,
    fontWeight: '500',
    fontSize: 15,
  },
  flatList: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
  },
  imageWrapper: {
    height: SLIDE_IMAGE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    marginTop: spacing['3xl'],
  },
  image: {
    width: width * 0.75,
    height: SLIDE_IMAGE_HEIGHT,
  },
  textContent: {
    paddingHorizontal: spacing['2xl'],
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  title: {
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },
  description: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: spacing.base,
  },
  bottomSection: {
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: radius.full,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.base,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
