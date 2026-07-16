
import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, RefreshControl, Platform,
  Pressable, StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTasks } from '../context/TasksContext';
import { useXP } from '../context/XPContext';
import useDebounce from '../hooks/useDebounce';
import { toggleFavorite } from '../services/storage';
import useAsyncStorage from '../hooks/useAsyncStorage';
import TaskCard, { TASK_CARD_HEIGHT } from '../components/TaskCard';
import EmptyState from '../components/EmptyState';
import { colors, spacing, radius, fontSizes, shadows } from '../constants/theme';

const ALL_FILTERS = ['all', 'today', 'tomorrow', 'upcoming', 'done'];
const FILTER_LABELS = {
  all:      'All 🌿',
  today:    'Today 🌸',
  tomorrow: 'Tomorrow ☀️',
  upcoming: 'Upcoming 🌙',
  done:     'Done ✓',
};

export default function SearchScreen() {
  const navigation = useNavigation();
  const { tasks, toggleComplete } = useTasks();
  const { completeTask } = useXP();
  const [query,      setQuery]      = useState('');
  const [filter,     setFilter]     = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [favorites,  setFavorites]  = useAsyncStorage('florassence:favorites', []);

  const debouncedQuery = useDebounce(query, 350);

  const filtered = useMemo(() => {
    let list = tasks;
    if (filter !== 'all') list = list.filter((t) => t.filter === filter);
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.category || '').toLowerCase().includes(q) ||
          (t.notes || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [tasks, filter, debouncedQuery]);

  const handleOpenTask = useCallback((t) => navigation.navigate('TaskDetail', { task: t }), [navigation]);

  const handleFavorite = useCallback(async (taskId) => {
    const isNowFav = await toggleFavorite(taskId);
    setFavorites((prev) =>
      isNowFav ? [...prev, taskId] : prev.filter((id) => id !== taskId)
    );
  }, [setFavorites]);

  const handleComplete = useCallback(async (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    const wasCompleted = task?.completed;
    toggleComplete(taskId);
    // Award XP only when marking as done (not un-doing)
    if (!wasCompleted) await completeTask();
  }, [tasks, toggleComplete, completeTask]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 600));
    setRefreshing(false);
  }, []);

  const renderItem = useCallback(({ item }) => (
    <TaskCard
      task={item}
      onPress={handleOpenTask}
      onFavorite={handleFavorite}
      isFavorited={favorites.includes(item.id)}
      onComplete={handleComplete}
    />
  ), [handleOpenTask, handleFavorite, handleComplete, favorites]);

  const keyExtractor = useCallback((item) => item.id, []);

  // Fixed-height rows (see TaskCard.js) — tell FlatList the layout up front
  // instead of measuring, which keeps scrolling smooth as the list grows.
  const getItemLayout = useCallback((_data, index) => ({
    length: TASK_CARD_HEIGHT,
    offset: (TASK_CARD_HEIGHT + spacing.sm) * index,
    index,
  }), []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        contentContainerStyle={[styles.listContent, filtered.length === 0 && { flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.pageTitle}>📜 My Tasks</Text>
                <Text style={styles.pageSubtitle}>{tasks.filter(t=>!t.completed).length} pending · {tasks.filter(t=>t.completed).length} done</Text>
              </View>
              <Pressable
                style={styles.addBtnHeader}
                onPress={() => navigation.navigate('AddTask')}
              >
                <Ionicons name="add" size={20} color={colors.textInverse} />
                <Text style={styles.addBtnHeaderText}>New</Text>
              </Pressable>
            </View>

            {/* Search bar */}
            <View style={styles.searchBar}>
              <Ionicons name="search" size={18} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder="Search the scroll…"
                placeholderTextColor={colors.textMuted}
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={17} color={colors.textMuted} />
                </Pressable>
              )}
            </View>

            {/* Filter chips */}
            <FlatList
              horizontal
              data={ALL_FILTERS}
              keyExtractor={(f) => f}
              showsHorizontalScrollIndicator={false}
              style={styles.filterList}
              contentContainerStyle={styles.filterContent}
              renderItem={({ item: f }) => (
                <Pressable
                  onPress={() => setFilter(f)}
                  style={[styles.chip, filter === f && styles.chipActive]}
                >
                  <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>
                    {FILTER_LABELS[f]}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title={query ? 'Nothing found' : 'The scroll is empty'}
            message={query ? `No tasks match "${query}"` : 'Tap the + button to add your first task 🌿'}
            actionLabel="Add Task"
            onAction={() => navigation.navigate('AddTask')}
          />
        }
        ListFooterComponent={<View style={{ height: spacing.xxxl + 80 }} />}
      />

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.93 }] }]}
        onPress={() => navigation.navigate('AddTask')}
      >
        <Ionicons name="add" size={28} color={colors.textInverse} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingHorizontal: spacing.lg },

  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.lg, marginBottom: spacing.md,
  },
  pageTitle: { fontSize: fontSizes.h2, fontWeight: '800', color: colors.text },
  pageSubtitle: { fontSize: fontSizes.xs, color: colors.textMuted, marginTop: 2 },
  addBtnHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.full, ...shadows.sm,
  },
  addBtnHeaderText: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textInverse },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2,
    marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border,
    ...shadows.xs,
  },
  searchInput: { flex: 1, fontSize: fontSizes.body, color: colors.text, paddingVertical: 0 },

  filterList: { marginBottom: spacing.md },
  filterContent: { gap: spacing.xs, paddingRight: spacing.lg },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: 7,
    borderRadius: radius.full, backgroundColor: colors.surface,
    borderWidth: 1.5, borderColor: colors.border,
  },
  chipActive:     { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText:       { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textMuted },
  chipTextActive: { color: colors.textInverse },

  fab: {
    position: 'absolute', bottom: spacing.xl + 10, right: spacing.lg,
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    ...shadows.lg,
  },
});
