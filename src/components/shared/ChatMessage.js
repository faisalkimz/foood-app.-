import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui';
import { spacing, radius } from '@/theme';

export default function ChatMessage({ item, isMe, c }) {
  return (
    <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
      <View style={[
        styles.bubble,
        isMe
          ? [styles.bubbleMe, { backgroundColor: c.primary }]
          : [styles.bubbleOther, { backgroundColor: c.backgroundSecondary }],
      ]}>
        <Text variant="body" style={[styles.bubbleText, { color: isMe ? '#FFF' : c.text }]}>
          {item.text}
        </Text>
      </View>
      <Text variant="caption" style={[styles.timeText, isMe && styles.timeTextMe]}>
        {item.time}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  msgRow: { marginBottom: spacing.md, alignItems: 'flex-start' },
  msgRowMe: { alignItems: 'flex-end' },
  bubble: {
    maxWidth: '78%', paddingVertical: spacing.md, paddingHorizontal: spacing.base,
    borderRadius: radius.lg,
  },
  bubbleMe: { borderBottomRightRadius: 4 },
  bubbleOther: { borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 15, lineHeight: 21 },
  timeText: { fontSize: 10, marginTop: 4 },
  timeTextMe: { textAlign: 'right' },
});
