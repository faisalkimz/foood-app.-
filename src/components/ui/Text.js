import { Text as RNText, StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight } from '../../theme';

const variants = {
  h1: { fontSize: fontSize['3xl'], fontWeight: fontWeight.bold, color: colors.text },
  h2: { fontSize: fontSize['2xl'], fontWeight: fontWeight.bold, color: colors.text },
  h3: { fontSize: fontSize.xl, fontWeight: fontWeight.semiBold, color: colors.text },
  body: { fontSize: fontSize.base, fontWeight: fontWeight.regular, color: colors.text },
  bodySmall: { fontSize: fontSize.md, fontWeight: fontWeight.regular, color: colors.textSecondary },
  caption: { fontSize: fontSize.sm, fontWeight: fontWeight.regular, color: colors.textMuted },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.text },
};

export default function Text({ variant = 'body', style, children, ...props }) {
  return (
    <RNText style={[variants[variant], style]} {...props}>
      {children}
    </RNText>
  );
}
