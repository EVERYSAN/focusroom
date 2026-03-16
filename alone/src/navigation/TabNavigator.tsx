import React, { useState, useEffect, useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';
import { colors, fontSize } from '../lib/theme';
import { Profile } from '../types/database';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import StoriesScreen from '../screens/StoriesScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

type TabIconProps = {
  label: string;
  focused: boolean;
};

function TabIcon({ label, focused }: TabIconProps) {
  return (
    <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      {label}
    </Text>
  );
}

type Props = {
  userId: string;
  profile: Profile | null;
  onSignOut: () => Promise<void>;
};

export default function TabNavigator({ userId, profile, onSignOut }: Props) {
  const [followingIds, setFollowingIds] = useState<string[]>([]);

  const fetchFollowing = useCallback(async () => {
    const { data } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);
    setFollowingIds((data ?? []).map((f) => f.following_id));
  }, [userId]);

  useEffect(() => {
    fetchFollowing();
  }, [fetchFollowing]);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        headerStyle: styles.header,
        headerTintColor: colors.text,
        headerTitleStyle: styles.headerTitle,
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          title: 'ホーム',
          tabBarIcon: ({ focused }) => <TabIcon label="H" focused={focused} />,
        }}
      >
        {() => <HomeScreen userId={userId} />}
      </Tab.Screen>

      <Tab.Screen
        name="Stories"
        options={{
          title: 'ストーリー',
          tabBarIcon: ({ focused }) => <TabIcon label="S" focused={focused} />,
        }}
      >
        {() => <StoriesScreen userId={userId} />}
      </Tab.Screen>

      <Tab.Screen
        name="Search"
        options={{
          title: '検索',
          tabBarIcon: ({ focused }) => <TabIcon label="?" focused={focused} />,
        }}
      >
        {() => (
          <SearchScreen
            userId={userId}
            followingIds={followingIds}
            onFollowChanged={fetchFollowing}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Notifications"
        options={{
          title: '通知',
          tabBarIcon: ({ focused }) => <TabIcon label="!" focused={focused} />,
        }}
      >
        {() => <NotificationsScreen userId={userId} />}
      </Tab.Screen>

      <Tab.Screen
        name="Profile"
        options={{
          title: 'プロフィール',
          tabBarIcon: ({ focused }) => <TabIcon label="@" focused={focused} />,
        }}
      >
        {() => (
          <ProfileScreen
            userId={userId}
            profile={profile}
            onSignOut={onSignOut}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
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
  tabIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMuted,
  },
  tabIconFocused: {
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
