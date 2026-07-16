import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Pressable,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { toggleFavorite, getFavorites } from '../services/storage';
import { useTasks } from '../context/TasksContext';
import { useXP } from '../context/XPContext';
import ErrorState from '../components/ErrorState';
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

export default function TaskDetailScreen() {
  const navigation  = useNavigation();
  const route       = useRoute();
  const { getTaskById, toggleComplete, updateTask } = useTasks();
  const { completeTask } = useXP();

  const paramTask = route.params?.task;
  const paramTaskId = route.params?.taskId ?? route.params?.itemId;
  const liveTask = paramTask ? getTaskById(paramTask.id) : null;
  const task = liveTask || paramTask || (paramTaskId ? getTaskById(paramTaskId) : null);

  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    if (!task) return;
    getFavorites().then((ids) => setIsFav(ids.includes(task.id)));
  }, [task?.id]);

  const handleFavorite = async () => {
    if (!task) return;
    const next = await toggleFavorite(task.id);
    setIsFav(next);
  };

  const handleToggleComplete = async () => {
    if (!task) return;
    const wasCompleted = task.completed;
    toggleComplete(task.id);
    if (!wasCompleted) await completeTask();
  };

  if (!task) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <ErrorState message="No task details were supplied for this screen." onRetry={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const p       = PRIORITY[task.priority] || PRIORITY.Low;
  const catIcon = CATEGORY_ICONS[task.category] || 'document-text-outline';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn} hitSlop={8}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.topTitle} numberOfLines={1}>Task Detail</Text>
          <View style={styles.topRight}>
            <Pressable
              onPress={() => navigation.navigate('EditTask', { task })}
              style={styles.iconBtn}
              hitSlop={8}
            >
              <Ionicons name="pencil-outline" size={18} color={colors.text} />
            </Pressable>
            <Pressable onPress={handleFavorite} style={styles.iconBtn} hitSlop={8}>
              <Ionicons
                name={isFav ? 'heart' : 'heart-outline'}
                size={20}
                color={isFav ? colors.danger : colors.textMuted}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.iconRow}>
          <View style={[styles.categoryIcon, { backgroundColor: p.bg }]}>
            <Ionicons name={catIcon} size={30} color={p.ink} />
          </View>
          {task.category && (
            <View style={[styles.categoryBadge, { backgroundColor: p.bg }]}>
              <Text style={[styles.categoryText, { color: p.ink }]}>{task.category}</Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text style={[styles.title, task.completed && styles.titleDone]}>{task.title}</Text>

        {/* Meta */}
        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Ionicons name="time-outline" size={13} color={colors.textMuted} />
            <Text style={styles.metaText}>{task.due || '—'}</Text>
          </View>
          <View style={[styles.metaChip, { backgroundColor: p.bg }]}>
            <View style={[styles.priorityDot, { backgroundColor: p.dot }]} />
            <Text style={[styles.metaText, { color: p.ink }]}>{task.priority} Priority</Text>
          </View>
          <View style={[styles.metaChip, { backgroundColor: task.completed ? colors.successSoft : colors.surfaceAlt }]}>
            <Ionicons
              name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
              size={13}
              color={task.completed ? colors.success : colors.textMuted}
            />
            <Text style={[styles.metaText, { color: task.completed ? colors.primaryDark : colors.textMuted }]}>
              {task.completed ? 'Done' : 'Pending'}
            </Text>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text-outline" size={16} color={colors.primary} />
            <Text style={styles.cardTitle}>Notes</Text>
          </View>
          <Text style={styles.notes}>{task.notes || 'No notes added yet.'}</Text>
        </View>

        {/* XP reward hint */}
        {!task.completed && (
          <View style={styles.xpHint}>
            <Text style={styles.xpHintText}>🌿 Completing this task earns +10 XP</Text>
          </View>
        )}

        {/* Complete / Incomplete button */}
        <Pressable
          onPress={handleToggleComplete}
          style={({ pressed }) => [
            styles.completeBtn,
            task.completed && styles.completeBtnDone,
            pressed && { opacity: 0.88 },
          ]}
        >
          <Ionicons
            name={task.completed ? 'close-circle-outline' : 'checkmark-circle-outline'}
            size={20}
            color={task.completed ? colors.textMuted : colors.textInverse}
          />
          <Text style={[styles.completeBtnText, task.completed && styles.completeBtnTextDone]}>
            {task.completed ? 'Mark Incomplete' : 'Mark as Complete  +10 XP'}
          </Text>
        </Pressable>

        {/* Edit button */}
        <Pressable
          onPress={() => navigation.navigate('EditTask', { task })}
          style={({ pressed }) => [styles.editBtn, pressed && { opacity: 0.85 }]}
        >
          <Ionicons name="pencil-outline" size={18} color={colors.primary} />
          <Text style={styles.editBtnText}>Edit Task</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxxl },

  topBar: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl },
  iconBtn: {
    width: 40, height: 40, borderRadius: radius.md,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
    ...shadows.xs,
  },
  topTitle: {
    flex: 1, fontSize: fontSizes.label, fontWeight: '700',
    color: colors.text, textAlign: 'center', marginHorizontal: spacing.xs,
  },
  topRight: { flexDirection: 'row', gap: spacing.xs },

  iconRow: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  categoryIcon: {
    width: 80, height: 80, borderRadius: radius.xl,
    alignItems: 'center', justifyContent: 'center',
  },
  categoryBadge: { paddingHorizontal: spacing.md, paddingVertical: 5, borderRadius: radius.full },
  categoryText:  { fontSize: fontSizes.xs, fontWeight: '700' },

  title: {
    fontSize: fontSizes.h2, fontWeight: '800', color: colors.text,
    textAlign: 'center', lineHeight: 32, marginBottom: spacing.md,
  },
  titleDone: { textDecorationLine: 'line-through', color: colors.textMuted },

  metaRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs,
    justifyContent: 'center', marginBottom: spacing.lg,
  },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: radius.full,
  },
  metaText:    { fontSize: fontSizes.xs, fontWeight: '600', color: colors.textMuted },
  priorityDot: { width: 6, height: 6, borderRadius: 3 },

  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: fontSizes.sm, fontWeight: '700', color: colors.text,
    textTransform: 'uppercase', letterSpacing: 0.4,
  },
  notes: { fontSize: fontSizes.body, color: colors.textSecondary, lineHeight: 24 },

  xpHint: {
    backgroundColor: colors.primarySoft, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.md,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  xpHintText: { fontSize: fontSizes.xs, color: colors.primaryDark, fontWeight: '600' },

  completeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.primary, borderRadius: radius.lg,
    paddingVertical: spacing.md + 2, marginBottom: spacing.sm, ...shadows.md,
  },
  completeBtnDone: { backgroundColor: colors.surfaceAlt },
  completeBtnText: { fontSize: fontSizes.body, fontWeight: '700', color: colors.textInverse },
  completeBtnTextDone: { color: colors.textMuted },

  editBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    paddingVertical: spacing.md + 2,
    borderWidth: 1.5, borderColor: colors.border, ...shadows.xs,
  },
  editBtnText: { fontSize: fontSizes.body, fontWeight: '600', color: colors.primary },
});
