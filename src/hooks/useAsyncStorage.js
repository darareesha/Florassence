
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function useAsyncStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(initialValue);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(key)
      .then((raw) => {
        if (!active) return;
        if (raw !== null) {
          try { setStoredValue(JSON.parse(raw)); } catch { /* ignore */ }
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [key]);

  const setValue = useCallback(async (value) => {
    const next = typeof value === 'function' ? value(storedValue) : value;
    setStoredValue(next);
    try {
      await AsyncStorage.setItem(key, JSON.stringify(next));
    } catch { /* silently ignore write failures */ }
  }, [key, storedValue]);

  const removeValue = useCallback(async () => {
    setStoredValue(initialValue);
    try { await AsyncStorage.removeItem(key); } catch { /* ignore */ }
  }, [key, initialValue]);

  return [storedValue, setValue, loading, removeValue];
}
