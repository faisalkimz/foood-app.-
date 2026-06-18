import { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Image, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../src/components/ui';
import { useTheme } from '../../src/providers/ThemeProvider';
import { spacing, radius } from '../../src/theme';

const DRIVER_NAME = 'Robert Fox';

export default function CallingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = useTheme();

  const [status, setStatus] = useState('Connecting...');
  const [callTime, setCallTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // Simulate connection
    const connectTimer = setTimeout(() => setStatus('Ringing...'), 1500);
    const answerTimer = setTimeout(() => setStatus('connected'), 3000);

    return () => {
      clearTimeout(connectTimer);
      clearTimeout(answerTimer);
    };
  }, []);

  // Call timer
  useEffect(() => {
    if (status !== 'connected') return;
    const interval = setInterval(() => setCallTime((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [status]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleEndCall = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.xl }]}>
      {/* Top area */}
      <View style={styles.topSection}>
        {/* Pulsing avatar ring */}
        <Animated.View style={[styles.avatarRing, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.avatarRingInner}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' }}
              style={styles.avatar}
            />
          </View>
        </Animated.View>

        <Text variant="h2" style={styles.driverName}>{DRIVER_NAME}</Text>
        <Text variant="bodySmall" style={styles.statusText}>
          {status === 'connected' ? formatTime(callTime) : status}
        </Text>
      </View>

      {/* Action buttons */}
      <View style={styles.actionsGrid}>
        <Pressable
          style={[styles.actionBtn, isMuted && styles.actionBtnActive]}
          onPress={() => setIsMuted(!isMuted)}
        >
          <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={24} color="#FFF" />
          <Text variant="caption" style={styles.actionLabel}>
            {isMuted ? 'Unmute' : 'Mute'}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.actionBtn, isSpeaker && styles.actionBtnActive]}
          onPress={() => setIsSpeaker(!isSpeaker)}
        >
          <Ionicons name={isSpeaker ? 'volume-high' : 'volume-medium'} size={24} color="#FFF" />
          <Text variant="caption" style={styles.actionLabel}>Speaker</Text>
        </Pressable>
      </View>

      {/* End call */}
      <View style={styles.endSection}>
        <Pressable style={styles.endBtn} onPress={handleEndCall}>
          <Ionicons name="call" size={30} color="#FFF" style={{ transform: [{ rotate: '135deg' }] }} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#1A1A2E',
    justifyContent: 'space-between', alignItems: 'center',
  },
  topSection: { alignItems: 'center', marginTop: 60 },
  avatarRing: {
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(255,107,53,0.15)', alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  avatarRingInner: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,107,53,0.25)', alignItems: 'center', justifyContent: 'center',
  },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#FF6B35' },
  driverName: { color: '#FFF', fontWeight: '700', fontSize: 26, marginBottom: spacing.sm },
  statusText: { color: 'rgba(255,255,255,0.6)', fontSize: 16 },
  actionsGrid: {
    flexDirection: 'row', gap: 40, justifyContent: 'center',
  },
  actionBtn: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center',
  },
  actionBtnActive: { backgroundColor: 'rgba(255,107,53,0.4)' },
  actionLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 6, position: 'absolute', bottom: -22 },
  endSection: { alignItems: 'center' },
  endBtn: {
    width: 70, height: 70, borderRadius: 35, backgroundColor: '#EF4444',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12,
  },
});
