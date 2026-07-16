import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import useApi from '../hooks/useApi';
import { fetchRemoteTaskById } from '../services/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { colors, spacing, radius, fontSizes, shadows } from '../constants/theme';

export default function DetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const itemId = route.params?.itemId ?? route.params?.taskId;
  const fallbackItem = route.params?.item; 

  const { data, loading, error, refresh } = useApi(() => {
    if (!itemId) return Promise.resolve(null);
    return fetchRemoteTaskById(Number(itemId));
  }, [itemId]);

  const item = data || fallbackItem || null;

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <LoadingState message="Loading details…" />
      </SafeAreaView>
    );
  }

  if (error || !item) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <ErrorState message={error || 'This item could not be loaded.'} onRetry={refresh} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn} hitSlop={8}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.topTitle}>Details</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.card}>
          <Text style={styles.eyebrow}>API detail</Text>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.meta}>{item.category || 'General'}</Text>
          <Text style={styles.notes}>{item.notes || 'No notes available for this item.'}</Text>
        </View>

        <View style={styles.rowCard}>
          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>Priority</Text>
            <Text style={styles.rowValue}>{item.priority || 'Medium'}</Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>Status</Text>
            <Text style={styles.rowValue}>{item.completed ? 'Completed' : 'Pending'}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  iconBtn: {
    width: 40, height: 40, borderRadius: radius.md,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border, ...shadows.xs,
  },
  topTitle: { fontSize: fontSizes.sub, fontWeight: '700', color: colors.text },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
    marginBottom: spacing.md,
  },
  eyebrow: { fontSize: fontSizes.xs, color: colors.primary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: spacing.sm },
  title: { fontSize: fontSizes.h2, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  meta: { fontSize: fontSizes.sm, color: colors.textMuted, marginBottom: spacing.sm },
  notes: { fontSize: fontSizes.body, color: colors.textSecondary, lineHeight: 22 },
  rowCard: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rowItem: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  rowLabel: { fontSize: fontSizes.xs, color: colors.textMuted, marginBottom: 4 },
  rowValue: { fontSize: fontSizes.body, fontWeight: '700', color: colors.text },
});
