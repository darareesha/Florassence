import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { colors, spacing, fontSizes } from '../constants/theme';

export default function LoadingState({ message = 'Loading…' }) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bounce = (dot, delay) =>
      Animated.loop( 
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -8, duration: 320, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 320, useNativeDriver: true }),
          Animated.delay(600),
        ])
      );
      {/* without loop, the dot would bounce forever. 
      NativeDriver performs the animation on the native side rather than javascript. 
      This is just to make the animations more smoother ab=nd easy to load. 
      */}
    bounce(dot1, 0).start(); {/*Also, different timings are used since we want it to have a wave pattern instead of the simple one */}
    bounce(dot2, 160).start();
    bounce(dot3, 320).start();
  }, []);
  
  return (
    <View style={styles.wrap}>
      <Text style={styles.emoji}>🌿</Text>
      <View style={styles.dots}>
        {[dot1, dot2, dot3].map((d, i) => (
          <Animated.View key={i} style={[styles.dot, { transform: [{ translateY: d }] }]} />
        ))}
      </View>
      <Text style={styles.msg}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl },
  emoji: { fontSize: 32, marginBottom: spacing.md },
  dots: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  dot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary,
  },
  msg: { fontSize: fontSizes.sm, color: colors.textMuted, fontStyle: 'italic' },
});

{/* Initially, we had our values set to 0. For example, if the value changes to -8 so it would move
  upwards by 8 pixels and then return to it's initial position. 
  */}