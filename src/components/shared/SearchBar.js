import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../ui';
import { useTheme } from '../../providers/ThemeProvider';
import { spacing } from '../../theme';

export default function SearchBar({ value, onChangeText, onPress, autoFocus, placeholder = 'Search food, restaurants...' }) {
  const c = useTheme();

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.pressable}>
        <View pointerEvents="none">
          <Input
            value={value}
            placeholder={placeholder}
            editable={false}
            leftIcon={<Ionicons name="search" size={20} color={c.textMuted} />}
          />
        </View>
      </Pressable>
    );
  }

  return (
    <Input
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      autoFocus={autoFocus}
      leftIcon={<Ionicons name="search" size={20} color={c.textMuted} />}
    />
  );
}

const styles = StyleSheet.create({
  pressable: { marginBottom: spacing.sm },
});
