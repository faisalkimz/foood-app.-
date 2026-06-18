import { TextInput, StyleSheet, View } from 'react-native';
import Text from './Text';
import { useTheme } from '../../providers/ThemeProvider';
import { spacing, radius, fontSize } from '../../theme';

export default function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  style,
  containerStyle,
  ...props
}) {
  const c = useTheme();

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? <Text variant="label" style={[styles.label, { color: c.text }]}>{label}</Text> : null}
      <View style={[styles.inputContainer, { backgroundColor: c.backgroundSecondary, borderColor: c.border }, error && { borderColor: c.error }]}>
        {leftIcon}
        <TextInput
          style={[styles.input, { color: c.text }, style]}
          placeholderTextColor={c.textMuted}
          {...props}
        />
        {rightIcon}
      </View>
      {error ? <Text variant="caption" style={[styles.error, { color: c.error }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  label: { marginBottom: spacing.xs },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: radius.md, borderWidth: 1,
    paddingHorizontal: spacing.base, gap: spacing.sm,
  },
  input: { flex: 1, fontSize: fontSize.base, paddingVertical: spacing.md },
  error: {},
});
