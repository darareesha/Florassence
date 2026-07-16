// ─── Permission Helpers ───────────────────────────────────────────────────────
// A permission request on both Android and iOS resolves to one of three real
// outcomes, and screens should treat all three differently:
//   1. granted  — proceed.
//   2. denied, but canAskAgain — the OS dialog can be shown again later;
//      no need to nag, just let the user retry the action.
//   3. denied AND canAskAgain === false ("blocked") — the OS will no longer
//      show its own prompt. The only way forward is the Settings app, so we
//      offer to open it directly instead of silently failing.
// Keeping that logic in one place means every screen that asks for a
// permission (camera, photo library, location, …) handles denial consistently.

import { Alert, Linking } from 'react-native';

export function openAppSettings() {
  return Linking.openSettings();
}

// Normalises an Expo permission response into 'granted' | 'denied' | 'blocked'.
export function permissionOutcome(response) {
  if (!response) return 'denied';
  if (response.granted || response.status === 'granted') return 'granted';
  if (response.canAskAgain === false) return 'blocked';
  return 'denied';
}

// Shows the "you'll need to enable this in Settings" prompt with a direct
// shortcut, instead of leaving the user stuck after a permanent denial.
export function promptOpenSettings(message) {
  Alert.alert(
    'Permission needed',
    message,
    [
      { text: 'Not now', style: 'cancel' },
      { text: 'Open Settings', onPress: openAppSettings },
    ],
  );
}
