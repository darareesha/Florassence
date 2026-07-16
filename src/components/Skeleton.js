import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors, spacing, radius } from '../constants/theme';

export function SkeletonBlock({ width = '100%', height = 14, style }) {
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1,   duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    {/* Now here, the values 0.4 and 1 refer to the opacity. This means that it would create a pulsing effect rather than just having one shade*/ }

    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[{ width, height, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt, opacity: pulse }, style]}
    />
  );
}

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <SkeletonBlock width={64} height={16} style={{ borderRadius: radius.full }} />
        <SkeletonBlock width={16} height={16} style={{ borderRadius: 8 }} />
      </View>
      <SkeletonBlock width="70%" height={16} style={{ marginBottom: spacing.xs }} />
      <SkeletonBlock width="40%" height={11} style={{ marginBottom: spacing.sm }} />
      <SkeletonBlock width="95%" height={11} style={{ marginBottom: 4 }} />
      <SkeletonBlock width="55%" height={11} />
    </View>
  );
}

export default function SkeletonList({ count = 5 }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={{ marginBottom: spacing.sm }}>
          <SkeletonCard />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.border,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
});

{/* when we normally make an app, we see texts like loading when the text is about to get displayed.
  So we can also, change it according to our requirements. This will display boxes */}