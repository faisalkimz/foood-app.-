import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../src/components/shared';
import { Text, Button } from '../../src/components/ui';
import { colors, spacing } from '../../src/theme';

export default function OrderTrackingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Header title="Order Tracking" showBack onBack={() => router.back()} />
      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <Ionicons name="checkmark-circle" size={80} color={colors.success} />
        </View>
        <Text variant="h2">Order Placed!</Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          Your order is being prepared and will arrive soon.
        </Text>
        <Button title="Back to Home" onPress={() => router.replace('/(tabs)')} style={styles.button} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  iconWrapper: {
    marginBottom: spacing.lg,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    width: '100%',
  },
});
