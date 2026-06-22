import { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Animated, Pressable, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Global toast ref
let _showToast = () => {};

export function showToast({ type = 'error', message, duration = 3500 }) {
  _showToast({ type, message, duration });
}

const ICON_MAP = {
  success: { name: 'checkmark-circle', color: '#22C55E' },
  error: { name: 'close-circle', color: '#EF4444' },
  warning: { name: 'warning', color: '#F59E0B' },
  info: { name: 'information-circle', color: '#3B82F6' },
};

export function ToastProvider({ children }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState(null);
  const translateY = useRef(new Animated.Value(-100)).current;
  const timeoutRef = useRef(null);

  const hide = useCallback(() => {
    Animated.timing(translateY, {
      toValue: -100,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setToast(null));
  }, [translateY]);

  const show = useCallback(({ type, message, duration }) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setToast({ type, message });
    translateY.setValue(-100);

    Animated.spring(translateY, {
      toValue: 0,
      damping: 18,
      stiffness: 200,
      useNativeDriver: true,
    }).start();

    timeoutRef.current = setTimeout(hide, duration || 3500);
  }, [translateY, hide]);

  useEffect(() => {
    _showToast = show;
    return () => { _showToast = () => {}; };
  }, [show]);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const icon = toast ? ICON_MAP[toast.type] || ICON_MAP.error : null;

  return (
    <View style={{ flex: 1 }}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.wrapper,
            { top: insets.top + 8, transform: [{ translateY }] },
          ]}
        >
          <View style={styles.toast}>
            <Ionicons name={icon.name} size={22} color={icon.color} />
            <Animated.Text style={styles.msg} numberOfLines={2}>
              {toast.message}
            </Animated.Text>
            <Pressable onPress={hide} hitSlop={10}>
              <Ionicons name="close" size={18} color="rgba(255,255,255,0.45)" />
            </Pressable>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
    }),
  },
  msg: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 19,
  },
});
