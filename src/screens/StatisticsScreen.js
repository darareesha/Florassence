import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { useXP } from '../context/XPContext';
import { useTasks } from '../context/TasksContext';
import { colors, spacing, radius, fontSizes, shadows } from '../constants/theme';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function WeeklyBar({ label, hours, maxHours, isToday }) {
  const pct  = maxHours > 0 ? Math.min(hours / maxHours, 1) : 0;
  const barH = Math.max(pct * 110, hours > 0 ? 6 : 0);
  return (
    <View style={styles.barCol}>
      <Text style={styles.barVal}>{hours > 0 ? `${hours.toFixed(1)}` : ''}</Text>
      <View style={styles.barTrack}>
        <View style={[
          styles.barFill,
          { height: barH },
          isToday && styles.barFillToday,
        ]} />
      </View>
      <Text style={[styles.barLabel, isToday && styles.barLabelToday]}>{label}</Text>
      {isToday && <View style={styles.todayDot} />}
    </View>
  );
}

function StatCard({ emoji, label, value, bg, ink }) {
  return (
    <View style={[styles.statCard, { backgroundColor: bg }]}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={[styles.statVal, { color: ink }]}>{value}</Text>
      <Text style={[styles.statLbl, { color: ink + 'AA' }]}>{label}</Text>
    </View>
  );
}

const ACHIEVEMENTS = [
  { emoji: '🌱', label: 'First Steps',      desc: 'Complete your first task',    earned: true },
  { emoji: '🔥', label: '7-Day Streak',     desc: 'Study 7 days in a row',        earned: true },
  { emoji: '⭐', label: 'Centurion',         desc: 'Earn 100 XP',                 earned: true },
  { emoji: '🏮', label: 'Night Scholar',    desc: 'Complete 10 focus sessions',  earned: false },
  { emoji: '🌸', label: 'Task Master',      desc: 'Complete 25 tasks',           earned: false },
  { emoji: '🦋', label: 'Transformation',   desc: 'Reach Level 5',               earned: false },
  { emoji: '🌙', label: 'Night Owl',        desc: 'Study past midnight',         earned: false },
  { emoji: '🏆', label: 'Forest Guardian',  desc: 'Earn 500 XP total',           earned: false },
];

export default function StatisticsScreen() {
  const navigation  = useNavigation();
  const { stats, totalXP, level, xpInLevel, xpPerLevel, dailyGoal } = useXP();
  const { tasks } = useTasks();

  const today     = new Date().getDay();
  const weekHours = stats?.weeklyHours || [0, 0, 0, 0, 0, 0, 0];
  const maxHours  = Math.max(...weekHours, 1);
  const totalWeekH = weekHours.reduce((s, h) => s + h, 0);

  const totalTasks    = tasks.filter((t) => t.completed).length;
  const pendingTasks  = tasks.filter((t) => !t.completed).length;

  const dailyProgress = dailyGoal.targetSessions > 0
    ? Math.min(dailyGoal.sessionsCompleted / dailyGoal.targetSessions, 1)
    : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.pageTitle}>📊 My Progress</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── XP & Level Card ─────────────────────────────────────── */}
        <View style={styles.xpCard}>
          <View style={styles.xpCardRow}>
            <View>
              <Text style={styles.xpLevelLabel}>✦ Level {level}</Text>
              <Text style={styles.xpTotal}>{totalXP} XP total</Text>
            </View>
            <View style={styles.xpBadge}>
              <Text style={styles.xpBadgeText}>Lv.{level}</Text>
            </View>
          </View>
          <View style={styles.xpBarRow}>
            <Text style={styles.xpBarLabel}>{xpInLevel} / {xpPerLevel} XP</Text>
            <Text style={styles.xpBarLabel}>→ Lv.{level + 1}</Text>
          </View>
          <View style={styles.xpTrack}>
            <View style={[styles.xpFill, { width: `${Math.round((xpInLevel / xpPerLevel) * 100)}%` }]} />
          </View>
          <Text style={styles.xpHint}>🌿 Complete tasks & focus sessions to earn XP</Text>
        </View>

        {/* ── Daily Goal ──────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Today's Goal</Text>
          <View style={styles.goalCard}>
            <View style={styles.goalRow}>
              <View style={styles.goalItem}>
                <Text style={styles.goalVal}>{dailyGoal.sessionsCompleted}/{dailyGoal.targetSessions}</Text>
                <Text style={styles.goalItemLabel}>Sessions</Text>
                <View style={styles.miniTrack}>
                  <View style={[styles.miniFill, { width: `${Math.min(dailyGoal.sessionsCompleted / dailyGoal.targetSessions, 1) * 100}%` }]} />
                </View>
              </View>
              <View style={styles.goalDivider} />
              <View style={styles.goalItem}>
                <Text style={styles.goalVal}>{dailyGoal.tasksCompleted}/{dailyGoal.targetTasks}</Text>
                <Text style={styles.goalItemLabel}>Tasks</Text>
                <View style={styles.miniTrack}>
                  <View style={[styles.miniFill, { width: `${Math.min(dailyGoal.tasksCompleted / dailyGoal.targetTasks, 1) * 100}%`, backgroundColor: colors.gold }]} />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ── Stats Grid ──────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌟 Overall Stats</Text>
          <View style={styles.statsGrid}>
            <StatCard emoji="🔥" label="Day Streak"    value={stats?.streak || 0}          bg={colors.accentSoft}  ink={colors.accent} />
            <StatCard emoji="⏰" label="Hours This Wk" value={`${totalWeekH.toFixed(1)}h`}   bg={colors.skySoft}     ink={colors.sky} />
            <StatCard emoji="📜" label="Tasks Done"    value={totalTasks}                    bg={colors.primarySoft} ink={colors.primary} />
            <StatCard emoji="🏮" label="Sessions"      value={stats?.totalSessions || 0}    bg={colors.goldSoft}    ink={colors.gold} />
            <StatCard emoji="✨" label="Total XP"      value={totalXP}                       bg={colors.goldSoft}    ink={colors.accent} />
            <StatCard emoji="📚" label="Pending"       value={pendingTasks}                  bg={colors.dangerSoft}  ink={colors.danger} />
          </View>
        </View>

        {/* ── Weekly Chart ────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Study Hours This Week</Text>
          <View style={styles.chartCard}>
            <View style={styles.barsRow}>
              {weekHours.map((h, i) => (
                <WeeklyBar
                  key={i}
                  label={DAY_LABELS[i]}
                  hours={h}
                  maxHours={maxHours}
                  isToday={i === today}
                />
              ))}
            </View>
            <View style={styles.chartFooter}>
              <Text style={styles.chartFooterText}>
                Total this week: <Text style={styles.chartFooterBold}>{totalWeekH.toFixed(1)} hours</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* ── Achievements ────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏅 Achievements</Text>
          <View style={styles.achieveGrid}>
            {ACHIEVEMENTS.map((a, i) => (
              <View key={i} style={[styles.achieveCard, !a.earned && styles.achieveCardLocked]}>
                <Text style={[styles.achieveEmoji, !a.earned && { opacity: 0.3 }]}>{a.emoji}</Text>
                <Text style={[styles.achieveLabel, !a.earned && styles.achieveLabelLocked]}>{a.label}</Text>
                <Text style={[styles.achieveDesc, !a.earned && styles.achieveLabelLocked]} numberOfLines={2}>{a.desc}</Text>
                {a.earned && <View style={styles.achieveCheck}><Ionicons name="checkmark" size={10} color="#fff" /></View>}
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt,
  },
  pageTitle: { flex: 1, textAlign: 'center', fontSize: fontSizes.sub, fontWeight: '700', color: colors.text },
  scroll: { padding: spacing.lg },

  // XP Card
  xpCard: {
    backgroundColor: colors.night, borderRadius: radius.xl,
    padding: spacing.lg, marginBottom: spacing.xl, ...shadows.md,
  },
  xpCardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  xpLevelLabel: { fontSize: fontSizes.xs, color: colors.goldBright, fontWeight: '700', letterSpacing: 0.5 },
  xpTotal: { fontSize: fontSizes.h2, fontWeight: '800', color: colors.textInverse, marginTop: 2 },
  xpBadge: {
    backgroundColor: colors.gold, paddingHorizontal: spacing.md, paddingVertical: 6,
    borderRadius: radius.full,
  },
  xpBadgeText: { fontSize: fontSizes.sm, fontWeight: '800', color: colors.night },
  xpBarRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  xpBarLabel: { fontSize: fontSizes.xs, color: 'rgba(245,237,216,0.65)', fontWeight: '600' },
  xpTrack: { height: 10, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 6, overflow: 'hidden', marginBottom: 8 },
  xpFill: { height: '100%', backgroundColor: colors.goldBright, borderRadius: 6 },
  xpHint: { fontSize: fontSizes.xs, color: 'rgba(245,237,216,0.55)', fontStyle: 'italic', textAlign: 'center' },

  section: { marginBottom: spacing.xl },
  sectionTitle: { fontSize: fontSizes.label, fontWeight: '700', color: colors.text, marginBottom: spacing.md },

  // Daily goal
  goalCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden', ...shadows.xs,
  },
  goalRow: { flexDirection: 'row' },
  goalItem: { flex: 1, padding: spacing.lg, alignItems: 'center' },
  goalVal: { fontSize: fontSizes.h2, fontWeight: '800', color: colors.text },
  goalItemLabel: { fontSize: fontSizes.xs, color: colors.textMuted, fontWeight: '600', marginBottom: spacing.sm },
  goalDivider: { width: 1, backgroundColor: colors.border },
  miniTrack: { width: '100%', height: 6, backgroundColor: colors.surfaceAlt, borderRadius: 3, overflow: 'hidden' },
  miniFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },

  // Stats grid
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  statCard: {
    width: '31.5%', borderRadius: radius.lg, padding: spacing.md,
    alignItems: 'center', gap: 3, borderWidth: 1, borderColor: colors.border,
  },
  statEmoji: { fontSize: 24, marginBottom: 2 },
  statVal: { fontSize: fontSizes.sub, fontWeight: '800' },
  statLbl: { fontSize: fontSizes.xxs, fontWeight: '600', textAlign: 'center' },

  // Chart
  chartCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.lg, ...shadows.xs,
  },
  barsRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    height: 150, gap: 6,
  },
  barCol: { flex: 1, alignItems: 'center' },
  barVal: { fontSize: 9, color: colors.textMuted, marginBottom: 2, fontWeight: '600' },
  barTrack: {
    width: '100%', height: 110, backgroundColor: colors.surfaceAlt,
    borderRadius: 6, justifyContent: 'flex-end', overflow: 'hidden',
  },
  barFill: { backgroundColor: colors.primary, borderRadius: 6, width: '100%' },
  barFillToday: { backgroundColor: colors.gold },
  barLabel: { fontSize: 9, color: colors.textMuted, marginTop: 4, fontWeight: '500' },
  barLabelToday: { color: colors.gold, fontWeight: '700' },
  todayDot: {
    width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.gold, marginTop: 2,
  },
  chartFooter: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, marginTop: spacing.sm },
  chartFooterText: { fontSize: fontSizes.xs, color: colors.textMuted, textAlign: 'center' },
  chartFooterBold: { fontWeight: '700', color: colors.text },

  // Achievements
  achieveGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  achieveCard: {
    width: '47%', backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', gap: 3, position: 'relative', ...shadows.xs,
  },
  achieveCardLocked: { opacity: 0.5 },
  achieveEmoji: { fontSize: 28, marginBottom: 2 },
  achieveLabel: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.text, textAlign: 'center' },
  achieveLabelLocked: { color: colors.textMuted },
  achieveDesc: { fontSize: 10, color: colors.textMuted, textAlign: 'center', lineHeight: 14 },
  achieveCheck: {
    position: 'absolute', top: 8, right: 8,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
});
