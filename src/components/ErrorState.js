import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, fontSizes, shadows } from '../constants/theme';

export default function ErrorState({ message, onRetry }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Text style={styles.leaf}>🍂</Text>
        <Ionicons name="cloud-offline-outline" size={30} color={colors.danger} />
      </View>
      <Text style={styles.title}>Something stirred in the forest…</Text>
      <Text style={styles.message}>{message || 'An unexpected wind passed through.'}</Text>
      {onRetry && (
        <Pressable style={styles.retryBtn} onPress={onRetry}>
          <Ionicons name="refresh" size={16} color={colors.textInverse} />
          <Text style={styles.retryText}>Try Again</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: spacing.xxl, paddingVertical: spacing.xxl,
  },
  iconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1, borderColor: colors.border,
  },
  leaf: { position: 'absolute', top: 8, right: 8, fontSize: 14 },
  title: { fontSize: fontSizes.sub, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
  message: { fontSize: fontSizes.sm, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: colors.primary, borderRadius: radius.lg,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    ...shadows.sm,
  },
  retryText: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textInverse },
});


{/* This file is to display message when an error occurs unexpectedly */}