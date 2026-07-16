import React, { useEffect, useRef } from 'react';
import {
  View, Text, Pressable, StyleSheet, ImageBackground, Animated, Image, Alert,
} from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import BottomTabs       from './BottomTabs';
import SettingsScreen   from '../screens/SettingsScreen';
import HelpScreen       from '../screens/HelpScreen';
import AboutScreen      from '../screens/AboutScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, radius, fontSizes, shadows } from '../constants/theme';

const Drawer = createDrawerNavigator();

const DRAWER_ITEMS = [
  { key: 'Tabs',           label: 'Home',       emoji: '🏡', icon: 'home-outline' },
  { key: 'DrawerStats',    label: 'Progress',   emoji: '📊', icon: 'bar-chart-outline' },
  { key: 'DrawerSettings', label: 'Settings',   emoji: '⚙️', icon: 'settings-outline' },
  { key: 'DrawerHelp',     label: 'Help',       emoji: '🍃', icon: 'help-circle-outline' },
  { key: 'DrawerAbout',    label: 'About',      emoji: '🌸', icon: 'information-circle-outline' },
  { key: 'Logout',         label: 'Logout',     emoji: '🚪', icon: 'log-out-outline' },
];

// Tiny blinking firefly
function DrawerFirefly({ x, y, delay }) {
  const opac = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opac, { toValue: 0.9, duration: 700, useNativeDriver: true }),
        Animated.timing(opac, { toValue: 0.1, duration: 1100, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute', left: x, top: y,
        width: 5, height: 5, borderRadius: 2.5,
        backgroundColor: colors.firefly,
        opacity: opac,
      }}
    />
  );
}

function CustomDrawerContent(props) {
  const { navigation, state } = props;
  const { logout } = useAuth();
  const activeRouteName = state.routeNames[state.index];

  const handlePress = (item) => {
    if (item.key === 'Logout') {
      // A destructive action gets a confirmation, same pattern as deleting a
      // task — logging out isn't reversible from the user's point of view
      // (they'll land back on the sign-in screen), so a stray tap shouldn't
      // do it silently.
      Alert.alert(
        'Log out?',
        "You'll need to sign in again to get back to your forest.",
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Log Out',
            style: 'destructive',
            onPress: () => {
              // Clearing the session flips isAuthed in AuthContext, which is
              // what RootNavigator actually watches — it swaps to the
              // logged-out branch on its own, no manual reset needed.
              logout();
            },
          },
        ],
      );
      return;
    }
    navigation.navigate(item.key);
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with nature background */}
      <ImageBackground
        source={require('../../assets/images/drawer_bg.jpg')}
        style={styles.drawerHeader}
        imageStyle={styles.drawerHeaderImg}
      >
        <View style={styles.drawerHeaderOverlay} />
        {/* Fireflies */}
        <DrawerFirefly x={30}  y={20} delay={0}    />
        <DrawerFirefly x={180} y={35} delay={800}  />
        <DrawerFirefly x={100} y={15} delay={400}  />
        <DrawerFirefly x={220} y={60} delay={1200} />

        {/* Companion in header */}
        <Image
          source={require('../../assets/images/spirit_buddy.png')}
          style={styles.drawerCompanion}
          resizeMode="contain"
        />
        <Text style={styles.drawerName}>My Forest</Text>
        <Text style={styles.drawerSub}>✦ Florassence ✦</Text>
      </ImageBackground>

      {/* Nav items */}
      <View style={styles.navSection}>
        {DRAWER_ITEMS.map((item) => {
          const isActive = activeRouteName === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => handlePress(item)}
              style={({ pressed }) => [
                styles.navItem,
                isActive && styles.navItemActive,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.navEmoji}>{item.emoji}</Text>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {item.label}
              </Text>
              {isActive && <View style={styles.navActiveDot} />}
            </Pressable>
          );
        })}
      </View>

      <View style={{ flex: 1 }} />

      {/* Footer */}
      <View style={styles.drawerFooter}>
        <View style={styles.divider} />
        <View style={styles.footerNature}>
          {['🌿','🌸','🍄','🌼','🌱'].map((l,i) => (
            <Text key={i} style={{ fontSize: 16, opacity: 0.5 }}>{l}</Text>
          ))}
        </View>
        <Text style={styles.footerQuote}>"Even the darkest night will end and the sun will rise."</Text>
      </View>
    </DrawerContentScrollView>
  );
}

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: styles.drawer,
        swipeEdgeWidth: 60,
      }}
    >
      <Drawer.Screen name="Tabs"             component={BottomTabs} />
      <Drawer.Screen name="DrawerStats"      component={StatisticsScreen} />
      <Drawer.Screen name="DrawerSettings"   component={SettingsScreen} />
      <Drawer.Screen name="DrawerHelp"       component={HelpScreen} />
      <Drawer.Screen name="DrawerAbout"      component={AboutScreen} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawer: { width: 290, backgroundColor: colors.background },
  drawerContent: { flex: 1 },

  // Header
  drawerHeader: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: spacing.lg,
  },
  drawerHeaderImg: { resizeMode: 'cover' },
  drawerHeaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(14,26,14,0.45)',
  },
  drawerCompanion: {
    width: 54, height: 54, marginBottom: 4,
  },
  drawerName: { fontSize: fontSizes.sub, fontWeight: '700', color: colors.textInverse },
  drawerSub:  { fontSize: fontSizes.xs,  color: 'rgba(245,237,216,0.70)', marginTop: 2 },

  // Nav
  navSection: { paddingTop: spacing.md, paddingHorizontal: spacing.md },
  navItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.md, paddingHorizontal: spacing.md,
    borderRadius: radius.lg, marginVertical: 2,
  },
  navItemActive: { backgroundColor: colors.primarySoft },
  navEmoji: { fontSize: 18, width: 26, textAlign: 'center' },
  navLabel: { flex: 1, fontSize: fontSizes.body, fontWeight: '500', color: colors.textMuted },
  navLabelActive: { color: colors.primary, fontWeight: '700' },
  navActiveDot: {
    width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.primary,
  },

  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.xl, marginBottom: spacing.md },
  drawerFooter: { paddingBottom: spacing.xxxl },
  footerNature: {
    flexDirection: 'row', justifyContent: 'center',
    gap: spacing.sm, marginBottom: spacing.sm,
  },
  footerQuote: {
    fontSize: fontSizes.xxs, color: colors.textDisabled,
    textAlign: 'center', fontStyle: 'italic', paddingHorizontal: spacing.xl,
  },
});
