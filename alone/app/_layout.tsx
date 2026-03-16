import React from 'react';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { colors } from '../src/lib/theme';
import { useAuth } from '../src/hooks/useAuth';
import { useNotificationSettings } from '../src/hooks/useNotificationSettings';
import { useWorkStartNotifications } from '../src/hooks/useWorkStartNotifications';

export default function RootLayout() {
  const { user } = useAuth();
  const { workStartEnabled } = useNotificationSettings();

  // フォロー中ユーザーの作業開始をリアルタイム検知 → プッシュ通知
  useWorkStartNotifications(user?.id ?? null, workStartEnabled);

  return (
    <View style={styles.container}>
      <Slot />
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
