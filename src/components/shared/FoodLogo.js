import { View, StyleSheet, Text as RNText } from 'react-native';
import { colors } from '../../theme';

/**
 * Stylised "Food" wordmark matching the Figma design.
 * The double-o is rendered as orange circles (bowl accent).
 *
 * @param {'dark'|'light'} variant – controls text colour
 * @param {number} size – base font size (default 42)
 */
export default function FoodLogo({ variant = 'light', size = 42 }) {
  const textColor = variant === 'dark' ? colors.textInverse : colors.text;
  const bowlSize = size * 0.48;
  const bowlOffset = size * 0.12; // align bowls with text baseline

  return (
    <View style={styles.container}>
      <View style={styles.wordmark}>
        <RNText style={[styles.letter, { fontSize: size, color: textColor }]}>
          F
        </RNText>

        {/* First 'o' — orange bowl with steam */}
        <View style={[styles.bowlWrap, { marginBottom: bowlOffset }]}>
          <View
            style={[
              styles.bowl,
              {
                width: bowlSize,
                height: bowlSize,
                borderRadius: bowlSize / 2,
              },
            ]}
          />
          {/* Steam lines */}
          <View style={styles.steamWrap}>
            <View style={[styles.steam, { height: bowlSize * 0.28 }]} />
            <View style={[styles.steam, { height: bowlSize * 0.35 }]} />
          </View>
        </View>

        {/* Second 'o' — plain orange bowl */}
        <View style={[styles.bowlWrap, { marginBottom: bowlOffset }]}>
          <View
            style={[
              styles.bowl,
              {
                width: bowlSize,
                height: bowlSize,
                borderRadius: bowlSize / 2,
              },
            ]}
          />
        </View>

        <RNText style={[styles.letter, { fontSize: size, color: textColor }]}>
          d
        </RNText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  wordmark: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  letter: {
    fontWeight: '800',
    includeFontPadding: false, // Android: remove extra padding
  },
  bowlWrap: {
    alignItems: 'center',
    marginHorizontal: 2,
  },
  bowl: {
    backgroundColor: colors.primary,
  },
  steamWrap: {
    position: 'absolute',
    bottom: '85%',
    flexDirection: 'row',
    gap: 4,
  },
  steam: {
    width: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
    opacity: 0.7,
  },
});
