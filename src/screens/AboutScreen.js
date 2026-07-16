// ─── About Screen · Ghibli Edition ───────────────────────────────────────────
import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius, fontSizes, shadows } from '../constants/theme';

const FEATURES = [
  { emoji: '🏮', title: 'Lantern Timer',    desc: 'Magical Pomodoro with animated fireflies' },
  { emoji: '📜', title: 'Task Scrolls',     desc: 'Organize study tasks with priorities' },
  { emoji: '🌸', title: 'Saved Garden',     desc: 'Favorite tasks you want to revisit' },
  { emoji: '🔗', title: 'Deep Links',       desc: 'Share tasks between devices' },
  { emoji: '🌿', title: 'XP & Badges',      desc: 'Grow your forest with every session' },
  { emoji: '☁️', title: 'Cloud Sync',       desc: 'Tasks fetched from the scrolls API' },
];

const STACK = [
  { label: 'React Native',      sub: 'v0.74.5' },
  { label: 'Expo',              sub: '~51' },
  { label: 'React Navigation',  sub: 'v6' },
  { label: 'AsyncStorage',      sub: '2.x' },
  { label: 'JSONPlaceholder',   sub: 'REST API' },
];

export default function AboutScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.safe}> {/*This is to make sure that the content doesn't hide */}
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      {/*//scrollview creates a vertically scrollable container.This means user can scroll to the bottom. Without it, the extra area cuts off at the bottomSetting it to {false} hides the scroll bar. This is only for the visibility.*/}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={8}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.pageTitle}>🌸 About</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Identity card */}
        <View style={styles.identityCard}>
          <Text style={styles.appLogo}>🌿</Text>
          <Text style={styles.appName}>Florassence</Text>
          <Text style={styles.appVersion}>Day 8 · Version 1.0.0</Text>
          <Text style={styles.appTagline}>
            A cozy, Ghibli-inspired study companion for students who believe in the magic of learning.
          </Text>
          <View style={styles.tagRow}>
            {['#Study', '#Ghibli', '#Focus', '#Cozy'].map((t) => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Features */}
        <Text style={styles.sectionTitle}>✨ Features</Text>
        <View style={styles.featuresGrid}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureCard}>
              <Text style={styles.featureEmoji}>{f.emoji}</Text>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          ))}
        </View>

        {/* Tech stack */}
        <Text style={styles.sectionTitle}>🔧 Built With</Text>
        <View style={styles.stackCard}>
          {STACK.map((s, i) => (
            <React.Fragment key={i}>
              <View style={styles.stackRow}>
                <Text style={styles.stackLabel}>{s.label}</Text>
                <View style={styles.stackBadge}>
                  <Text style={styles.stackSub}>{s.sub}</Text>
                </View>
              </View>
              {i < STACK.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with 🌿 and curiosity</Text>
          <Text style={styles.footerQuote}>"The world is full of wonder — if you just look carefully."</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: spacing.lg, marginBottom: spacing.xl,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: radius.md,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border, ...shadows.xs,
  },
  pageTitle: { flex: 1, textAlign: 'center', fontSize: fontSizes.sub, fontWeight: '700', color: colors.text },

  identityCard: {
    backgroundColor: colors.night, borderRadius: radius.xl,
    padding: spacing.xl, alignItems: 'center', gap: spacing.sm,
    marginBottom: spacing.xl, ...shadows.md,
  },
  appLogo: { fontSize: 52 },
  appName: { fontSize: fontSizes.h1, fontWeight: '800', color: colors.textInverse, letterSpacing: 1 },
  appVersion: { fontSize: fontSizes.xs, color: 'rgba(245,237,216,0.55)', fontWeight: '600' },
  appTagline: {
    fontSize: fontSizes.sm, color: 'rgba(245,237,216,0.80)',
    textAlign: 'center', lineHeight: 22, fontStyle: 'italic', marginTop: spacing.sm,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, justifyContent: 'center', marginTop: spacing.xs },
  tag: {
    backgroundColor: 'rgba(77,122,91,0.45)', borderRadius: radius.full,
    paddingHorizontal: spacing.sm + 2, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(107,158,122,0.35)',
  },
  tagText: { fontSize: fontSizes.xxs, fontWeight: '600', color: 'rgba(245,237,216,0.75)' },

  sectionTitle: { fontSize: fontSizes.label, fontWeight: '700', color: colors.text, marginBottom: spacing.md },

  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  featureCard: {
    width: '47%', backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, gap: 4,
    borderWidth: 1, borderColor: colors.border, ...shadows.xs,
  },
  featureEmoji: { fontSize: 22 },
  featureTitle: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.text },
  featureDesc: { fontSize: fontSizes.xxs, color: colors.textMuted, lineHeight: 16 },

  stackCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
    marginBottom: spacing.xl, ...shadows.xs,
  },
  stackRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
  },
  stackLabel: { fontSize: fontSizes.body, fontWeight: '600', color: colors.text },
  stackBadge: {
    backgroundColor: colors.primarySoft, borderRadius: radius.full,
    paddingHorizontal: spacing.sm + 2, paddingVertical: 3,
    borderWidth: 1, borderColor: colors.border,
  },
  stackSub: { fontSize: fontSizes.xs, fontWeight: '600', color: colors.primary },
  divider: { height: 1, backgroundColor: colors.border },

  footer: { alignItems: 'center', gap: spacing.sm, paddingTop: spacing.md },
  footerText: { fontSize: fontSizes.sm, color: colors.textMuted, fontWeight: '600' },
  footerQuote: { fontSize: fontSizes.xs, color: colors.textDisabled, fontStyle: 'italic', textAlign: 'center' },
});
