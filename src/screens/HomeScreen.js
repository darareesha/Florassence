
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, Pressable,
  StyleSheet, SafeAreaView, StatusBar, Animated, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions, useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { colors, spacing, radius, fontSizes, shadows } from '../constants/theme';
import { getProfile } from '../services/storage';
import { useTasks } from '../context/TasksContext';
import { useXP } from '../context/XPContext';
import TaskCard from '../components/TaskCard';

const GHIBLI_QUOTES = [
  { text: '"Always believe in yourself."', src: '— Castle in the Sky' },
  { text: '"Once you do something, you never forget."', src: '— Spirited Away' },
  { text: '"No matter how many mistakes you make, keep walking forward."', src: '— My Neighbor Totoro' },
  { text: '"It\'s better to carry a small bag on a long journey."', src: '— Kiki\'s Delivery Service' },
  { text: '"Whenever someone creates something with all of their heart, it becomes a treasure."', src: '— Castle in the Sky' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return 'Still awake?';
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  if (h < 21) return 'Good Evening';
  return 'Good Night';
}

function IllustCloud({ startX, y, width, delay }) {
  const tx = useRef(new Animated.Value(startX)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(tx, { toValue: startX + 18, duration: 5500, useNativeDriver: true }),
        Animated.timing(tx, { toValue: startX, duration: 5500, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const h = width * 0.38;
  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: 'absolute', top: y, transform: [{ translateX: tx }] }}
    >
      {/* Main cloud puff */}
      <View style={{ width, height: h, backgroundColor: 'rgba(255,255,255,0.78)', borderRadius: h / 2 }} />
      {/* Secondary puff on top */}
      <View style={{
        position: 'absolute', top: -h * 0.3, left: width * 0.2,
        width: width * 0.55, height: h * 0.7,
        backgroundColor: 'rgba(255,255,255,0.68)', borderRadius: (h * 0.7) / 2,
      }} />
    </Animated.View>
  );
}

// Small floating leaf
function FloatingLeaf({ x, y, delay }) {
  const ty = useRef(new Animated.Value(0)).current;
  const rot = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ty, { toValue: -8, duration: 2800 + delay, useNativeDriver: true }),
          Animated.timing(ty, { toValue: 0, duration: 2800 + delay, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(rot, { toValue: 1, duration: 4000, useNativeDriver: true }),
          Animated.timing(rot, { toValue: 0, duration: 4000, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);
  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: ['-12deg', '12deg'] });
  return (
    <Animated.Text
      pointerEvents="none"
      style={{ position: 'absolute', left: x, top: y, fontSize: 14, transform: [{ translateY: ty }, { rotate }] }}
    >
      🍃
    </Animated.Text>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const { tasks }  = useTasks();
  const { dailyGoal, stats, level, xpProgress } = useXP();
  const [name, setName] = useState('Traveler');
  const quote = GHIBLI_QUOTES[new Date().getDay() % GHIBLI_QUOTES.length];

  useFocusEffect(useCallback(() => {
    getProfile().then((p) => { if (p?.name) setName(p.name); });
  }, []));

  const todayTasks = tasks.filter((t) => t.filter === 'today' && !t.completed).slice(0, 4);

  // ── Animations ────────────────────────────────────────────────────────────
  // Companion bob
  const spiritBob  = useRef(new Animated.Value(0)).current;
  // Companion entrance wave (rotation tilt)
  const spiritTilt = useRef(new Animated.Value(0)).current;
  // Cards entrance
  const cardSlide  = useRef(new Animated.Value(30)).current;
  const cardFade   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Bob forever
    Animated.loop(
      Animated.sequence([
        Animated.timing(spiritBob, { toValue: -10, duration: 2000, useNativeDriver: true }),
        Animated.timing(spiritBob, { toValue: 0,   duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    // Wave 3 times on mount then settle
    Animated.sequence([
      Animated.timing(spiritTilt, { toValue: 1,  duration: 200, useNativeDriver: true }),
      Animated.timing(spiritTilt, { toValue: -1, duration: 200, useNativeDriver: true }),
      Animated.timing(spiritTilt, { toValue: 1,  duration: 200, useNativeDriver: true }),
      Animated.timing(spiritTilt, { toValue: -1, duration: 200, useNativeDriver: true }),
      Animated.timing(spiritTilt, { toValue: 1,  duration: 200, useNativeDriver: true }),
      Animated.timing(spiritTilt, { toValue: 0,  duration: 300, useNativeDriver: true }),
    ]).start();

    // Cards slide up
    Animated.parallel([
      Animated.timing(cardSlide, { toValue: 0, duration: 500, delay: 200, useNativeDriver: true }),
      Animated.timing(cardFade,  { toValue: 1, duration: 500, delay: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  const tilt = spiritTilt.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-14deg', '0deg', '14deg'] });

  const goalSessionsPct = dailyGoal.targetSessions > 0
    ? Math.min(dailyGoal.sessionsCompleted / dailyGoal.targetSessions, 1)
    : 0;
  const goalTasksPct = dailyGoal.targetTasks > 0
    ? Math.min(dailyGoal.tasksCompleted / dailyGoal.targetTasks, 1)
    : 0;
  const overallGoalPct = (goalSessionsPct + goalTasksPct) / 2;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#C5DFF0" translucent={false} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <View style={styles.heroScene}>
          {/* Sky */}
          <View style={styles.sky} />
          {/* Sky gradient bands */}
          <View style={styles.skyBand1} />
          <View style={styles.skyBand2} />

          {/* Sun glow */}
          <View style={styles.sunGlow} />
          <View style={styles.sun} />

          {/* Clouds */}
          <IllustCloud startX={10}  y={46} width={90} delay={0}    />
          <IllustCloud startX={190} y={30} width={70} delay={1800} />
          <IllustCloud startX={110} y={58} width={55} delay={900}  />

          {/* Floating leaves */}
          <FloatingLeaf x={30}  y={120} delay={0}    />
          <FloatingLeaf x={270} y={100} delay={700}  />
          <FloatingLeaf x={155} y={130} delay={1400} />

          {/* Back hills */}
          <View style={styles.hillBackFar} />
          <View style={styles.hillBack} />

          {/* Nature decorations on hills */}
          <Text style={[styles.natDecor, { left: 22,  bottom: 22 }]}>🌸</Text>
          <Text style={[styles.natDecor, { left: 58,  bottom: 32 }]}>🌿</Text>
          <Text style={[styles.natDecor, { left: 92,  bottom: 20 }]}>🍄</Text>
          <Text style={[styles.natDecor, { left: 148, bottom: 38 }]}>🌼</Text>
          <Text style={[styles.natDecor, { right: 24, bottom: 24 }]}>🌱</Text>
          <Text style={[styles.natDecor, { right: 68, bottom: 30 }]}>🌾</Text>
          <Text style={[styles.natDecor, { right: 108, bottom: 20 }]}>🍃</Text>

          {/* Front hill */}
          <View style={styles.hillFront} />

          {/* Header row */}
          <View style={styles.headerRow}>
            <Pressable
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              style={styles.iconBtn} hitSlop={8}
            >
              <Ionicons name="menu" size={22} color={colors.text} />
            </Pressable>
            <View style={styles.headerCenter}>
              <Text style={styles.appBrand}>✦ Florassence ✦</Text>
            </View>
            <Pressable style={styles.iconBtn} hitSlop={8}>
              <Ionicons name="notifications-outline" size={20} color={colors.text} />
              <View style={styles.bellDot} />
            </Pressable>
          </View>

          {/* Greeting — upper left in sky */}
          <View style={styles.greetingArea} pointerEvents="none">
            <Text style={styles.greetingSmall}>{getGreeting()},</Text>
            <Text style={styles.greetingName}>{name} ✨</Text>
          </View>

          {/* Companion — center stage, large */}
          <Animated.Image
            source={require('../../assets/images/spirit_buddy.png')}
            style={[styles.companionImg, {
              transform: [
                { translateY: spiritBob },
                { rotate: tilt },
              ],
            }]}
            resizeMode="contain"
          />
        </View>

        <Animated.View style={[styles.body, { opacity: cardFade, transform: [{ translateY: cardSlide }] }]}>

          <View style={styles.goalCard}>
            <View style={styles.goalTop}>
              <View>
                <Text style={styles.goalTitle}>✦ Daily Goal</Text>
                <Text style={styles.goalSub}>Keep the spirit alive!</Text>
              </View>
              <View style={styles.goalPill}>
                <Text style={styles.goalPillText}>
                  {Math.round(overallGoalPct * 100)}%
                </Text>
              </View>
            </View>

            {/* Double progress bars */}
            <View style={styles.goalBars}>
              <View style={styles.goalBarRow}>
                <Text style={styles.goalBarLabel}>🏮 Sessions  {dailyGoal.sessionsCompleted}/{dailyGoal.targetSessions}</Text>
                <View style={styles.goalBarTrack}>
                  <View style={[styles.goalBarFill, { width: `${Math.round(goalSessionsPct * 100)}%` }]} />
                </View>
              </View>
              <View style={styles.goalBarRow}>
                <Text style={styles.goalBarLabel}>📜 Tasks  {dailyGoal.tasksCompleted}/{dailyGoal.targetTasks}</Text>
                <View style={styles.goalBarTrack}>
                  <View style={[styles.goalBarFill, { width: `${Math.round(goalTasksPct * 100)}%`, backgroundColor: colors.gold }]} />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.statsStrip}>
            {[
              { label: 'Streak',  value: `${stats?.streak ?? 7}d`,  icon: 'flame',          bg: colors.accentSoft,  ink: colors.accent  },
              { label: 'Level',   value: `Lv.${level}`,             icon: 'star',           bg: colors.goldSoft,    ink: colors.gold    },
              { label: 'Done',    value: `${tasks.filter(t=>t.completed).length}`,  icon: 'checkmark-done', bg: colors.primarySoft, ink: colors.primary },
              { label: 'XP',      value: `${Math.round(xpProgress * 100)}%`,        icon: 'sparkles',       bg: colors.skySoft,     ink: colors.sky     },
            ].map((s, i) => (
              <View key={i} style={[styles.statCard, { backgroundColor: s.bg }]}>
                <Ionicons name={s.icon} size={16} color={s.ink} />
                <Text style={[styles.statVal, { color: s.ink }]}>{s.value}</Text>
                <Text style={[styles.statLbl, { color: s.ink + 'BB' }]}>{s.label}</Text>
              </View>
            ))}
          </View>

          {}
          <Pressable
            onPress={() => navigation.navigate('Focus')}
            style={({ pressed }) => [styles.lanternBanner, pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] }]}
          >
            <View style={styles.lanternLeft}>
              <View style={styles.lanternOrbSmall}>
                <Text style={{ fontSize: 22 }}>🏮</Text>
              </View>
              <View>
                <Text style={styles.lanternTitle}>Light the Lantern</Text>
                <Text style={styles.lanternSub}>Begin a focused study session</Text>
              </View>
            </View>
            <View style={styles.lanternPlay}>
              <Ionicons name="play" size={18} color={colors.night} />
            </View>
          </Pressable>

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>🌿 Due Today</Text>
            <Pressable onPress={() => navigation.navigate('Listing')}>
              <Text style={styles.seeAll}>See all →</Text>
            </Pressable>
          </View>

          {todayTasks.length === 0 ? (
            <View style={styles.emptyTasks}>
              <Text style={styles.emptyTasksEmoji}>🍃</Text>
              <Text style={styles.emptyTasksText}>All caught up for today!</Text>
            </View>
          ) : (
            <View style={styles.taskList}>
              {todayTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onPress={(t) => navigation.navigate('TaskDetail', { task: t })}
                />
              ))}
            </View>
          )}

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>🌸 Quick Actions</Text>
          </View>
          <View style={styles.qaGrid}>
            {[
              { label: 'All Tasks',   icon: 'list-outline',   bg: colors.primarySoft, ink: colors.primary, nav: () => navigation.navigate('SearchStack') },
              { label: 'Focus',       icon: 'timer-outline',  bg: colors.goldSoft,    ink: colors.gold,    nav: () => navigation.navigate('Focus') },
              { label: 'Saved',       icon: 'heart-outline',  bg: colors.dangerSoft,  ink: colors.danger,  nav: () => navigation.navigate('FavoritesStack') },
              { label: 'Progress',    icon: 'bar-chart-outline', bg: colors.skySoft,  ink: colors.sky,     nav: () => navigation.navigate('DrawerStats') },
            ].map((q, i) => (
              <Pressable
                key={i}
                style={({ pressed }) => [styles.qaCard, { backgroundColor: q.bg }, pressed && { opacity: 0.82 }]}
                onPress={q.nav}
              >
                <Ionicons name={q.icon} size={22} color={q.ink} />
                <Text style={[styles.qaLabel, { color: q.ink }]}>{q.label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.quoteCard}>
            <Image
              source={require('../../assets/images/spirit_buddy.png')}
              style={styles.quoteSpirit}
              resizeMode="contain"
            />
            <View style={styles.quoteBubble}>
              <Text style={styles.quoteText}>{quote.text}</Text>
              <Text style={styles.quoteAuthor}>{quote.src}</Text>
            </View>
          </View>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: spacing.xxxl },

  heroScene: {
    height: 330,
    overflow: 'hidden',
    position: 'relative',
  },
  sky:      { ...StyleSheet.absoluteFillObject, backgroundColor: '#C5DFF0' },
  skyBand1: { position: 'absolute', top: '30%', left: 0, right: 0, height: '40%', backgroundColor: '#D8EEFA', opacity: 0.6 },
  skyBand2: { position: 'absolute', bottom: '30%', left: 0, right: 0, height: '30%', backgroundColor: '#E8F5EA', opacity: 0.5 },

  sunGlow: {
    position: 'absolute', top: 18, right: 36,
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,240,140,0.38)',
  },
  sun: {
    position: 'absolute', top: 30, right: 48,
    width: 66, height: 66, borderRadius: 33,
    backgroundColor: '#FFF0A0',
    shadowColor: '#FFD700', shadowRadius: 16, shadowOpacity: 0.5,
  },

  hillBackFar: {
    position: 'absolute', bottom: 60, left: -60, right: -40,
    height: 110, backgroundColor: '#C2D9B8',
    borderTopLeftRadius: 200, borderTopRightRadius: 160,
  },
  hillBack: {
    position: 'absolute', bottom: 30, left: -30, right: -60,
    height: 100, backgroundColor: '#A8C89A',
    borderTopLeftRadius: 140, borderTopRightRadius: 220,
  },
  hillFront: {
    position: 'absolute', bottom: 0, left: -20, right: -20,
    height: 50, backgroundColor: '#8CB882',
    borderTopLeftRadius: 120, borderTopRightRadius: 180,
  },

  natDecor: {
    position: 'absolute', fontSize: 16,
  },

  headerRow: {
    position: 'absolute', top: 14, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  iconBtn: {
    width: 38, height: 38, borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center', justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute', top: 7, right: 8,
    width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: '#E87070',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  appBrand: {
    fontSize: fontSizes.sm, fontWeight: '700',
    color: colors.primaryDark, letterSpacing: 0.6,
  },

  greetingArea: {
    position: 'absolute', top: 66, left: spacing.xl,
  },
  greetingSmall: {
    fontSize: fontSizes.sm, fontWeight: '500', color: colors.primaryDark,
  },
  greetingName: {
    fontSize: fontSizes.h2, fontWeight: '800', color: colors.text, marginTop: 1,
  },

  companionImg: {
    position: 'absolute',
    width: 130, height: 130,
    bottom: 48,
    alignSelf: 'center',
    left: '50%',
    marginLeft: -65,
  },

  body: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },

  // Goal card
  goalCard: {
    backgroundColor: colors.surface, borderRadius: radius.xl,
    padding: spacing.lg, marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.border, ...shadows.sm,
  },
  goalTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: spacing.md,
  },
  goalTitle: { fontSize: fontSizes.label, fontWeight: '700', color: colors.text },
  goalSub:   { fontSize: fontSizes.xs, color: colors.textMuted, marginTop: 2 },
  goalPill: {
    backgroundColor: colors.primarySoft, paddingHorizontal: spacing.md, paddingVertical: 4,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.border,
  },
  goalPillText: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.primary },
  goalBars: { gap: spacing.sm },
  goalBarRow: { gap: 5 },
  goalBarLabel: { fontSize: fontSizes.xs, color: colors.textMuted, fontWeight: '600' },
  goalBarTrack: { height: 8, backgroundColor: colors.surfaceAlt, borderRadius: 4, overflow: 'hidden' },
  goalBarFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },

  // Stats strip
  statsStrip: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md },
  statCard: {
    flex: 1, borderRadius: radius.md, padding: spacing.sm,
    alignItems: 'center', gap: 3,
    borderWidth: 1, borderColor: colors.border,
  },
  statVal: { fontSize: fontSizes.sm, fontWeight: '800' },
  statLbl: { fontSize: fontSizes.xxs, fontWeight: '500', textAlign: 'center' },

  // Lantern banner
  lanternBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.night, borderRadius: radius.xl,
    padding: spacing.md + 2, marginBottom: spacing.md,
    ...shadows.md,
  },
  lanternLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  lanternOrbSmall: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,200,60,0.18)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,200,60,0.30)',
  },
  lanternTitle: { fontSize: fontSizes.sub, fontWeight: '700', color: colors.textInverse },
  lanternSub: { fontSize: fontSizes.xs, color: 'rgba(245,237,216,0.60)', marginTop: 2 },
  lanternPlay: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.goldBright,
    alignItems: 'center', justifyContent: 'center',
  },

  // Sections
  sectionRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.sm,
  },
  sectionTitle: { fontSize: fontSizes.label, fontWeight: '700', color: colors.text },
  seeAll: { fontSize: fontSizes.xs, fontWeight: '600', color: colors.primary },

  // Tasks
  taskList: { gap: spacing.sm },
  emptyTasks: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.primarySoft, borderRadius: radius.lg,
    padding: spacing.lg, justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  emptyTasksEmoji: { fontSize: 20 },
  emptyTasksText: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.primaryDark },

  // Quick actions
  qaGrid: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.xl },
  qaCard: {
    flex: 1, alignItems: 'center', borderRadius: radius.md,
    paddingVertical: spacing.md, gap: 6,
    borderWidth: 1, borderColor: colors.border,
  },
  qaLabel: { fontSize: fontSizes.xxs, fontWeight: '700', textAlign: 'center' },

  // Quote / Companion card
  quoteCard: {
    flexDirection: 'row', alignItems: 'flex-end',
    backgroundColor: colors.surface, borderRadius: radius.xl,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
    gap: spacing.md, ...shadows.xs, marginBottom: spacing.lg,
  },
  quoteSpirit: { width: 56, height: 56, flexShrink: 0 },
  quoteBubble: { flex: 1 },
  quoteText: {
    fontSize: fontSizes.sm, color: colors.text, fontStyle: 'italic',
    lineHeight: 20, marginBottom: spacing.xs,
  },
  quoteAuthor: { fontSize: fontSizes.xs, color: colors.textMuted, fontWeight: '600' },
});
