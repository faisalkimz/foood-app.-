import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import useNetworkStatus from '@/hooks/useNetworkStatus';
import { spacing } from '@/theme';

export default function NetworkBanner() {
  const isConnected = useNetworkStatus();

  if (isConnected) return null;

  return (
    <View style={styles.banner}>
      <Ionicons name="cloud-offline-outline" size={16} color="#FFF" />
      <Text variant="caption" style={styles.text}>No internet connection</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.xs, paddingVertical: spacing.sm,
    backgroundColor: '#DC2626',
  },
  text: { color: '#FFF', fontWeight: '600', fontSize: 13 },
});
