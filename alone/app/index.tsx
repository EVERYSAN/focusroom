import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';
import { colors } from '../src/lib/theme';
import AuthScreen from '../src/screens/AuthScreen';

export default function Index() {
  const { user, loading, signIn, signUp } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text style={styles.logo}>Alone</Text>
        <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 24 }} />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <AuthScreen onSignIn={signIn} onSignUp={signUp} />;
}

const styles = StyleSheet.create({
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
