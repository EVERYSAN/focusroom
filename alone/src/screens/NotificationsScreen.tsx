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
import { WorkTogetherRequestWithProfiles } from '../types/database';

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

export default function NotificationsScreen({ userId }: Props) {
  const [requests, setRequests] = useState<WorkTogetherRequestWithProfiles[]>([]);
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

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

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
    await fetchRequests();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.textMuted}
          />
        }
        renderItem={({ item }) => {
          const senderName = item.sender.display_name ?? item.sender.username;
          return (
            <View style={[styles.card, !item.is_read && styles.cardUnread]}>
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
                {item.statuses && (
                  <Text style={styles.statusRef} numberOfLines={1}>
                    {item.statuses.content}
                  </Text>
                )}
                <Text style={styles.time}>{timeAgo(item.created_at)}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>通知はありません</Text>
            <Text style={styles.emptyText}>
              誰かが「一緒にやろう」と言うとここに表示されます
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
