import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { colors, spacing, fontSize, borderRadius } from '../lib/theme';
import { WorkTogetherRequestWithProfiles, StatusWithProfile } from '../types/database';

type Props = {
  userId: string;
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'たった今';
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  return `${Math.floor(hours / 24)}日前`;
}

type NotificationItem =
  | { type: 'work_together'; data: WorkTogetherRequestWithProfiles }
  | { type: 'work_start'; data: StatusWithProfile };

export default function NotificationsScreen({ userId }: Props) {
  const [requests, setRequests] = useState<WorkTogetherRequestWithProfiles[]>([]);
  const [workStarts, setWorkStarts] = useState<StatusWithProfile[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = useCallback(async () => {
    const { data } = await supabase
      .from('work_together_requests')
      .select('*, sender:profiles!work_together_requests_sender_id_fkey(*), statuses(*)')
      .eq('receiver_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    setRequests((data ?? []) as WorkTogetherRequestWithProfiles[]);

    // Mark all as read
    await supabase
      .from('work_together_requests')
      .update({ is_read: true })
      .eq('receiver_id', userId)
      .eq('is_read', false);
  }, [userId]);

  const fetchWorkStarts = useCallback(async () => {
    // Get followed user IDs
    const { data: followData } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    const followingIds = (followData ?? []).map((f) => f.following_id);
    if (followingIds.length === 0) {
      setWorkStarts([]);
      return;
    }

    // Recent active statuses from followed users (last 24h)
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('statuses')
      .select('*, profiles(*)')
      .in('user_id', followingIds)
      .gte('started_at', since)
      .order('started_at', { ascending: false })
      .limit(20);

    setWorkStarts((data ?? []) as StatusWithProfile[]);
  }, [userId]);

  useEffect(() => {
    fetchRequests();
    fetchWorkStarts();
  }, [fetchRequests, fetchWorkStarts]);

  useEffect(() => {
    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'work_together_requests',
          filter: `receiver_id=eq.${userId}`,
        },
        () => fetchRequests()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRequests, userId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchRequests(), fetchWorkStarts()]);
    setRefreshing(false);
  };

  // Merge and sort all notifications by time
  const allNotifications: NotificationItem[] = [
    ...requests.map((r) => ({ type: 'work_together' as const, data: r })),
    ...workStarts.map((s) => ({ type: 'work_start' as const, data: s })),
  ].sort((a, b) => {
    const timeA = a.type === 'work_together' ? a.data.created_at : a.data.started_at;
    const timeB = b.type === 'work_together' ? b.data.created_at : b.data.started_at;
    return new Date(timeB).getTime() - new Date(timeA).getTime();
  });

  const renderNotification = ({ item }: { item: NotificationItem }) => {
    if (item.type === 'work_together') {
      const req = item.data;
      const senderName = req.sender.display_name ?? req.sender.username;
      return (
        <View style={[styles.card, !req.is_read && styles.cardUnread]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {senderName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.content}>
            <Text style={styles.text}>
              <Text style={styles.bold}>{senderName}</Text>
              {' が「一緒にやろう」と言っています'}
            </Text>
            {req.statuses && (
              <Text style={styles.statusRef} numberOfLines={1}>
                {req.statuses.content}
              </Text>
            )}
            <Text style={styles.time}>{timeAgo(req.created_at)}</Text>
          </View>
        </View>
      );
    }

    // work_start
    const status = item.data;
    const name = status.profiles.display_name ?? status.profiles.username;
    return (
      <View style={[styles.card, styles.cardWorkStart]}>
        <View style={[styles.avatar, styles.avatarWorkStart]}>
          <Text style={styles.avatarText}>
            {name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.text}>
            <Text style={styles.bold}>{name}</Text>
            {'が'}
            <Text style={styles.bold}>{status.content}</Text>
            {'を始めました 💪'}
          </Text>
          <Text style={styles.time}>{timeAgo(status.started_at)}</Text>
        </View>
        {status.is_active && <View style={styles.activeDot} />}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={allNotifications}
        keyExtractor={(item) =>
          item.type === 'work_together'
            ? `wt-${item.data.id}`
            : `ws-${item.data.id}`
        }
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.textMuted}
          />
        }
        renderItem={renderNotification}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>通知はありません</Text>
            <Text style={styles.emptyText}>
              フォロー中の人が作業を始めるとここに表示されます
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  list: {
    padding: spacing.md,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardUnread: {
    borderColor: colors.primary + '60',
    backgroundColor: colors.primary + '08',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  text: {
    color: colors.text,
    fontSize: fontSize.md,
    lineHeight: 20,
  },
  bold: {
    fontWeight: '700',
  },
  statusRef: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: 4,
  },
  time: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 4,
  },
  cardWorkStart: {
    borderColor: colors.statusActive + '30',
  },
  avatarWorkStart: {
    backgroundColor: colors.statusActive + '20',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.statusActive,
    alignSelf: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    color: colors.textSecondary,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
