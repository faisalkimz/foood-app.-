import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Image, Animated, ImageBackground, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Text } from '../../src/components/ui';
import { spacing } from '../../src/theme';

const DRIVER_NAME = 'Robert Fox';
const DRIVER_PHOTO = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600';

export default function CallingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [status, setStatus] = useState('Calling...');
  const [callTime, setCallTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();

    // Ring pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.7, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    // Simulate connection phases
    const t1 = setTimeout(() => setStatus('Ringing...'), 1500);
    const t2 = setTimeout(() => setStatus('connected'), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (status !== 'connected') return;
    const i = setInterval(() => setCallTime((t) => t + 1), 1000);
    return () => clearInterval(i);
  }, [status]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <ImageBackground source={{ uri: DRIVER_PHOTO }} style={styles.bg} blurRadius={Platform.OS === 'android' ? 25 : 0}>
      {/* iOS blur overlay */}
      {Platform.OS === 'ios' && (
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
      )}

      {/* Dark overlay for readability */}
      <View style={[StyleSheet.absoluteFill, styles.darkOverlay]} />

      <Animated.View style={[styles.content, { opacity: fadeAnim, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 30 }]}>
        {/* Top — status */}
        <View style={styles.topSection}>
          {/* Ringing pulse rings */}
          <View style={styles.avatarContainer}>
            <Animated.View style={[styles.pulseRing, styles.pulseOuter, { opacity: pulseAnim }]} />
            <Animated.View style={[styles.pulseRing, styles.pulseMiddle, { opacity: pulseAnim }]} />
            <Image source={{ uri: DRIVER_PHOTO }} style={styles.avatar} />
          </View>

          <Text style={styles.name}>{DRIVER_NAME}</Text>
          <Text style={styles.statusText}>
            {status === 'connected' ? fmt(callTime) : status}
          </Text>
        </View>

        {/* Middle — action grid (iPhone style) */}
        <View style={styles.actionsGrid}>
          <View style={styles.actionRow}>
            <Pressable style={styles.actionItem} onPress={() => setIsMuted(!isMuted)}>
              <View style={[styles.actionCircle, isMuted && styles.actionCircleActive]}>
                <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={26} color="#FFF" />
              </View>
              <Text style={styles.actionLabel}>{isMuted ? 'unmute' : 'mute'}</Text>
            </Pressable>

            <Pressable style={styles.actionItem} onPress={() => Alert.alert('Keypad', 'Keypad not available during in-app calls')}>
              <View style={styles.actionCircle}>
                <Ionicons name="keypad" size={26} color="#FFF" />
              </View>
              <Text style={styles.actionLabel}>keypad</Text>
            </Pressable>

            <Pressable style={styles.actionItem} onPress={() => setIsSpeaker(!isSpeaker)}>
              <View style={[styles.actionCircle, isSpeaker && styles.actionCircleActive]}>
                <Ionicons name={isSpeaker ? 'volume-high' : 'volume-medium'} size={26} color="#FFF" />
              </View>
              <Text style={styles.actionLabel}>speaker</Text>
            </Pressable>
          </View>

          <View style={styles.actionRow}>
            <Pressable style={styles.actionItem} onPress={() => Alert.alert('Add Call', 'Conference calls not supported')}>
              <View style={styles.actionCircle}>
                <Ionicons name="add" size={26} color="#FFF" />
              </View>
              <Text style={styles.actionLabel}>add call</Text>
            </Pressable>

            <Pressable style={styles.actionItem} onPress={() => Alert.alert('Video', 'Video calls coming soon')}>
              <View style={styles.actionCircle}>
                <Ionicons name="videocam" size={26} color="#FFF" />
              </View>
              <Text style={styles.actionLabel}>FaceTime</Text>
            </Pressable>

            <Pressable style={styles.actionItem} onPress={() => Alert.alert('Contacts', 'Not available during calls')}>
              <View style={styles.actionCircle}>
                <Ionicons name="person" size={26} color="#FFF" />
              </View>
              <Text style={styles.actionLabel}>contacts</Text>
            </Pressable>
          </View>
        </View>

        {/* Bottom — end call */}
        <Pressable style={styles.endBtn} onPress={() => router.back()}>
          <Ionicons name="call" size={32} color="#FFF" style={{ transform: [{ rotate: '135deg' }] }} />
        </Pressable>
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  darkOverlay: { backgroundColor: 'rgba(0,0,0,0.45)' },
  content: {
    flex: 1, justifyContent: 'space-between', alignItems: 'center',
  },

  // Top
  topSection: { alignItems: 'center', gap: 8 },
  avatarContainer: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  pulseRing: { position: 'absolute', borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  pulseOuter: { width: 120, height: 120 },
  pulseMiddle: { width: 100, height: 100 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  name: { color: '#FFF', fontSize: 28, fontWeight: '300', letterSpacing: 0.5 },
  statusText: { color: 'rgba(255,255,255,0.6)', fontSize: 15, fontWeight: '400' },

  // Actions grid (2x3 like iPhone)
  actionsGrid: { gap: 28 },
  actionRow: { flexDirection: 'row', justifyContent: 'center', gap: 44 },
  actionItem: { alignItems: 'center', gap: 6, width: 70 },
  actionCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
  },
  actionCircleActive: { backgroundColor: 'rgba(255,255,255,0.45)' },
  actionLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '400' },

  // End
  endBtn: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#FF3B30',
    alignItems: 'center', justifyContent: 'center',
  },
});
