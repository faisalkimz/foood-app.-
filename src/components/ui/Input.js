import { TextInput, StyleSheet, View } from 'react-native';
import Text from './Text';
import { colors, spacing, radius, fontSize } from '../../theme';

export default function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  style,
  containerStyle,
  ...props
}) {
  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? <Text variant="label" style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputContainer, error && styles.inputError]}>
        {leftIcon}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textMuted}
          {...props}
        />
        {rightIcon}
      </View>
      {error ? <Text variant="caption" style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
  },
  inputError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  error: {
    color: colors.error,
  },
});
