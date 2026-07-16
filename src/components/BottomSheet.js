import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, fontSizes, shadows } from '../constants/theme';

export default function BottomSheet({ visible, onClose, title, children }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />

      <View style={styles.sheet}>
        <View style={styles.handle} />
        {title ? <Text style={styles.title}>{title}</Text> : null}
        <View style={styles.body}>{children}</View>
        <Pressable
          style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.7 }]}
          onPress={onClose}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

export function SheetAction({ icon, label, onPress, destructive }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.action, pressed && { backgroundColor: colors.surfaceAlt }]}
      onPress={onPress}
    >
      <View style={[styles.actionIconWrap, destructive && { backgroundColor: colors.dangerSoft }]}>
        <Ionicons name={icon} size={18} color={destructive ? colors.danger : colors.primary} />
      </View>
      <Text style={[styles.actionLabel, destructive && { color: colors.danger }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20,25,20,0.35)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    ...shadows.lg,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSizes.sub, fontWeight: '700', color: colors.text,
    marginBottom: spacing.sm, paddingHorizontal: spacing.xs,
  },
  body: { gap: spacing.xs },

  action: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.md, paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
  },
  actionIconWrap: {
    width: 34, height: 34, borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  actionLabel: { fontSize: fontSizes.body, fontWeight: '600', color: colors.text },

  cancelBtn: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
  },
  cancelText: { fontSize: fontSizes.body, fontWeight: '700', color: colors.textMuted },
});

/*
  BottomSheet is a reusable component that displays a modal panel sliding up
 from the bottom of the screen to present additional actions or content
 without navigating away from the current page. It uses Modal component 
 and accepts props to control its visibility, handle closing, title
 and render dynamic content through the children prop. The component
 includes a semi-transparent backdrop that dismisses the sheet when tapped,
 a visual handle indicating that it is a bottom sheet and a Cancel button.


 */