import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable,
  StyleSheet, SafeAreaView, StatusBar, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius, fontSizes, shadows } from '../constants/theme';

const FAQ = [
  { q: '🏮 How does the Focus Timer work?', a: 'Light the lantern and focus for 25 minutes. After 4 sessions, reward yourself with a long break. Fireflies appear to keep you company.' },
  { q: '🌸 How do I save a task?', a: 'Tap the heart icon on any task card. Saved tasks appear in your Saved tab — like pressed flowers you can return to.' },
  { q: '🌿 Where do tasks come from?', a: 'You have local study tasks plus tasks fetched from our scrolls (API). Pull down on any list to refresh.' },
  { q: '⭐ What is XP?', a: 'XP (experience points) is earned by completing focus sessions and tasks. Level up to unlock new spirit badges!' },
  { q: '🔗 What are deep links?', a: 'Share a task with the link florassence://app/task/[id]. Opening it takes you straight to that task\'s detail page.' },
  { q: '📜 How do I search tasks?', a: 'Head to the Tasks tab. Type in the search scroll to filter by title, category, or notes. Filter chips narrow results further.' },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.faqItem}>
      <Pressable onPress={() => setOpen((o) => !o)} style={styles.faqQ}>
        <Text style={styles.faqQText}>{q}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
      </Pressable>
      {open && <Text style={styles.faqA}>{a}</Text>}
    </View>
  );
}

export default function HelpScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={8}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.pageTitle}>🍃 Help</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Hero */}
        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>🌿</Text>
          <Text style={styles.heroTitle}>The Forest Guide</Text>
          <Text style={styles.heroSub}>Answers to your questions, carried on the wind.</Text>
        </View>

        {/* FAQ */}
        <Text style={styles.sectionTitle}>Frequently Asked</Text>
        <View style={styles.faqCard}>
          {FAQ.map((item, i) => (
            <React.Fragment key={i}>
              <FaqItem q={item.q} a={item.a} />
              {i < FAQ.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Contact */}
        <View style={styles.contactCard}>
          <Text style={styles.contactEmoji}>📮</Text>
          <Text style={styles.contactTitle}>Still lost in the woods?</Text>
          <Text style={styles.contactSub}>Send a message and a spirit will guide you.</Text>
          <Pressable style={styles.contactBtn}>
            <Text style={styles.contactBtnText}>Contact Support</Text>
          </Pressable>
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

  heroCard: {
    backgroundColor: colors.primarySoft, borderRadius: radius.xl,
    padding: spacing.xl, alignItems: 'center', gap: spacing.sm,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xl, ...shadows.xs,
  },
  heroEmoji: { fontSize: 40 },
  heroTitle: { fontSize: fontSizes.sub, fontWeight: '700', color: colors.primaryDark },
  heroSub: { fontSize: fontSizes.sm, color: colors.primary, textAlign: 'center', fontStyle: 'italic' },

  sectionTitle: { fontSize: fontSizes.label, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },

  faqCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
    marginBottom: spacing.xl, ...shadows.xs,
  },
  faqItem: { paddingHorizontal: spacing.lg },
  faqQ: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md },
  faqQText: { flex: 1, fontSize: fontSizes.body, fontWeight: '600', color: colors.text, paddingRight: spacing.sm },
  faqA: {
    fontSize: fontSizes.sm, color: colors.textSecondary, lineHeight: 20,
    paddingBottom: spacing.md, fontStyle: 'italic',
  },
  divider: { height: 1, backgroundColor: colors.border },

  contactCard: {
    backgroundColor: colors.surface, borderRadius: radius.xl,
    padding: spacing.xl, alignItems: 'center', gap: spacing.sm,
    borderWidth: 1, borderColor: colors.border, ...shadows.xs,
  },
  contactEmoji: { fontSize: 36 },
  contactTitle: { fontSize: fontSizes.sub, fontWeight: '700', color: colors.text },
  contactSub: { fontSize: fontSizes.sm, color: colors.textMuted, textAlign: 'center', fontStyle: 'italic' },
  contactBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary, borderRadius: radius.lg,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md, ...shadows.sm,
  },
  contactBtnText: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textInverse },
});
