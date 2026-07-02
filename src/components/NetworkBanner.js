import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { spacing } from '@/theme';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export default function NetworkBanner() {
  const isConnected = useNetworkStatus();
  const slideAnim = useRef(new Animated.Value(isConnected ? -60 : 0)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isConnected ? -60 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isConnected, slideAnim]);

  return (
    <Animated.View
      style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}
      pointerEvents={isConnected ? 'none' : 'auto'}
    >
      <Ionicons name="cloud-offline-outline" size={16} color="#FFF" />
      <Text variant="bodySmall" style={styles.text}>No internet connection</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
    paddingTop: spacing.xl,
  },
  text: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 13,
  },
});
