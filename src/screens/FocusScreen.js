
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, Pressable, ScrollView, ImageBackground,
  StyleSheet, Animated, Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius, fontSizes, shadows, fonts } from '../constants/theme';
import { useXP } from '../context/XPContext';

const MODES = [
  { key: 'focus',  label: '🏮 Focus',       minutes: 25, overlay: 'rgba(14,26,14,0.62)' },
  { key: 'short',  label: '🌿 Short Break',  minutes: 5,  overlay: 'rgba(14,26,40,0.48)' },
  { key: 'long',   label: '☁️  Long Break',   minutes: 15, overlay: 'rgba(40,26,14,0.42)' },
];
const ROUNDS_TOTAL = 4;

function pad(n)      { return String(n).padStart(2, '0'); }
function formatTime(s) { return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; }

function Firefly({ x, y, delay, size = 6 }) {
  const tx   = useRef(new Animated.Value(0)).current;
  const ty   = useRef(new Animated.Value(0)).current;
  const opac = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const driftX = Animated.loop(Animated.sequence([
      Animated.timing(tx, { toValue: 14,  duration: 2400 + delay * 0.4, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      Animated.timing(tx, { toValue: -10, duration: 2800 + delay * 0.3, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      Animated.timing(tx, { toValue: 0,   duration: 2200, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
    ]));
    const driftY = Animated.loop(Animated.sequence([
      Animated.timing(ty, { toValue: -22, duration: 3100 + delay * 0.2, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      Animated.timing(ty, { toValue: 12,  duration: 2600, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      Animated.timing(ty, { toValue: 0,   duration: 2900, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
    ]));
    const blink = Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.timing(opac, { toValue: 1,    duration: 900,  useNativeDriver: true }),
      Animated.timing(opac, { toValue: 0.15, duration: 1400, useNativeDriver: true }),
    ]));
    driftX.start(); driftY.start(); blink.start();
    return () => { driftX.stop(); driftY.stop(); blink.stop(); };
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute', left: x - size / 2, top: y - size / 2,
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: colors.firefly, opacity: opac,
        transform: [{ translateX: tx }, { translateY: ty }],
        shadowColor: colors.firefly, shadowRadius: 6, shadowOpacity: 1, elevation: 3,
      }}
    />
  );
}

function Flame({ isRunning, progress }) {
  const scaleY = useRef(new Animated.Value(1)).current;
  const scaleX = useRef(new Animated.Value(1)).current;
  const glow   = useRef(new Animated.Value(0.8)).current;
  const flickerRef = useRef(null);

  useEffect(() => {
    if (flickerRef.current) { flickerRef.current.stop(); flickerRef.current = null; }
    if (isRunning) {
      const anim = Animated.loop(Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleY, { toValue: 1.12, duration: 320, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
          Animated.timing(scaleX, { toValue: 0.93, duration: 320, useNativeDriver: true }),
          Animated.timing(glow,   { toValue: 1.0,  duration: 320, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scaleY, { toValue: 0.96, duration: 270, useNativeDriver: true }),
          Animated.timing(scaleX, { toValue: 1.07, duration: 270, useNativeDriver: true }),
          Animated.timing(glow,   { toValue: 0.75, duration: 270, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scaleY, { toValue: 1.08, duration: 190, useNativeDriver: true }),
          Animated.timing(scaleX, { toValue: 0.96, duration: 190, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scaleY, { toValue: 1.0, duration: 240, useNativeDriver: true }),
          Animated.timing(scaleX, { toValue: 1.0, duration: 240, useNativeDriver: true }),
        ]),
      ]));
      anim.start();
      flickerRef.current = anim;
    } else {
      Animated.parallel([
        Animated.timing(scaleY, { toValue: 0.72, duration: 600, useNativeDriver: true }),
        Animated.timing(scaleX, { toValue: 1.0,  duration: 600, useNativeDriver: true }),
        Animated.timing(glow,   { toValue: 0.4,  duration: 600, useNativeDriver: true }),
      ]).start();
    }
  }, [isRunning]);

  const burnPct = 1 - progress;

  return (
    <Animated.View style={{ alignItems: 'center', transform: [{ scaleY }, { scaleX }] }}>
      <Animated.View style={[styles.flameHalo, { opacity: glow }]} />
      <View style={[styles.flameOuter, { opacity: 0.55 + burnPct * 0.45 }]} />
      <View style={[styles.flameInner, { opacity: 0.7 + burnPct * 0.3 }]} />
      <View style={styles.flameTip} />
    </Animated.View>
  );
}

export default function FocusScreen() {
  const navigation = useNavigation();
  const insets     = useSafeAreaInsets();
  const { completeSession, stats, dailyGoal } = useXP();

  const [modeIndex,     setModeIndex]     = useState(0);
  const [round,         setRound]         = useState(1);
  const [secondsLeft,   setSecondsLeft]   = useState(MODES[0].minutes * 60);
  const [isRunning,     setIsRunning]     = useState(false);
  const [sessionsToday, setSessionsToday] = useState(0);
  const [xpEarned,      setXpEarned]      = useState(0);
  const intervalRef = useRef(null);

  const mode     = MODES[modeIndex];
  const total    = mode.minutes * 60;
  const progress = 1 - secondsLeft / total;
  const progressDeg = Math.round(progress * 360);
  const ringSize   = 220;
  const ringStroke = 10;

  // Panel slide-up on mount
  const panelAnim = useRef(new Animated.Value(40)).current;
  useEffect(() => {
    Animated.timing(panelAnim, { toValue: 0, duration: 600, useNativeDriver: true, easing: Easing.out(Easing.cubic) }).start();
  }, []);

  // Timer tick
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            if (mode.key === 'focus') {
              setSessionsToday((n) => n + 1);
              setXpEarned((xp) => xp + 20);
              completeSession(mode.minutes);
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode.key, mode.minutes]);

  const switchMode = useCallback((i) => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setModeIndex(i);
    setSecondsLeft(MODES[i].minutes * 60);
  }, []);

  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setSecondsLeft(mode.minutes * 60);
  }, [mode.minutes]);

  const skip = useCallback(() => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setRound((r) => (r >= ROUNDS_TOTAL ? 1 : r + 1));
    setSecondsLeft(mode.minutes * 60);
  }, [mode.minutes]);

  return (
    <ImageBackground
      source={require('../../assets/images/forest_bg.jpg')}
      style={styles.bg}
      imageStyle={styles.bgImg}
    >
      <View style={[styles.overlay, { backgroundColor: mode.overlay }]} />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xxxl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} style={styles.glassBtn} hitSlop={8}>
            <Ionicons name="arrow-back" size={20} color={colors.textInverse} />
          </Pressable>
          <Text style={styles.pageTitle}>Study Lantern</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Round leaves */}
        <View style={styles.roundRow}>
          {Array.from({ length: ROUNDS_TOTAL }).map((_, i) => (
            <View key={i} style={[styles.roundLeaf, i < round && styles.roundLeafActive]}>
              <Text style={styles.roundLeafText}>{i < round ? '🌿' : '·'}</Text>
            </View>
          ))}
          <Text style={styles.roundLabel}>Round {round} of {ROUNDS_TOTAL}</Text>
        </View>

        {/* Lantern + Firefly Stage */}
        <View style={styles.stage}>
          <Firefly x={38}  y={55}  delay={0}    size={5} />
          <Firefly x={272} y={70}  delay={700}  size={7} />
          <Firefly x={20}  y={175} delay={1400} size={5} />
          <Firefly x={285} y={180} delay={300}  size={6} />
          <Firefly x={60}  y={285} delay={900}  size={4} />
          <Firefly x={250} y={270} delay={500}  size={6} />
          <Firefly x={155} y={18}  delay={1100} size={4} />
          <Firefly x={100} y={295} delay={200}  size={5} />
          <Firefly x={210} y={30}  delay={1600} size={4} />

          <View style={[styles.ringContainer, { width: ringSize, height: ringSize }]}>
            <View style={[styles.ringTrack, { width: ringSize, height: ringSize, borderRadius: ringSize / 2, borderWidth: ringStroke }]} />

            <View style={[styles.halfWrap, { width: ringSize / 2, height: ringSize, left: 0 }]}>
              <View style={[styles.halfArc, {
                width: ringSize, height: ringSize, borderRadius: ringSize / 2,
                borderWidth: ringStroke,
                borderColor: progressDeg > 180 ? colors.goldBright : 'transparent',
                transform: [{ rotate: `${Math.min(progressDeg - 180, 180)}deg` }],
              }]} />
            </View>
            <View style={[styles.halfWrap, { width: ringSize / 2, height: ringSize, right: 0 }]}>
              <View style={[styles.halfArc, {
                width: ringSize, height: ringSize, borderRadius: ringSize / 2,
                borderWidth: ringStroke,
                borderColor: progressDeg > 0 ? colors.goldBright : 'transparent',
                transform: [{ rotate: `${Math.min(progressDeg, 180)}deg` }],
                left: -ringSize / 2,
              }]} />
            </View>

            <View style={styles.lanternOrb}>
              <View style={styles.lanternAura} />
              <View style={styles.lanternGlass}>
                <Flame isRunning={isRunning} progress={progress} />
              </View>
            </View>
          </View>
        </View>

        {/* Time display */}
        <View style={styles.timePanel}>
          <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
          <Text style={styles.timerSub}>
            {isRunning ? `${mode.label} — ${Math.round(progress * 100)}% complete` : '✦ tap to light the lantern ✦'}
          </Text>
        </View>

        {/* Mode chips */}
        <View style={styles.modeRow}>
          {MODES.map((m, i) => (
            <Pressable key={m.key} onPress={() => switchMode(i)} style={[styles.modeChip, modeIndex === i && styles.modeChipActive]}>
              <Text style={[styles.modeLabel, modeIndex === i && styles.modeLabelActive]}>{m.label}</Text>
              <Text style={[styles.modeMin, modeIndex === i && styles.modeMinActive]}>{m.minutes}m</Text>
            </Pressable>
          ))}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable onPress={reset} style={styles.sideBtn} hitSlop={8}>
            <Ionicons name="refresh" size={20} color={colors.goldSoft} />
          </Pressable>
          <Pressable
            onPress={() => setIsRunning((r) => !r)}
            style={({ pressed }) => [styles.playBtn, isRunning && styles.playBtnPause, pressed && { transform: [{ scale: 0.94 }] }]}
          >
            <Ionicons name={isRunning ? 'pause' : 'play'} size={30} color={isRunning ? colors.textInverse : colors.night} />
          </Pressable>
          <Pressable onPress={skip} style={styles.sideBtn} hitSlop={8}>
            <Ionicons name="play-skip-forward" size={20} color={colors.goldSoft} />
          </Pressable>
        </View>

        {/* Bottom panel */}
        <Animated.View style={[styles.bottomPanel, { transform: [{ translateY: panelAnim }] }]}>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statEmoji}>🕯️</Text>
              <Text style={styles.statVal}>{sessionsToday}/{dailyGoal.targetSessions}</Text>
              <Text style={styles.statLbl}>Today</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxMiddle]}>
              <Text style={styles.statEmoji}>✨</Text>
              <Text style={[styles.statVal, { color: colors.gold }]}>+{xpEarned}</Text>
              <Text style={styles.statLbl}>XP Earned</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={styles.statVal}>{stats?.streak ?? 0}</Text>
              <Text style={styles.statLbl}>Day Streak</Text>
            </View>
          </View>
          <View style={styles.tipRow}>
            <Text style={styles.tipText}>
              🌿  "The secret of getting ahead is getting started." — put your phone face-down and let the lantern burn.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg:    { flex: 1 },
  bgImg: { resizeMode: 'cover' },
  overlay: { ...StyleSheet.absoluteFillObject },
  scroll: { alignItems: 'center', paddingHorizontal: spacing.lg },

  topBar: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: spacing.lg },
  glassBtn: {
    width: 40, height: 40, borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  pageTitle: { flex: 1, textAlign: 'center', fontSize: fontSizes.sub, fontWeight: '700', color: colors.textInverse, letterSpacing: 0.5 },

  roundRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.lg },
  roundLeaf: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  roundLeafActive: { backgroundColor: 'rgba(255,229,102,0.2)' },
  roundLeafText: { fontSize: 14 },
  roundLabel: { fontSize: fontSizes.xs, fontWeight: '600', color: 'rgba(245,237,216,0.70)', marginLeft: spacing.xs },

  stage: { width: 310, height: 310, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  ringContainer: { position: 'absolute', top: (310 - 220) / 2, left: (310 - 220) / 2, alignItems: 'center', justifyContent: 'center' },
  ringTrack: { position: 'absolute', borderColor: 'rgba(255,229,102,0.2)' },
  halfWrap: { position: 'absolute', top: 0, overflow: 'hidden' },
  halfArc: { position: 'absolute', top: 0, left: 0, borderTopColor: 'transparent', borderBottomColor: 'transparent' },

  lanternOrb: {
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,160,30,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  lanternAura: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,200,60,0.10)',
    shadowColor: colors.goldBright, shadowRadius: 30, shadowOpacity: 0.6, elevation: 0,
  },
  lanternGlass: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: 'rgba(255,140,20,0.18)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,210,100,0.30)', overflow: 'hidden',
  },

  flameHalo: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,200,50,0.22)' },
  flameOuter: { width: 36, height: 52, borderRadius: 18, backgroundColor: '#F07820', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
  flameInner: { position: 'absolute', bottom: 4, width: 20, height: 32, borderRadius: 10, backgroundColor: '#FFC840', borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  flameTip:   { position: 'absolute', top: 4, width: 8, height: 14, borderRadius: 4, backgroundColor: '#FFFDE0' },

  timePanel: { alignItems: 'center', marginBottom: spacing.xl },
  timerText: {
    fontSize: fontSizes.timer, fontWeight: '800', color: colors.textInverse,
    letterSpacing: 2, fontFamily: fonts.pixel,
    textShadowColor: colors.goldBright, textShadowRadius: 12, textShadowOffset: { width: 0, height: 0 },
  },
  timerSub: { fontSize: fontSizes.xs, color: 'rgba(245,237,216,0.68)', fontWeight: '500', marginTop: 6, textAlign: 'center', letterSpacing: 0.3 },

  modeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  modeChip: {
    alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.lg, backgroundColor: 'rgba(255,253,245,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,229,102,0.25)', minWidth: 90,
  },
  modeChipActive: { backgroundColor: 'rgba(255,229,102,0.22)', borderColor: colors.goldBright },
  modeLabel: { fontSize: fontSizes.xs, fontWeight: '700', color: 'rgba(245,237,216,0.65)' },
  modeLabelActive: { color: colors.goldBright },
  modeMin: { fontSize: fontSizes.xxs, color: 'rgba(245,237,216,0.40)', marginTop: 1 },
  modeMinActive: { color: 'rgba(255,229,102,0.85)' },

  controls: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl, marginBottom: spacing.xl },
  sideBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  playBtn: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: colors.goldBright, alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.goldBright, shadowRadius: 20, shadowOpacity: 0.7, elevation: 8,
  },
  playBtnPause: { backgroundColor: 'rgba(255,200,60,0.32)', borderWidth: 2.5, borderColor: colors.goldBright },

  bottomPanel: {
    width: '100%', backgroundColor: 'rgba(245,237,216,0.14)',
    borderRadius: radius.xl, borderWidth: 1, borderColor: 'rgba(245,237,216,0.22)', overflow: 'hidden',
  },
  statsRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(245,237,216,0.15)' },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: spacing.md, gap: 3 },
  statBoxMiddle: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(245,237,216,0.15)' },
  statEmoji: { fontSize: 18 },
  statVal: { fontSize: fontSizes.sub, fontWeight: '800', color: colors.textInverse },
  statLbl: { fontSize: fontSizes.xxs, color: 'rgba(245,237,216,0.60)', fontWeight: '600' },
  tipRow: { padding: spacing.md },
  tipText: { fontSize: fontSizes.xs, color: 'rgba(245,237,216,0.65)', lineHeight: 18, textAlign: 'center', fontStyle: 'italic' },
});
