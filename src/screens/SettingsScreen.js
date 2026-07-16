import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, Switch, Pressable,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import useTheme from '../hooks/useTheme';
import useAsyncStorage from '../hooks/useAsyncStorage';
import { spacing, radius, fontSizes, shadows } from '../constants/theme';

const FOCUS_OPTIONS = [20, 25, 30, 45, 60];
const BREAK_OPTIONS = [5, 10, 15];

function SettingRow({ styles, emoji, label, sub, right }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowEmoji}>{emoji}</Text>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      <View>{right}</View>
    </View>
  );
}

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { mode, colors, toggleTheme } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [preferences, setPreferences] = useAsyncStorage('florassence:preferences', {
    notifications: true,
    sounds: true,
    focusDuration: 25,
    breakDuration: 5,
  });

  const notifs = preferences?.notifications ?? true;
  const sounds = preferences?.sounds ?? true;
  const focusDur = preferences?.focusDuration ?? 25;
  const breakDur = preferences?.breakDuration ?? 5;
  const darkMode = mode === 'dark';

  const setPreference = (key, value) => {
    setPreferences((current) => ({ ...(current || {}), [key]: value }));
  };

  const SwitchComp = ({ value, onValueChange }) => (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: colors.border, true: colors.primary }}
      thumbColor={colors.surface}
    />
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={8}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.pageTitle}>⚙️ Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Notifications */}
        <Text style={styles.sectionLabel}>🔔 Notifications</Text>
        <View style={styles.card}>
          <SettingRow styles={styles} emoji="🔔" label="Session Alerts" sub="Notify when a session ends"
            right={<SwitchComp value={notifs} onValueChange={(value) => setPreference('notifications', value)} />} />
          <View style={styles.divider} />
          <SettingRow styles={styles} emoji="🎵" label="Focus Sounds" sub="Ambient nature sounds"
            right={<SwitchComp value={sounds} onValueChange={(value) => setPreference('sounds', value)} />} />
        </View>

        {/* Appearance */}
        <Text style={styles.sectionLabel}>🌙 Appearance</Text>
        <View style={styles.card}>
          <SettingRow styles={styles} emoji="🌙" label="Night Mode" sub="Dark forest theme"
            right={<SwitchComp value={darkMode} onValueChange={toggleTheme} />} />
        </View>

        {/* Timer */}
        <Text style={styles.sectionLabel}>🏮 Focus Timer</Text>
        <View style={styles.card}>
          <Text style={styles.pickerLabel}>Focus Duration</Text>
          <View style={styles.chipRow}>
            {FOCUS_OPTIONS.map((m) => (
              <Pressable key={m} onPress={() => setPreference('focusDuration', m)}
                style={[styles.chip, focusDur === m && styles.chipActive]}>
                <Text style={[styles.chipText, focusDur === m && styles.chipTextActive]}>{m}m</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.divider} />
          <Text style={[styles.pickerLabel, { marginTop: spacing.sm }]}>Break Duration</Text>
          <View style={styles.chipRow}>
            {BREAK_OPTIONS.map((m) => (
              <Pressable key={m} onPress={() => setPreference('breakDuration', m)}
                style={[styles.chip, breakDur === m && styles.chipActive]}>
                <Text style={[styles.chipText, breakDur === m && styles.chipTextActive]}>{m}m</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Footer quote */}
        <Text style={styles.quote}>"A journey of a thousand miles begins with a single step." 🌿</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// A factory instead of a module-level StyleSheet.create — this is what lets
// the same screen render correctly in either theme: it's re-run (via
// useMemo above) whenever `colors` changes, instead of being baked in once
// at import time the way a static StyleSheet.create({...colors.x...}) would be.
function makeStyles(colors) {
  return StyleSheet.create({
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

    sectionLabel: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textMuted, marginBottom: spacing.sm, marginTop: spacing.lg },
    card: {
      backgroundColor: colors.surface, borderRadius: radius.lg,
      borderWidth: 1, borderColor: colors.border, overflow: 'hidden', ...shadows.xs,
    },
    row: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.md,
      paddingVertical: spacing.md + 2, paddingHorizontal: spacing.lg,
    },
    rowEmoji: { fontSize: 20, width: 26, textAlign: 'center' },
    rowText: { flex: 1 },
    rowLabel: { fontSize: fontSizes.body, fontWeight: '600', color: colors.text },
    rowSub: { fontSize: fontSizes.xs, color: colors.textMuted, marginTop: 1 },
    divider: { height: 1, backgroundColor: colors.border, marginLeft: spacing.lg + 26 + spacing.md },

    pickerLabel: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textMuted, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, padding: spacing.lg, paddingTop: spacing.sm },
    chip: {
      paddingHorizontal: spacing.md, paddingVertical: 8,
      borderRadius: radius.full, backgroundColor: colors.surfaceAlt,
      borderWidth: 1.5, borderColor: colors.border,
    },
    chipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
    chipText: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textMuted },
    chipTextActive: { color: colors.primary },

    quote: {
      textAlign: 'center', fontStyle: 'italic',
      fontSize: fontSizes.sm, color: colors.textMuted,
      marginTop: spacing.xxl, lineHeight: 22,
    },
  });
}
