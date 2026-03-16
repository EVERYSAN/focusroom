import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

// Use AsyncStorage on web, SecureStore on native
let storageGet: (key: string) => Promise<string | null>;
let storageSet: (key: string, value: string) => Promise<void>;

if (Platform.OS === 'web') {
  storageGet = async (key) => localStorage.getItem(key);
  storageSet = async (key, value) => localStorage.setItem(key, value);
} else {
  const SecureStore = require('expo-secure-store');
  storageGet = (key: string) => SecureStore.getItemAsync(key);
  storageSet = (key: string, value: string) => SecureStore.setItemAsync(key, value);
}

const STORAGE_KEY = 'alone_work_start_notifications';

export function useNotificationSettings() {
  const [workStartEnabled, setWorkStartEnabled] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    storageGet(STORAGE_KEY).then((value) => {
      if (value !== null) {
        setWorkStartEnabled(value === 'true');
      }
      setLoaded(true);
    });
  }, []);

  const toggleWorkStartNotifications = async (value: boolean) => {
    setWorkStartEnabled(value);
    await storageSet(STORAGE_KEY, String(value));
  };

  return { workStartEnabled, toggleWorkStartNotifications, loaded };
}
