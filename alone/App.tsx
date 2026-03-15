import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Alone</Text>
      <Text style={styles.tagline}>動作テスト中...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 34,
    fontWeight: '700',
    color: '#e8e8e8',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 15,
    color: '#999999',
    marginTop: 8,
  },
});
