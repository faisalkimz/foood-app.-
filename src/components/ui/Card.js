import { View, StyleSheet } from 'react-native';
import { colors, spacing, radius, shadow } from '../../theme';

export default function Card({ children, style, padded = true, shadowLevel = 'md' }) {
  return (
    <View style={[styles.card, shadow[shadowLevel], padded && styles.padded, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  padded: {
    padding: spacing.base,
  },
});
