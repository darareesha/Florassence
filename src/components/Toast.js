import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, fontSizes, shadows } from '../constants/theme';

const TONES = {
  success: { bg: colors.successSoft, ink: colors.success, icon: 'checkmark-circle' },
  error:   { bg: colors.dangerSoft,  ink: colors.danger,  icon: 'alert-circle' },
  warning: { bg: colors.warningSoft, ink: colors.warning, icon: 'warning' },
};

export function useToast() {
  const [toast, setToast] = useState(null); // { type, message } | null

  const showToast = useCallback((type, message) => {
    setToast({ type, message, key: Date.now() });
  }, []);
  const hideToast = useCallback(() => setToast(null), []);

  return { toast, showToast, hideToast };
}

export default function Toast({ toast, onHide, duration = 2600 }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!toast) return undefined;

    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 220, useNativeDriver: true }).start();

    const timer = setTimeout(() => {
      Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        onHide?.();
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [toast?.key]);

  if (!toast) return null;
  const tone = TONES[toast.type] || TONES.success;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        { backgroundColor: tone.bg },
        {
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
        },
      ]}
    >
      <Ionicons name={tone.icon} size={18} color={tone.ink} />
      <Text style={[styles.text, { color: tone.ink }]} numberOfLines={2}>{toast.message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: spacing.xxl,
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    padding: spacing.md, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    ...shadows.md,
  },
  text: { flex: 1, fontSize: fontSizes.sm, fontWeight: '600' },
});
