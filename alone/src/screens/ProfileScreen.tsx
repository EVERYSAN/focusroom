import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { colors, spacing, fontSize, borderRadius } from '../lib/theme';
import { Profile } from '../types/database';

type Props = {
  userId: string;
  profile: Profile | null;
  onSignOut: () => Promise<void>;
};

export default function ProfileScreen({ userId, profile, onSignOut }: Props) {
  const [stats, setStats] = useState({ followers: 0, following: 0, statuses: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [followers, following, statuses] = await Promise.all([
        supabase
          .from('follows')
          .select('id', { count: 'exact', head: true })
          .eq('following_id', userId),
        supabase
          .from('follows')
          .select('id', { count: 'exact', head: true })
          .eq('follower_id', userId),
        supabase
          .from('statuses')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId),
      ]);

      setStats({
        followers: followers.count ?? 0,
        following: following.count ?? 0,
        statuses: statuses.count ?? 0,
      });
    };

    fetchStats();
  }, [userId]);

  const handleSignOut = () => {
    Alert.alert('ログアウト', '本当にログアウトしますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: 'ログアウト', style: 'destructive', onPress: onSignOut },
    ]);
  };

  const displayName = profile?.display_name ?? profile?.username ?? '...';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>
            {displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.displayName}>{displayName}</Text>
        {profile?.username && (
          <Text style={styles.username}>@{profile.username}</Text>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.following}</Text>
          <Text style={styles.statLabel}>フォロー</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.followers}</Text>
          <Text style={styles.statLabel}>フォロワー</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.statuses}</Text>
          <Text style={styles.statLabel}>ステータス</Text>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>ログアウト</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    color: colors.textSecondary,
    fontSize: fontSize.xxl,
    fontWeight: '600',
  },
  displayName: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  username: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  statNumber: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  section: {
    padding: spacing.lg,
  },
  signOutButton: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  signOutText: {
    color: colors.error,
    fontSize: fontSize.md,
    fontWeight: '500',
  },
});
