
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
{/*We know that different screens, have different screen layouts so for this, we use safearea which tells that this much
  area must be left around the screen so it doesn't cuts out anything. */}
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
{/* This checks whether the device is connected to the internet.*/}
import useNetworkStatus from '../hooks/useNetworkStatus';
import useTheme from '../hooks/useTheme';
import { spacing, fontSizes } from '../constants/theme';

export default function OfflineBanner() {
  const insets = useSafeAreaInsets();
  const { isConnected } = useNetworkStatus();
  const { colors } = useTheme();

  if (isConnected) return null; {/* This means that the banner will never be displayed to the user because it is connected to the internet*/}

  return (
    <View pointerEvents="none" style={[styles.wrap, { top: insets.top, backgroundColor: colors.warningSoft, borderBottomColor: colors.border }]}>
      <Ionicons name="cloud-offline-outline" size={13} color={colors.warning} />
      <Text style={[styles.text, { color: colors.warning }]}>Offline — showing saved data</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute', left: 0, right: 0, zIndex: 999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.xs, paddingVertical: 5, borderBottomWidth: 1,
  },
  text: { fontSize: fontSizes.xxs, fontWeight: '700' },
});
{/* 
  This component is a reusable offline status banner. Incase the internet connection is not available,
  it automatically displays a small banner at the top of the screen when the user is offline. 
  The banner informs the user that the app is currently showing previously saved data instead of live data. 
  When the internet connection is restored, the banner disappears automatically.   

  pointerevents mean that we can't to actions like tap, log tap and all
  */}