import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, fontSizes, shadows } from '../constants/theme';

export default function EmptyState({ icon, title, message, actionLabel, onAction }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Text style={styles.leaf}>🌿</Text>
        <Ionicons name={icon || 'leaf-outline'} size={32} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction && (
        <Pressable style={styles.btn} onPress={onAction}>
          <Text style={styles.btnText}>{actionLabel}</Text>
        </Pressable>
      )}
      <Text style={styles.footer}>✦ ✦ ✦</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: spacing.xxl, paddingVertical: spacing.xxxl,
  },
  iconWrap: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1, borderColor: colors.border,
    ...shadows.xs,
  },
  leaf: { position: 'absolute', top: 8, right: 8, fontSize: 16 },
  title: {
    fontSize: fontSizes.sub, fontWeight: '700', color: colors.text,
    marginBottom: spacing.sm, textAlign: 'center',
  },
  message: {
    fontSize: fontSizes.sm, color: colors.textMuted,
    textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg,
  },
  btn: {
    backgroundColor: colors.primary, borderRadius: radius.lg,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    ...shadows.sm,
  },
  btnText: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textInverse },
  footer: { fontSize: fontSizes.xs, color: colors.textDisabled, marginTop: spacing.xl, letterSpacing: 4 },
});

{/* This file is when to display a text when there is no content to show. Reference: "Saved"*/}