import { View, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../ui';
import { useTheme } from '../../providers/ThemeProvider';
import { spacing } from '../../theme';

export default function Header({ title, showBack = false, onBack, rightAction }) {
  const insets = useSafeAreaInsets();
  const c = useTheme();

  return (
    <View style={[styles.container, {
      paddingTop: insets.top + spacing.sm,
      backgroundColor: c.background,
      borderBottomColor: c.borderLight,
    }]}>
      <View style={styles.row}>
        {showBack ? (
          <Pressable onPress={onBack} style={styles.backButton} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={c.text} />
          </Pressable>
        ) : (
          <View style={styles.placeholder} />
        )}
        <Text variant="h3" style={[styles.title, { color: c.text }]}>{title}</Text>
        <View style={styles.right}>{rightAction || <View style={styles.placeholder} />}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
  },
  placeholder: { width: 40 },
  title: { flex: 1, textAlign: 'center' },
  right: { width: 40, alignItems: 'flex-end' },
});
