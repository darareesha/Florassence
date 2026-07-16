import { useEffect, useRef, useState } from 'react';
// Appstate tells u the current state of the app. If it is active then uses background else foreground
import { AppState } from 'react-native';

export default function useAppState({ onForeground, onBackground } = {}) {
  const [appState, setAppState] = useState(AppState.currentState);
  const prevState = useRef(appState);

  const onForegroundRef = useRef(onForeground);
  const onBackgroundRef = useRef(onBackground);
  onForegroundRef.current = onForeground;
  onBackgroundRef.current = onBackground;

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => {
      const prev = prevState.current;
      const cameToForeground = /inactive|background/.test(prev) && next === 'active';
      const wentToBackground = prev === 'active' && /inactive|background/.test(next);

      if (cameToForeground) onForegroundRef.current?.();
      if (wentToBackground) onBackgroundRef.current?.();

      prevState.current = next;
      setAppState(next);
    });

    return () => subscription.remove();
  }, []);

  return appState;
}
/*
This file is for the detection of app state whether it is active or inactive when for eg, the user minimizes the app.
So instead of writing this for every screen, we write it once and reuse it. 
*/