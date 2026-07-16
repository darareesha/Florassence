// ─── Florassence · App Entry Point ───────────────────────────────────────────
import 'react-native-gesture-handler';
import React, { useState, useEffect, useMemo } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';

import RootNavigator from './src/navigation';
import linking        from './src/navigation/linking';
import useTheme, { ThemeProvider } from './src/hooks/useTheme';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { TasksProvider } from './src/context/TasksContext';
import { XPProvider }    from './src/context/XPContext';
import { getOnboardingDone } from './src/services/storage';
import OnboardingScreen from './src/screens/OnboardingScreen';
import OfflineBanner from './src/components/OfflineBanner';
import { colors } from './src/constants/theme';

export default function App() {
  const [fontsLoaded] = useFonts({
    PixelFont: require('./assets/fonts/PixelFont.ttf'),
  });

  const [appReady,        setAppReady]        = useState(false);
  const [onboardingDone,  setOnboardingDone_] = useState(false);

  useEffect(() => {
    getOnboardingDone()
      .then((done) => {
        setOnboardingDone_(done);
        setAppReady(true);
      })
      .catch(() => setAppReady(true));
  }, []);

  // This splash covers font-loading + the onboarding-flag check only. Whether
  // a login session is persisted is a *separate* concern, checked by
  // AuthProvider and rendered as its own loading state further down in
  // <AppShell> — mixing the two together would mean re-checking fonts every
  // time auth state changes, and vice versa.
  if (!fontsLoaded || !appReady) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    // SafeAreaProvider must wrap everything: useSafeAreaInsets() (used by
    // FocusScreen and OfflineBanner) throws without it in scope.
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <XPProvider>
            <TasksProvider>
              {!onboardingDone ? (
                // Show onboarding until completed
                <OnboardingScreen onDone={() => setOnboardingDone_(true)} />
              ) : (
                <AppShell />
              )}
            </TasksProvider>
          </XPProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

// Split out so it can call useTheme()/useAuth() — both need to be inside
// their providers, which App() itself is rendering above.
function AppShell() {
  const { mode, colors: themeColors } = useTheme();
  const { isAuthed, checkingSession } = useAuth();

  // Recomputed only when mode/colors actually change, so toggling theme is
  // the only thing that re-builds the navigation container's own theme.
  const navTheme = useMemo(() => ({
    dark: mode === 'dark',
    colors: {
      primary:      themeColors.primary,
      background:   themeColors.background,
      card:         themeColors.surface,
      text:         themeColors.text,
      border:       themeColors.border,
      notification: themeColors.danger,
    },
  }), [mode, themeColors]);

  // The "auth loading state" from the Mock Auth Flow checklist item — while
  // we're still checking AsyncStorage for a persisted session, show a
  // distinct spinner rather than flashing the login screen and then
  // immediately replacing it once we learn the user was already signed in.
  if (checkingSession) {
    return (
      <View style={[styles.splash, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer linking={linking} theme={navTheme}>
        <StatusBar style={mode === 'dark' ? 'light' : 'dark'} backgroundColor={themeColors.background} />
        <RootNavigator isAuthed={isAuthed} />
      </NavigationContainer>
      <OfflineBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
