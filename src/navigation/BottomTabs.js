import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeStack      from './HomeStack';
import SearchStack    from './SearchStack';
import FavoritesStack from './FavoritesStack';
import ProfileStack   from './ProfileStack';
import { colors, fontSizes, shadows } from '../constants/theme';

const Tab = createBottomTabNavigator();

const TAB_CONFIG = {
  HomeStack:      { icon: 'home',    label: 'Home',      emoji: '🏡' },
  SearchStack:    { icon: 'search',  label: 'Search',    emoji: '🔍' },
  FavoritesStack: { icon: 'heart',   label: 'Saved',     emoji: '🌸' },
  ProfileStack:   { icon: 'person',  label: 'Profile',   emoji: '🌿' },
};

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const cfg = TAB_CONFIG[route.name];
        return {
          headerShown: false,
          tabBarShowLabel: false,
          tabBarActiveTintColor:   colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: styles.tabBar,
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.tabItem, focused && styles.tabItemActive]}>
              {focused
                ? <Text style={styles.tabEmoji}>{cfg.emoji}</Text>
                : <Ionicons name={`${cfg.icon}-outline`} size={21} color={color} />
              }
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                {cfg.label}
              </Text>
            </View>
          ),
        };
      }}
    >
      <Tab.Screen name="HomeStack"      component={HomeStack} />
      <Tab.Screen name="SearchStack"    component={SearchStack} />
      <Tab.Screen name="FavoritesStack" component={FavoritesStack} />
      <Tab.Screen name="ProfileStack"   component={ProfileStack} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 26 : 8,
    ...shadows.md,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    gap: 2,
    minWidth: 56,
  },
  tabItemActive: {
    backgroundColor: colors.primarySoft,
  },
  tabEmoji: { fontSize: 20 },
  tabLabel: {
    fontSize: fontSizes.xxs,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 1,
  },
  tabLabelActive: { color: colors.primary },
});

/* We use stacks inside tabs because each tab has its own navigation history*/