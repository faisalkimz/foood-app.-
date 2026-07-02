import { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Image, Linking, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { supabase } from '@/services/supabase';
import { spacing } from '@/theme';
import { FALLBACK_CONTACT } from '@/constants';

export default function CallingScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [contactName, setContactName] = useState('Restaurant');
  const [contactPhoto, setContactPhoto] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [status, setStatus] = useState('Connecting...');
  const [callInitiated, setCallInitiated] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    (async () => {
      try {
        const { data: order } = await supabase
          .from('orders')
          .select('restaurants ( name, image_url, phone )')
          .eq('id', orderId)
          .single();
        if (order?.restaurants) {
          setContactName(order.restaurants.name);
          setContactPhoto(order.restaurants.image_url);
          setPhoneNumber(order.restaurants.phone || null);

          if (order.restaurants.phone) {
            initiateCall(order.restaurants.phone);
          } else {
            setStatus('No phone number available');
          }
        }
      } catch {
        setContactName(FALLBACK_CONTACT.name);
        setContactPhoto(FALLBACK_CONTACT.image_url);
        setStatus('Unable to load contact info');
      }
    })();
  }, [orderId]);

  const initiateCall = async (phone) => {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    const url = Platform.OS === 'android' ? `tel:${cleaned}` : `telprompt:${cleaned}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      setStatus('Calling...');
      setCallInitiated(true);
      await Linking.openURL(url);
      setStatus('Call ended');
    } else {
      Alert.alert('Phone Call', `Call ${phone}`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  const handleCallAgain = () => {
    if (phoneNumber) {
      setCallInitiated(false);
      initiateCall(phoneNumber);
    }
  };

  const avatarUri = contactPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(contactName)}&background=FF6B35&color=fff&size=200`;

  return (
    <View style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 30 }]}>
        <View style={styles.topSection}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          </View>
          <Text style={styles.name}>{contactName}</Text>
          {phoneNumber && <Text style={styles.phoneText}>{phoneNumber}</Text>}
          <Text style={styles.statusText}>{status}</Text>
        </View>

        <View style={styles.actionsCenter}>
          {!phoneNumber ? (
            <Text style={styles.errorText}>This restaurant has not set a phone number yet.</Text>
          ) : callInitiated ? (
            <Pressable style={styles.callAgainBtn} onPress={handleCallAgain}>
              <Ionicons name="call" size={24} color="#FFF" />
              <Text style={styles.callAgainText}>Call Again</Text>
            </Pressable>
          ) : null}
        </View>

        <Pressable style={styles.endBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#FFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1D26' },
  content: {
    flex: 1, justifyContent: 'space-between', alignItems: 'center',
  },
  topSection: { alignItems: 'center', gap: 8, marginTop: 40 },
  avatarContainer: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)' },
  name: { color: '#FFF', fontSize: 28, fontWeight: '600', letterSpacing: 0.5 },
  phoneText: { color: 'rgba(255,255,255,0.5)', fontSize: 16, fontWeight: '400' },
  statusText: { color: 'rgba(255,255,255,0.6)', fontSize: 15, fontWeight: '400', marginTop: 4 },
  errorText: { color: 'rgba(255,255,255,0.5)', fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
  actionsCenter: { alignItems: 'center' },
  callAgainBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 12, paddingHorizontal: 24,
    borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.15)',
  },
  callAgainText: { color: '#FFF', fontSize: 16, fontWeight: '500' },
  endBtn: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#FF3B30',
    alignItems: 'center', justifyContent: 'center',
  },
});
