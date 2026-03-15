import React from 'react';
import { Tabs } from 'expo-router';
import { Text, StyleSheet } from 'react-native';
import { colors, fontSize } from '../../src/lib/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        headerStyle: styles.header,
        headerTintColor: colors.text,
        headerTitleStyle: styles.headerTitle,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'ホーム',
          tabBarIcon: ({ focused }) => (
            <Text style={[styles.icon, focused && styles.iconFocused]}>H</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="stories"
        options={{
          title: 'ストーリー',
          tabBarIcon: ({ focused }) => (
            <Text style={[styles.icon, focused && styles.iconFocused]}>S</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: '検索',
          tabBarIcon: ({ focused }) => (
            <Text style={[styles.icon, focused && styles.iconFocused]}>?</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: '通知',
          tabBarIcon: ({ focused }) => (
            <Text style={[styles.icon, focused && styles.iconFocused]}>!</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'プロフィール',
          tabBarIcon: ({ focused }) => (
            <Text style={[styles.icon, focused && styles.iconFocused]}>@</Text>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.bgSecondary,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 80,
    paddingBottom: 20,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  icon: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMuted,
  },
  iconFocused: {
    color: colors.primary,
  },
  header: {
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTitle: {
    fontWeight: '600',
    fontSize: fontSize.lg,
  },
});
