
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, Pressable, TextInput, Image,
  StyleSheet, SafeAreaView, StatusBar, Alert, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions, useFocusEffect } from '@react-navigation/native';
import { getProfile, saveProfile } from '../services/storage';
import { useXP } from '../context/XPContext';
import { useTasks } from '../context/TasksContext';
import useTheme from '../hooks/useTheme';
import { spacing, radius, fontSizes, shadows } from '../constants/theme';

const BADGES = [
  { emoji: '🌱', label: 'First Steps',   earned: true  },
  { emoji: '🔥', label: '7-Day Streak',  earned: true  },
  { emoji: '⭐', label: '100 XP',         earned: true  },
  { emoji: '🌸', label: '25 Tasks',      earned: false },
  { emoji: '🏮', label: '25 Sessions',   earned: false },
  { emoji: '🦋', label: 'Level 5',       earned: false },
];

const MENU_ITEMS = [
  { emoji: '🧑', label: 'Edit Profile',   screen: 'EditProfile' },
  { emoji: '📊', label: 'My Statistics',  screen: 'DrawerStats' },
  { emoji: '⚙️',  label: 'Settings',       screen: 'DrawerSettings' },
  { emoji: '🍃', label: 'Help',           screen: 'DrawerHelp' },
  { emoji: '🌸', label: 'About',          screen: 'DrawerAbout' },
];

// Nature arch decoration across the top of the profile section
function NatureArch() {
  const leaves = ['🌿', '🌸', '🍃', '🌼', '🌿', '🌸', '🍃', '🌼', '🌿', '🌸'];
  return (
    <View style={archStyles.row}>
      {leaves.map((l, i) => (
        <Text key={i} style={archStyles.leaf}>{l}</Text>
      ))}
    </View>
  );
}
const archStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  leaf: { fontSize: 16, opacity: 0.70 },
});

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { mode, colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { totalXP, level, xpInLevel, xpPerLevel, xpProgress, stats } = useXP();
  const { tasks } = useTasks();
  const [name,       setName]       = useState('');
  const [avatarUri,  setAvatarUri]  = useState(null);
  const [editing,    setEditing]    = useState(false);
  const [draftName,  setDraftName]  = useState('');

  const xpBarAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(useCallback(() => {
    getProfile().then((p) => {
      if (p?.name) setName(p.name);
      setAvatarUri(p?.avatarUri || null);
    });
  }, []));

  // Animate XP bar when screen focuses
  useFocusEffect(useCallback(() => {
    xpBarAnim.setValue(0);
    Animated.timing(xpBarAnim, {
      toValue: xpProgress,
      duration: 900,
      delay: 300,
      useNativeDriver: false,
    }).start();
  }, [xpProgress]));

  async function saveName() {
    const trimmed = draftName.trim() || name;
    setName(trimmed);
    setEditing(false);
    await saveProfile({ name: trimmed });
  }

  const initials = name ? name.slice(0, 2).toUpperCase() : '✿';
  const completedTasks = tasks.filter((t) => t.completed).length;

  const xpWidth = xpBarAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Forest Profile Header ────────────────────────────── */}
        <View style={styles.profileHeader}>
          {/* Subtle forest bg pattern */}
          <View style={styles.headerBgLeaves}>
            {['🌿','🌸','🍃','🌼','🌾','🍄','🌺','🌱'].map((l,i) => (
              <Text key={i} style={[styles.bgLeaf, { opacity: 0.12 + (i%3)*0.06, fontSize: 28 + (i%2)*10 }]}>{l}</Text>
            ))}
          </View>

          {/* Nature arch */}
          <NatureArch />

          {/* Drawer open button */}
          <View style={styles.drawerRow}>
            <Pressable
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              style={styles.menuIconBtn} hitSlop={8}
            >
              <Ionicons name="menu" size={22} color={colors.text} />
            </Pressable>
          </View>

          {/* Avatar + companion */}
          <View style={styles.avatarSection}>
            {/* Avatar */}
            <View style={styles.avatarOuterRing}>
              <View style={styles.avatarInnerRing}>
                <View style={styles.avatar}>
                  {avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={styles.avatarPhoto} />
                  ) : (
                    <Text style={styles.avatarText}>{initials}</Text>
                  )}
                </View>
              </View>
            </View>
            <View style={styles.lvlBadge}>
              <Text style={styles.lvlBadgeText}>Lv.{level}</Text>
            </View>

            {/* Companion - bottom right of avatar */}
            <Image
              source={require('../../assets/images/spirit_buddy.png')}
              style={styles.companionBadge}
              resizeMode="contain"
            />
          </View>

          {/* Name */}
          {editing ? (
            <View style={styles.nameEditRow}>
              <TextInput
                style={styles.nameInput}
                value={draftName}
                onChangeText={setDraftName}
                placeholder="Your name..."
                placeholderTextColor={colors.textMuted}
                autoFocus
                onSubmitEditing={saveName}
                returnKeyType="done"
              />
              <Pressable onPress={saveName} style={styles.nameCheckBtn} hitSlop={8}>
                <Ionicons name="checkmark" size={18} color={colors.textInverse} />
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={styles.nameRow}
              onPress={() => { setDraftName(name); setEditing(true); }}
            >
              <Text style={styles.profileName}>{name || 'Traveler'}</Text>
              <Ionicons name="pencil-outline" size={14} color={colors.textMuted} />
            </Pressable>
          )}
          <Text style={styles.profileSub}>✦ Forest Scholar ✦</Text>

          {/* XP Bar */}
          <View style={styles.xpSection}>
            <View style={styles.xpRow}>
              <Text style={styles.xpLabel}>{xpInLevel} / {xpPerLevel} XP</Text>
              <Text style={styles.xpLabel}>→ Lv.{level + 1}</Text>
            </View>
            <View style={styles.xpTrack}>
              <Animated.View style={[styles.xpFill, { width: xpWidth }]} />
            </View>
          </View>
        </View>

        {/* ── Stats Row ────────────────────────────────────────── */}
        <View style={styles.statsRow}>
          {[
            { emoji: '🔥', label: 'Streak',   value: stats?.streak ?? 7 },
            { emoji: '🏮', label: 'Sessions', value: stats?.totalSessions ?? 0 },
            { emoji: '📜', label: 'Tasks',    value: completedTasks },
            { emoji: '✨', label: 'Total XP', value: totalXP },
          ].map((s, i) => (
            <View key={i} style={[styles.statBox, i < 3 && styles.statBoxBorder]}>
              <Text style={styles.statEmoji}>{s.emoji}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Spirit Badges ───────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏅 Spirit Badges</Text>
          <View style={styles.badgesGrid}>
            {BADGES.map((b, i) => (
              <View key={i} style={[styles.badge, !b.earned && styles.badgeLocked]}>
                <View style={[styles.badgeCircle, b.earned && styles.badgeCircleEarned]}>
                  <Text style={[styles.badgeEmoji, !b.earned && { opacity: 0.35 }]}>{b.emoji}</Text>
                </View>
                <Text style={[styles.badgeLabel, !b.earned && styles.badgeLabelLocked]}>{b.label}</Text>
                {b.earned && (
                  <View style={styles.earnedCheck}>
                    <Ionicons name="checkmark" size={9} color="#fff" />
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* ── Menu Items ───────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌿 More</Text>
          <View style={styles.menuCard}>
            {MENU_ITEMS.map((item, i) => (
              <React.Fragment key={item.screen}>
                <Pressable
                  style={({ pressed }) => [styles.menuItem, pressed && { backgroundColor: colors.surfaceAlt }]}
                  onPress={() => navigation.navigate(item.screen)}
                >
                  <View style={styles.menuIconWrap}>
                    <Text style={styles.menuEmoji}>{item.emoji}</Text>
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </Pressable>
                {i < MENU_ITEMS.length - 1 && <View style={styles.menuDivider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// A factory (see SettingsScreen for the same pattern) so this screen's
// colors actually change when the theme does, instead of being frozen to
// whatever `colors` was at import time.
function makeStyles(colors) {
  return StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: spacing.xxxl },

  // ── Profile header ────────────────────────────────────────────────────────
  profileHeader: {
    backgroundColor: colors.surfaceWarm,
    borderBottomWidth: 1.5, borderBottomColor: colors.border,
    paddingBottom: spacing.xl,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  headerBgLeaves: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row', flexWrap: 'wrap',
    alignItems: 'center', justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
  },
  bgLeaf: {},

  drawerRow: {
    width: '100%', flexDirection: 'row', justifyContent: 'flex-start',
    paddingHorizontal: spacing.lg, marginBottom: spacing.xs,
  },
  menuIconBtn: {
    width: 38, height: 38, borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center', justifyContent: 'center',
  },

  avatarSection: { position: 'relative', marginBottom: spacing.md, alignItems: 'center' },
  avatarOuterRing: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: colors.goldSoft,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: colors.gold + '55',
  },
  avatarInnerRing: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.goldBright + '66',
  },
  avatar: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: fontSizes.h2, fontWeight: '800', color: colors.textInverse },
  avatarPhoto: { width: 76, height: 76, borderRadius: 38 },
  lvlBadge: {
    position: 'absolute', bottom: 2, right: -4,
    backgroundColor: colors.gold,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 2, borderColor: colors.surfaceWarm,
  },
  lvlBadgeText: { fontSize: fontSizes.xxs, fontWeight: '800', color: colors.night },
  companionBadge: {
    position: 'absolute', bottom: -8, left: -14,
    width: 46, height: 46,
  },

  nameRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    marginBottom: 4,
  },
  profileName: { fontSize: fontSizes.h2, fontWeight: '800', color: colors.text },
  nameEditRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    marginBottom: 4,
  },
  nameInput: {
    fontSize: fontSizes.h2, fontWeight: '800', color: colors.text,
    borderBottomWidth: 1.5, borderBottomColor: colors.primary,
    minWidth: 140, paddingVertical: 2,
  },
  nameCheckBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  profileSub: {
    fontSize: fontSizes.xs, color: colors.textMuted, marginBottom: spacing.lg,
    letterSpacing: 0.5, fontWeight: '600',
  },

  xpSection: { width: '85%' },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  xpLabel: { fontSize: fontSizes.xs, color: colors.textMuted, fontWeight: '600' },
  xpTrack: {
    height: 10, backgroundColor: colors.surfaceAlt,
    borderRadius: 6, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.border,
  },
  xpFill: { height: '100%', backgroundColor: colors.gold, borderRadius: 6 },

  // ── Stats row ─────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row', backgroundColor: colors.surface,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: spacing.lg },
  statBoxBorder: { borderRightWidth: 1, borderRightColor: colors.border },
  statEmoji: { fontSize: 20, marginBottom: 3 },
  statValue: { fontSize: fontSizes.sub, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: fontSizes.xxs, color: colors.textMuted, fontWeight: '500', textAlign: 'center', marginTop: 1 },

  // ── Sections ─────────────────────────────────────────────────────────────
  section: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  sectionTitle: { fontSize: fontSizes.label, fontWeight: '700', color: colors.text, marginBottom: spacing.md },

  // Badges
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  badge: {
    width: '30%', alignItems: 'center', gap: 5,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    paddingVertical: spacing.md, paddingHorizontal: spacing.xs,
    borderWidth: 1, borderColor: colors.border, position: 'relative',
    ...shadows.xs,
  },
  badgeLocked: { opacity: 0.45 },
  badgeCircle: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeCircleEarned: {
    backgroundColor: colors.goldSoft,
    borderWidth: 2, borderColor: colors.gold + '55',
  },
  badgeEmoji: { fontSize: 26 },
  badgeLabel: { fontSize: fontSizes.xxs, fontWeight: '700', color: colors.text, textAlign: 'center' },
  badgeLabelLocked: { color: colors.textMuted },
  earnedCheck: {
    position: 'absolute', top: 6, right: 6,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },

  // Menu
  menuCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
    ...shadows.xs,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.md + 2, paddingHorizontal: spacing.lg,
  },
  menuIconWrap: {
    width: 34, height: 34, borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  menuEmoji: { fontSize: 18 },
  menuLabel: { flex: 1, fontSize: fontSizes.body, fontWeight: '500', color: colors.text },
  menuDivider: { height: 1, backgroundColor: colors.border, marginLeft: spacing.lg + 34 + spacing.md },
  });
}
