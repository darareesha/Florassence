
import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  Dimensions, ScrollView, Animated, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { setOnboardingDone, saveProfile } from '../services/storage';
import { colors, spacing, radius, fontSizes, shadows } from '../constants/theme';

const { width: W, height: H } = Dimensions.get('window');

const SLIDES = [
  {
    emoji: '🌿',
    title: 'Welcome to Florassence',
    subtitle: 'A cozy forest where every study session makes the world bloom.',
    hint: 'Your companion grows with you.',
    bg: '#D6EDD8',
    accent: '#4D7A5B',
  },
  {
    emoji: '🏮',
    title: 'Light Your Study Lantern',
    subtitle: 'Pomodoro-powered focus sessions with a magical twist. Fireflies dance as you work.',
    hint: 'Earn XP after every session.',
    bg: '#FBF0D5',
    accent: '#C9933A',
  },
  {
    emoji: '🌸',
    title: 'Track, Grow, Celebrate',
    subtitle: 'Complete tasks, hit daily goals, collect spirit badges and watch your forest flourish.',
    hint: 'Your journey starts now.',
    bg: '#F5EDD8',
    accent: '#4D7A5B',
  },
];

// A single dot for the pagination indicator
function Dot({ active, color }) {
  return (
    <View style={[
      styles.dot,
      active ? [styles.dotActive, { backgroundColor: color }] : styles.dotInactive,
    ]} />
  );
}

// Nature decoration strip
function NatureStrip({ accent }) {
  const leaves = ['🌸', '🌿', '🍄', '🌼', '🌱', '🍃', '🌾', '✿'];
  return (
    <View style={styles.natureStrip}>
      {leaves.map((l, i) => (
        <Text key={i} style={[styles.leafDecor, { opacity: 0.55 + (i % 3) * 0.15 }]}>{l}</Text>
      ))}
    </View>
  );
}

export default function OnboardingScreen({ onDone }) {
  const [page, setPage]   = useState(0);
  const [name, setName]   = useState('');
  const scrollRef         = useRef(null);
  const fadeAnim          = useRef(new Animated.Value(1)).current;

  const slide = SLIDES[page];

  function goTo(index) {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
    setPage(index);
    scrollRef.current?.scrollTo({ x: index * W, animated: true });
  }

  function handleNext() {
    if (page < SLIDES.length - 1) {
      goTo(page + 1);
    } else {
      handleFinish();
    }
  }

  async function handleFinish() {
    const finalName = name.trim() || 'Traveler';
    await saveProfile({ name: finalName });
    await setOnboardingDone();
    onDone();
  }

  const isLast = page === SLIDES.length - 1;

  return (
    <KeyboardAvoidingView style={[styles.root, { backgroundColor: slide.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Skip */}
      {!isLast && (
        <Pressable style={styles.skipBtn} onPress={handleFinish}>
          <Text style={[styles.skipText, { color: slide.accent }]}>Skip</Text>
        </Pressable>
      )}

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Big emoji illustration */}
        <View style={[styles.emojiCircle, { backgroundColor: slide.accent + '22', borderColor: slide.accent + '33' }]}>
          <Text style={styles.bigEmoji}>{slide.emoji}</Text>

          {/* Companion image on last slide */}
          {isLast && (
            <Image
              source={require('../../assets/images/spirit_buddy.png')}
              style={styles.companionSmall}
              resizeMode="contain"
            />
          )}
        </View>

        {/* Nature decoration */}
        <NatureStrip accent={slide.accent} />

        {/* Text */}
        <Text style={[styles.title, { color: colors.text }]}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
        <Text style={[styles.hint, { color: slide.accent }]}>✦ {slide.hint} ✦</Text>

        {/* Name input on last slide */}
        {isLast && (
          <View style={styles.nameSection}>
            <Text style={styles.nameLabel}>What shall I call you?</Text>
            <View style={styles.nameInputWrap}>
              <Ionicons name="person-outline" size={18} color={colors.textMuted} />
              <TextInput
                style={styles.nameInput}
                value={name}
                onChangeText={setName}
                placeholder="Your name..."
                placeholderTextColor={colors.textMuted}
                returnKeyType="done"
                onSubmitEditing={handleFinish}
                autoFocus={false}
                maxLength={24}
              />
            </View>
          </View>
        )}
      </Animated.View>

      {/* Pagination dots */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => <Dot key={i} active={i === page} color={slide.accent} />)}
      </View>

      {/* Next / Get Started button */}
      <Pressable
        style={({ pressed }) => [
          styles.nextBtn,
          { backgroundColor: slide.accent },
          pressed && { opacity: 0.88, transform: [{ scale: 0.97 }] },
        ]}
        onPress={handleNext}
      >
        <Text style={styles.nextBtnText}>
          {isLast ? '✦  Begin Your Journey' : 'Next  →'}
        </Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },

  skipBtn: {
    position: 'absolute', top: 54, right: spacing.xl, zIndex: 10,
  },
  skipText: { fontSize: fontSizes.sm, fontWeight: '600' },

  content: { alignItems: 'center', width: '100%' },

  emojiCircle: {
    width: 160, height: 160, borderRadius: 80,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, marginBottom: spacing.md,
    position: 'relative',
  },
  bigEmoji: { fontSize: 72 },
  companionSmall: {
    position: 'absolute', bottom: -16, right: -10,
    width: 64, height: 64,
  },

  natureStrip: {
    flexDirection: 'row', gap: spacing.xs,
    marginBottom: spacing.lg, marginTop: spacing.xs,
  },
  leafDecor: { fontSize: 18 },

  title: {
    fontSize: fontSizes.h2, fontWeight: '800',
    textAlign: 'center', marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSizes.body, color: colors.textSecondary,
    textAlign: 'center', lineHeight: 24,
    marginBottom: spacing.sm, paddingHorizontal: spacing.md,
  },
  hint: {
    fontSize: fontSizes.xs, fontWeight: '600',
    textAlign: 'center', marginBottom: spacing.lg,
    letterSpacing: 0.3,
  },

  nameSection: { width: '100%', marginTop: spacing.sm },
  nameLabel: {
    fontSize: fontSizes.sm, fontWeight: '600',
    color: colors.textSecondary, marginBottom: spacing.sm, textAlign: 'center',
  },
  nameInputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg, paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderWidth: 1.5, borderColor: colors.border,
    ...shadows.sm,
  },
  nameInput: {
    flex: 1, fontSize: fontSizes.body, color: colors.text, paddingVertical: 0,
  },

  dotsRow: { flexDirection: 'row', gap: 8, marginTop: spacing.xl, marginBottom: spacing.lg },
  dot: { height: 8, borderRadius: 4 },
  dotActive: { width: 28 },
  dotInactive: { width: 8, backgroundColor: colors.border },

  nextBtn: {
    width: '100%', paddingVertical: spacing.lg + 2,
    borderRadius: radius.xl, alignItems: 'center',
    marginBottom: spacing.xxxl,
    ...shadows.md,
  },
  nextBtnText: { fontSize: fontSizes.sub, fontWeight: '800', color: '#FFFDF5', letterSpacing: 0.3 },
});
