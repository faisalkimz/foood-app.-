import { Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import Text from './Text';
import { colors, spacing, radius } from '../../theme';

const variants = {
  primary: {
    button: { backgroundColor: colors.primary },
    text: { color: colors.textInverse },
  },
  secondary: {
    button: { backgroundColor: colors.primaryLight },
    text: { color: colors.primary },
  },
  outline: {
    button: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
    text: { color: colors.text },
  },
  ghost: {
    button: { backgroundColor: 'transparent' },
    text: { color: colors.primary },
  },
};

const sizes = {
  sm: { button: { paddingVertical: spacing.sm, paddingHorizontal: spacing.base }, text: 'bodySmall' },
  md: { button: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg }, text: 'body' },
  lg: { button: { paddingVertical: spacing.base, paddingHorizontal: spacing.xl }, text: 'body' },
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
}) {
  const v = variants[variant];
  const s = sizes[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        v.button,
        s.button,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text.color} />
      ) : (
        <Text variant={s.text} style={[v.text, styles.label]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  label: {
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});
