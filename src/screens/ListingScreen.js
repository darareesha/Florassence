import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  TextInput,
  Platform,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import useApi from '../hooks/useApi';
import useDebounce from '../hooks/useDebounce';
import useAsyncStorage from '../hooks/useAsyncStorage';
import { fetchRemoteTasks } from '../services/api';
import { toggleFavorite } from '../services/storage';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import SkeletonList from '../components/Skeleton';
import { colors, spacing, radius, fontSizes, shadows } from '../constants/theme';

const ListingCard = React.memo(function ListingCard({ item, isFavorited, onPress, onFavorite }) {
  return (
    <Pressable
      onPress={() => onPress(item)}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
    >
      <View style={styles.cardTopRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.priority || 'Medium'}</Text>
        </View>
        <Pressable onPress={() => onFavorite(item.id)} hitSlop={8}>
          <Ionicons name={isFavorited ? 'heart' : 'heart-outline'} size={18} color={isFavorited ? colors.danger : colors.textMuted} />
        </Pressable>
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardMeta}>{item.category || 'General'}</Text>
      <Text style={styles.cardNotes} numberOfLines={2}>{item.notes || 'Tap to open the details view.'}</Text>
    </Pressable>
  );
});

export default function ListingScreen() {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const [favorites, setFavorites] = useAsyncStorage('florassence:favorites', []);

  const { data, loading, error, refresh } = useApi(() => fetchRemoteTasks(24), []);
  const items = Array.isArray(data) ? data : [];

  const filteredItems = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) => {
      const haystack = `${item.title} ${item.category} ${item.notes}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [items, debouncedQuery]);

  const handleFavorite = useCallback(async (itemId) => {
    const isNowFav = await toggleFavorite(itemId);
    setFavorites((prev) => (
      isNowFav ? [...prev, itemId] : prev.filter((id) => id !== itemId)
    ));
  }, [setFavorites]);

  const handleOpenDetails = useCallback((item) => {
    navigation.navigate('Details', { itemId: item.remoteId || item.id, item });
  }, [navigation]);

  const renderItem = useCallback(({ item }) => (
    <ListingCard
      item={item}
      isFavorited={favorites.includes(item.id)}
      onPress={handleOpenDetails}
      onFavorite={handleFavorite}
    />
  ), [favorites, handleOpenDetails, handleFavorite]);

  const keyExtractor = useCallback((item) => item.id, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        {/* Keep the real header/search chrome visible immediately, and
            skeleton only the part that's actually still loading — the list
            content. A full-screen spinner (LoadingState) is reserved for
            waits with no known content shape yet. */}
        <View style={styles.headerBlock}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn} hitSlop={8}>
              <Ionicons name="arrow-back" size={20} color={colors.text} />
            </Pressable>
            <Text style={styles.pageTitle}>Listing</Text>
            <View style={{ width: 40 }} />
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          <SkeletonList count={6} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <ErrorState message={error} onRetry={refresh} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <FlatList
        data={filteredItems}
        keyExtractor={keyExtractor}
        contentContainerStyle={[styles.listContent, filteredItems.length === 0 && { flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={(
          <View style={styles.headerBlock}>
            <View style={styles.headerRow}>
              <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn} hitSlop={8}>
                <Ionicons name="arrow-back" size={20} color={colors.text} />
              </Pressable>
              <Text style={styles.pageTitle}>Listing</Text>
              <View style={{ width: 40 }} />
            </View>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={18} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder="Search the collection"
                placeholderTextColor={colors.textMuted}
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={17} color={colors.textMuted} />
                </Pressable>
              )}
            </View>
          </View>
        )}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={(
          <EmptyState
            icon="library-outline"
            title={query ? 'No matches' : 'Nothing loaded yet'}
            message={query ? 'Try another search term.' : 'The API did not return any items right now.'}
          />
        )}
        ListFooterComponent={<View style={{ height: spacing.xxxl }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  headerBlock: { paddingTop: spacing.lg, marginBottom: spacing.md },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.xs,
  },
  pageTitle: { fontSize: fontSizes.h2, fontWeight: '800', color: colors.text },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.xs,
  },
  searchInput: { flex: 1, color: colors.text, paddingVertical: 0 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.xs,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  badgeText: { fontSize: fontSizes.xxs, fontWeight: '700', color: colors.primary },
  cardTitle: { fontSize: fontSizes.sub, fontWeight: '700', color: colors.text, marginBottom: 4 },
  cardMeta: { fontSize: fontSizes.sm, color: colors.textMuted, marginBottom: 6 },
  cardNotes: { fontSize: fontSizes.sm, color: colors.textSecondary, lineHeight: 20 },
});
