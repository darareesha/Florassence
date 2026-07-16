import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, RefreshControl, Platform,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTasks } from '../context/TasksContext';
import { useXP } from '../context/XPContext';
import { getFavorites, toggleFavorite } from '../services/storage';
import TaskCard, { TASK_CARD_HEIGHT } from '../components/TaskCard';
import EmptyState from '../components/EmptyState';
import { colors, spacing, radius, fontSizes, shadows } from '../constants/theme';

export default function FavoritesScreen() {
  const navigation = useNavigation();
  const { tasks, toggleComplete } = useTasks();
  const { completeTask } = useXP();
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [refreshing,  setRefreshing]  = useState(false);

  useFocusEffect(useCallback(() => {
    getFavorites().then(setFavoriteIds);
  }, []));

  const favoritedTasks = tasks.filter((t) => favoriteIds.includes(t.id));

  // Stable identity so it doesn't defeat TaskCard's React.memo on every render.
  const handleOpenTask = useCallback((t) => navigation.navigate('TaskDetail', { task: t }), [navigation]);

  const handleFavorite = useCallback(async (taskId) => {
    await toggleFavorite(taskId);
    setFavoriteIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  }, []);

  const handleComplete = useCallback(async (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    const wasCompleted = task?.completed;
    toggleComplete(taskId);
    if (!wasCompleted) await completeTask();
  }, [tasks, toggleComplete, completeTask]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await getFavorites().then(setFavoriteIds);
    setRefreshing(false);
  }, []);

  const renderItem = useCallback(({ item }) => (
    <TaskCard
      task={item}
      onPress={handleOpenTask}
      onFavorite={handleFavorite}
      isFavorited={true}
      onComplete={handleComplete}
    />
  ), [handleOpenTask, handleFavorite, handleComplete]);

  const keyExtractor = useCallback((item) => item.id, []);

  // Every row is a TaskCard at a known fixed height, so we can tell FlatList
  // exactly where each item sits up front instead of it having to measure —
  // this is what makes scrolling stay smooth in a long list.
  const getItemLayout = useCallback((_data, index) => ({
    length: TASK_CARD_HEIGHT,
    offset: (TASK_CARD_HEIGHT + spacing.sm) * index,
    index,
  }), []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <FlatList
        data={favoritedTasks}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        contentContainerStyle={[styles.listContent, favoritedTasks.length === 0 && { flexGrow: 1 }]}
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
          <View style={styles.header}>
            <Text style={styles.pageTitle}>🌸 Saved Tasks</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{favoritedTasks.length} saved</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="heart-outline"
            title="No saved tasks yet"
            message="Tap the heart on any task to save it here like a pressed flower 🌸"
            actionLabel="Browse Tasks"
            onAction={() => navigation.navigate('SearchStack')}
          />
        }
        ListFooterComponent={<View style={{ height: spacing.xxl }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: colors.background },
  listContent: { paddingHorizontal: spacing.lg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.lg, marginBottom: spacing.lg,
  },
  pageTitle:  { fontSize: fontSizes.h2, fontWeight: '800', color: colors.text },
  countBadge: {
    backgroundColor: colors.dangerSoft,
    paddingHorizontal: spacing.sm + 2, paddingVertical: 4,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.border,
  },
  countText: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.danger },
});
