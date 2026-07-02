import { Text as RNText } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';
import { fontSize, fontWeight } from '../../theme';

const variantStyles = {
  h1: { fontSize: fontSize['3xl'], fontWeight: fontWeight.bold },
  h2: { fontSize: fontSize['2xl'], fontWeight: fontWeight.bold },
  h3: { fontSize: fontSize.xl, fontWeight: fontWeight.semiBold },
  body: { fontSize: fontSize.base, fontWeight: fontWeight.regular },
  bodySmall: { fontSize: fontSize.md, fontWeight: fontWeight.regular },
  caption: { fontSize: fontSize.sm, fontWeight: fontWeight.regular },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
};

const variantColorKeys = {
  h1: 'text',
  h2: 'text',
  h3: 'text',
  body: 'text',
  bodySmall: 'textSecondary',
  caption: 'textMuted',
  label: 'text',
};

export default function Text({ variant = 'body', style, children, ...props }) {
  const c = useTheme();
  const colorKey = variantColorKeys[variant] || 'text';

  return (
    <RNText style={[variantStyles[variant] || variantStyles.body, { color: c[colorKey] }, style]} {...props}>
      {children}
    </RNText>
  );
}
