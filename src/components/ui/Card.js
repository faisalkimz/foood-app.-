import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';
import { spacing, radius, shadow } from '../../theme';

export default function Card({ children, style, padded = true, shadowLevel = 'md' }) {
  const c = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: c.surface }, shadow[shadowLevel], padded && styles.padded, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, overflow: 'hidden' },
  padded: { padding: spacing.base },
});
