import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { saveProfile } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, radius, fontSizes, shadows } from '../constants/theme';

export default function AuthScreen() {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [signingIn, setSigningIn] = useState(false);

  const handleContinue = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please tell us your name to continue');
      return;
    }
    setError(null);
    setSigningIn(true);

    const trimmedEmail = email.trim() || 'guest@florassence.app';
    // Keep the display profile in sync with what they typed in here.
    await saveProfile({ name: trimmedName, email: trimmedEmail });
    // login() persists the session; RootNavigator reacts to isAuthed flipping
    // to true by swapping to the protected branch — no manual navigate needed.
    await login({ name: trimmedName, email: trimmedEmail });
    setSigningIn(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.card}>
        <Text style={styles.emoji}>🌿</Text>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue your forest journey.</Text>

        <TextInput
          value={name}
          onChangeText={(v) => { setName(v); if (error) setError(null); }}
          placeholder="Your name"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, error && styles.inputError]}
          returnKeyType="next"
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email (optional)"
          placeholderTextColor={colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          returnKeyType="done"
          onSubmitEditing={handleContinue}
        />

        <Pressable
          style={({ pressed }) => [styles.button, signingIn && styles.buttonDisabled, pressed && !signingIn && { opacity: 0.9 }]}
          onPress={handleContinue}
          disabled={signingIn}
        >
          {signingIn
            ? <ActivityIndicator color={colors.textInverse} />
            : <Text style={styles.buttonText}>Continue</Text>}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  emoji: { fontSize: 36, marginBottom: spacing.sm },
  title: { fontSize: fontSizes.h2, fontWeight: '800', color: colors.text, marginBottom: spacing.xs },
  subtitle: { fontSize: fontSizes.sm, color: colors.textMuted, marginBottom: spacing.lg },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputError: { borderColor: colors.danger, marginBottom: spacing.xs },
  errorText: { fontSize: fontSizes.xs, color: colors.danger, fontWeight: '600', marginBottom: spacing.md },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: colors.textInverse, fontSize: fontSizes.body, fontWeight: '700' },
});
