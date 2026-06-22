import { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Animated, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Global toast queue
let _showToast = () => {};

export function showToast({ type = 'error', title, message, duration = 4000 }) {
  _showToast({ type, title, message, duration });
}

const TOAST_CONFIG = {
  success: {
    icon: 'checkmark-circle',
    bg: '#0D1F12',
    border: '#22C55E40',
    iconColor: '#22C55E',
    titleColor: '#4ADE80',
  },
  error: {
    icon: 'alert-circle',
    bg: '#1F0D0D',
    border: '#EF444440',
    iconColor: '#EF4444',
    titleColor: '#F87171',
  },
  warning: {
    icon: 'warning',
    bg: '#1F1A0D',
    border: '#F59E0B40',
    iconColor: '#F59E0B',
    titleColor: '#FBBF24',
  },
  info: {
    icon: 'information-circle',
    bg: '#0D141F',
    border: '#3B82F640',
    iconColor: '#3B82F6',
    titleColor: '#60A5FA',
  },
};

export function ToastProvider({ children }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState(null);
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef(null);

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setToast(null));
  }, [translateY, opacity]);

  const show = useCallback(({ type, title, message, duration }) => {
    // Clear existing timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setToast({ type, title, message });

    // Animate in
    translateY.setValue(-120);
    opacity.setValue(0);
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        damping: 20,
        stiffness: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-hide
    timeoutRef.current = setTimeout(hideToast, duration || 4000);
  }, [translateY, opacity, hideToast]);

  useEffect(() => {
    _showToast = show;
    return () => { _showToast = () => {}; };
  }, [show]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const config = toast ? TOAST_CONFIG[toast.type] || TOAST_CONFIG.error : null;

  return (
    <View style={{ flex: 1 }}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              top: insets.top + 8,
              transform: [{ translateY }],
              opacity,
            },
          ]}
        >
          <Pressable
            style={[styles.toast, { backgroundColor: config.bg, borderColor: config.border }]}
            onPress={hideToast}
          >
            <View style={[styles.iconWrap, { backgroundColor: config.iconColor + '20' }]}>
              <Ionicons name={config.icon} size={22} color={config.iconColor} />
            </View>
            <View style={styles.textWrap}>
              <View style={styles.titleRow}>
                <Ionicons name={config.icon} size={14} color={config.titleColor} />
                <View style={{ flex: 1 }}>
                  {toast.title ? (
                    <View style={styles.titleRow}>
                      <View style={{ flex: 1 }}>
                        <Animated.Text style={[styles.toastTitle, { color: config.titleColor }]}>
                          {toast.title}
                        </Animated.Text>
                      </View>
                    </View>
                  ) : null}
                  {toast.message ? (
                    <Animated.Text style={styles.toastMessage} numberOfLines={3}>
                      {toast.message}
                    </Animated.Text>
                  ) : null}
                </View>
              </View>
            </View>
            <Pressable onPress={hideToast} hitSlop={8} style={styles.closeBtn}>
              <Ionicons name="close" size={16} color="rgba(255,255,255,0.5)" />
            </Pressable>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: 9999,
    elevation: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    // Glassmorphism effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toastTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  toastMessage: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
    lineHeight: 17,
  },
  closeBtn: {
    padding: 4,
  },
});
