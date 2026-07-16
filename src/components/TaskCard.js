import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, fontSizes, shadows } from '../constants/theme';

const PRIORITY = {
  High:   colors.priorityHigh,
  Medium: colors.priorityMedium,
  Low:    colors.priorityLow,
};

const CATEGORY_ICONS = {
  'Mathematics':       'calculator-outline',
  'Computer Science':  'code-slash-outline',
  'Physics':           'planet-outline',
  'English':           'book-outline',
  'Electronics':       'hardware-chip-outline',
  'Database Systems':  'server-outline',
  'Operating Systems': 'terminal-outline',
};

const PRIORITY_LEAF = { High: '🍂', Medium: '🌼', Low: '🌿' };

export const TASK_CARD_HEIGHT = 64;

function TaskCard({ task, onPress, onFavorite, isFavorited, onComplete }) {
  const p            = PRIORITY[task.priority] || PRIORITY.Low;
  const categoryIcon = CATEGORY_ICONS[task.category] || 'document-text-outline';
  const leaf         = PRIORITY_LEAF[task.priority] || '🌱';

  return (
    <Pressable
      onPress={() => onPress?.(task)}
      style={({ pressed }) => [styles.card, task.completed && styles.cardDone, pressed && styles.cardPressed]}
    >
      {/* Left accent stripe */}
      <View style={[styles.stripe, { backgroundColor: task.completed ? colors.success : p.dot }]} />

      <Pressable
        onPress={() => onComplete?.(task.id)}
        style={styles.checkBtn}
        hitSlop={8}
      >
        <View style={[styles.checkCircle, task.completed && styles.checkCircleDone]}>
          {task.completed && <Ionicons name="checkmark" size={12} color="#fff" />}
        </View>
      </Pressable>

      {/* Category icon */}
      <View style={[styles.iconWrap, { backgroundColor: task.completed ? colors.surfaceAlt : p.bg }]}>
        <Ionicons name={categoryIcon} size={16} color={task.completed ? colors.textMuted : p.ink} />
      </View>

      {/* Text block */}
      <View style={styles.textBlock}>
        <Text style={[styles.title, task.completed && styles.titleDone]} numberOfLines={1}>
          {task.title}
        </Text>
        <View style={styles.meta}>
          <Ionicons name="time-outline" size={11} color={colors.textMuted} />
          <Text style={styles.due}>{task.due}</Text>
          {task.category ? <Text style={styles.category} numberOfLines={1}>· {task.category}</Text> : null}
        </View>
      </View>

      {/* Right side */}
      <View style={styles.right}>
        {!task.completed && (
          <View style={[styles.priorityBadge, { backgroundColor: p.bg }]}>
            <Text style={styles.priorityLeaf}>{leaf}</Text>
            <Text style={[styles.priorityText, { color: p.ink }]}>{task.priority}</Text>
          </View>
        )}
        {task.completed && (
          <View style={styles.doneBadge}>
            <Text style={styles.doneBadgeText}>Done ✓</Text>
          </View>
        )}
        {onFavorite !== undefined && (
          <Pressable onPress={() => onFavorite?.(task.id)} hitSlop={8} style={styles.heartBtn}>
            <Ionicons
              name={isFavorited ? 'heart' : 'heart-outline'}
              size={17}
              color={isFavorited ? colors.danger : colors.textMuted}
            />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.border,
    ...shadows.sm,
  },
  cardDone: { opacity: 0.72, backgroundColor: colors.surfaceAlt },
  cardPressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },

  stripe: { width: 4, alignSelf: 'stretch' },

  checkBtn: { padding: spacing.sm, paddingRight: 2 },
  checkCircle: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  checkCircleDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  iconWrap: {
    width: 36, height: 36, borderRadius: radius.sm,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 2,
  },

  textBlock: { flex: 1, paddingVertical: spacing.md, paddingHorizontal: spacing.xs + 2 },
  title:     { fontSize: fontSizes.sm, fontWeight: '600', color: colors.text },
  titleDone: { textDecorationLine: 'line-through', color: colors.textMuted },
  meta:      { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3, flexWrap: 'nowrap' },
  due:       { fontSize: fontSizes.xxs, color: colors.textMuted },
  category:  { fontSize: fontSizes.xxs, color: colors.textMuted, flexShrink: 1 },

  right: { alignItems: 'flex-end', paddingRight: spacing.sm, gap: 5 },
  priorityBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 3,
    borderRadius: radius.full,
  },
  priorityLeaf: { fontSize: 9 },
  priorityText: { fontSize: fontSizes.xxs, fontWeight: '700' },
  doneBadge: {
    backgroundColor: colors.successSoft,
    paddingHorizontal: 6, paddingVertical: 3,
    borderRadius: radius.full,
  },
  doneBadgeText: { fontSize: fontSizes.xxs, fontWeight: '700', color: colors.success },
  heartBtn: { padding: 2 },
});

export default React.memo(TaskCard);
