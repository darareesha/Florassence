import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView,
  StyleSheet, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTasks } from '../context/TasksContext';
import { colors, spacing, radius, fontSizes, shadows } from '../constants/theme';

const PRIORITIES = ['Low', 'Medium', 'High'];
const FILTERS    = ['today', 'tomorrow', 'upcoming', 'done'];
const FILTER_LABELS = { today: '📅 Today', tomorrow: '🌅 Tomorrow', upcoming: '🗓 Upcoming', done: '✅ Done' };
const CATEGORIES = ['Mathematics', 'Computer Science', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Electronics', 'Database Systems', 'Operating Systems', 'Other'];

export default function EditTaskScreen() {
  const navigation = useNavigation();
  const route      = useRoute();
  const { task }   = route.params;
  const { updateTask, deleteTask } = useTasks();

  const [title,    setTitle]    = useState(task.title   || '');
  const [notes,    setNotes]    = useState(task.notes   || '');
  const [priority, setPriority] = useState(task.priority || 'Medium');
  const [filter,   setFilter]   = useState(task.filter  || 'today');
  const [category, setCategory] = useState(task.category || '');
  const [due,      setDue]      = useState(task.due     || '');

  function handleSave() {
    if (!title.trim()) {
      Alert.alert('Missing title', 'Please give your task a name 🌿');
      return;
    }
    updateTask(task.id, { title: title.trim(), notes: notes.trim(), priority, filter, category: category || task.category, due: due.trim() });
    navigation.goBack();
  }

  function handleDelete() {
    Alert.alert(
      'Delete Task?',
      `"${task.title}" will be removed from your scroll 🍂`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => { deleteTask(task.id); navigation.goBack(); } },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
          <Text style={styles.pageTitle}>✏️ Edit Task</Text>
          <Pressable onPress={handleDelete} style={styles.deleteBtn} hitSlop={8}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Title */}
          <Text style={styles.fieldLabel}>Task Title *</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="What needs to be done?"
              placeholderTextColor={colors.textMuted}
              returnKeyType="next"
              maxLength={80}
            />
          </View>

          {/* Notes */}
          <Text style={styles.fieldLabel}>Notes</Text>
          <View style={[styles.inputWrap, styles.textareaWrap]}>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Details, page numbers, reminders…"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              maxLength={300}
            />
          </View>

          {/* Due */}
          <Text style={styles.fieldLabel}>Due</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={due}
              onChangeText={setDue}
              placeholder="e.g. Today · 2:00 PM"
              placeholderTextColor={colors.textMuted}
              returnKeyType="done"
            />
          </View>

          {/* Status */}
          <Text style={styles.fieldLabel}>Status</Text>
          <View style={styles.chipRow}>
            {FILTERS.map((f) => (
              <Pressable key={f} onPress={() => setFilter(f)} style={[styles.chip, filter === f && styles.chipActive]}>
                <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>{FILTER_LABELS[f]}</Text>
              </Pressable>
            ))}
          </View>

          {/* Priority */}
          <Text style={styles.fieldLabel}>Priority</Text>
          <View style={styles.chipRow}>
            {PRIORITIES.map((p) => {
              const col = colors[`priority${p}`];
              const active = priority === p;
              return (
                <Pressable key={p} onPress={() => setPriority(p)} style={[styles.chip, active && { backgroundColor: col.bg, borderColor: col.dot }]}>
                  <View style={[styles.priorDot, { backgroundColor: active ? col.dot : colors.border }]} />
                  <Text style={[styles.chipText, active && { color: col.ink }]}>{p}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Category */}
          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((c) => (
              <Pressable key={c} onPress={() => setCategory(c)} style={[styles.catChip, category === c && styles.catChipActive]}>
                <Text style={[styles.catText, category === c && styles.catTextActive]}>{c}</Text>
              </Pressable>
            ))}
          </View>

          {/* Danger zone */}
          <View style={styles.dangerCard}>
            <Pressable style={styles.deleteRow} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
              <Text style={styles.deleteText}>Delete this task</Text>
            </Pressable>
          </View>

          <View style={{ height: spacing.xxxl }} />
        </ScrollView>

        {/* Save bar */}
        <View style={styles.bottomBar}>
          <Pressable style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.88 }]} onPress={handleSave}>
            <Ionicons name="checkmark-circle" size={20} color={colors.textInverse} />
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt,
  },
  pageTitle: { flex: 1, textAlign: 'center', fontSize: fontSizes.sub, fontWeight: '700', color: colors.text },
  deleteBtn: {
    width: 38, height: 38, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center', backgroundColor: colors.dangerSoft,
  },

  body: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  fieldLabel: {
    fontSize: fontSizes.xs, fontWeight: '700', color: colors.textMuted,
    letterSpacing: 0.5, marginBottom: spacing.xs, marginTop: spacing.md,
    textTransform: 'uppercase',
  },
  inputWrap: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, ...shadows.xs,
  },
  input: { fontSize: fontSizes.body, color: colors.text, paddingVertical: spacing.md },
  textareaWrap: { paddingVertical: spacing.xs },
  textarea: { minHeight: 90, textAlignVertical: 'top', paddingVertical: spacing.sm },

  chipRow: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: spacing.md, paddingVertical: 8,
    borderRadius: radius.full, backgroundColor: colors.surface,
    borderWidth: 1.5, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  chipText: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textMuted },
  chipTextActive: { color: colors.primary },
  priorDot: { width: 7, height: 7, borderRadius: 3.5 },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  catChip: {
    paddingHorizontal: spacing.sm + 2, paddingVertical: 6,
    borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
  },
  catChipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  catText: { fontSize: fontSizes.xs, fontWeight: '500', color: colors.textMuted },
  catTextActive: { color: colors.primary, fontWeight: '700' },

  dangerCard: {
    backgroundColor: colors.dangerSoft, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.danger + '33',
    marginTop: spacing.xl, overflow: 'hidden',
  },
  deleteRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.lg,
  },
  deleteText: { fontSize: fontSizes.body, fontWeight: '600', color: colors.danger },

  bottomBar: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface,
  },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.primary, borderRadius: radius.xl, paddingVertical: spacing.md + 2,
    ...shadows.md,
  },
  saveBtnText: { fontSize: fontSizes.sub, fontWeight: '700', color: colors.textInverse },
});
