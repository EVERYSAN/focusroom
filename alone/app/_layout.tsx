import React from 'react';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../src/lib/theme';
import { useAuth } from '../src/hooks/useAuth';
import { useNotificationSettings } from '../src/hooks/useNotificationSettings';
import { useWorkStartNotifications } from '../src/hooks/useWorkStartNotifications';
import AuthScreen from '../src/screens/AuthScreen';

export default function RootLayout() {
  const { user, loading, signIn, signUp } = useAuth();
  const { workStartEnabled } = useNotificationSettings();

  // フォロー中ユーザーの作業開始をリアルタイム検知 → プッシュ通知
  useWorkStartNotifications(user?.id ?? null, workStartEnabled);

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text style={styles.logo}>Alone</Text>
        <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 24 }} />
        <StatusBar style="light" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <AuthScreen onSignIn={signIn} onSignUp={signUp} />
        <StatusBar style="light" />
      </View>
    );
  }

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
  loading: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 2,
  },
});
