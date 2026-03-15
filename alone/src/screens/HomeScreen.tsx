import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { colors, spacing, fontSize, borderRadius } from '../lib/theme';
import { StatusWithProfile } from '../types/database';
import StatusCard from '../components/StatusCard';

type Props = {
  userId: string;
};

export default function HomeScreen({ userId }: Props) {
  const [statuses, setStatuses] = useState<StatusWithProfile[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [myActiveStatus, setMyActiveStatus] = useState<StatusWithProfile | null>(null);
  const [posting, setPosting] = useState(false);

  const fetchTimeline = useCallback(async () => {
    // Get user IDs that I follow
    const { data: followData } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    const followingIds = (followData ?? []).map((f) => f.following_id);
    // Include own statuses
    const allIds = [...followingIds, userId];

    const { data } = await supabase
      .from('statuses')
      .select('*, profiles(*)')
      .in('user_id', allIds)
      .order('is_active', { ascending: false })
      .order('started_at', { ascending: false })
      .limit(50);

    const typed = (data ?? []) as StatusWithProfile[];
    setStatuses(typed);

    const mine = typed.find((s) => s.user_id === userId && s.is_active);
    setMyActiveStatus(mine ?? null);
  }, [userId]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('statuses-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'statuses' },
        () => fetchTimeline()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTimeline]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTimeline();
    setRefreshing(false);
  };

  const handleStartStatus = async () => {
    const text = statusText.trim();
    if (!text) {
      Alert.alert('入力エラー', '今日やることを入力してください');
      return;
    }
    if (text.length > 100) {
      Alert.alert('入力エラー', '100文字以内で入力してください');
      return;
    }

    setPosting(true);
    try {
      // End current active status if exists
      if (myActiveStatus) {
        await supabase
          .from('statuses')
          .update({ is_active: false, ended_at: new Date().toISOString() })
          .eq('id', myActiveStatus.id);
      }

      const { error } = await supabase.from('statuses').insert({
        user_id: userId,
        content: text,
        is_active: true,
      });
      if (error) throw error;

      setStatusText('');
      await fetchTimeline();
    } catch (err: any) {
      Alert.alert('エラー', err.message ?? '投稿に失敗しました');
    } finally {
      setPosting(false);
    }
  };

  const handleEndStatus = async () => {
    if (!myActiveStatus) return;
    try {
      await supabase
        .from('statuses')
        .update({ is_active: false, ended_at: new Date().toISOString() })
        .eq('id', myActiveStatus.id);
      await fetchTimeline();
    } catch (err: any) {
      Alert.alert('エラー', err.message ?? '終了に失敗しました');
    }
  };

  const handleWorkTogether = async (statusId: string, receiverId: string) => {
    try {
      const { error } = await supabase.from('work_together_requests').insert({
        sender_id: userId,
        receiver_id: receiverId,
        status_id: statusId,
      });
      if (error) throw error;
      Alert.alert('送信完了', '「一緒にやろう」を送りました');
    } catch (err: any) {
      Alert.alert('エラー', err.message ?? '送信に失敗しました');
    }
  };

  const activeStatuses = statuses.filter((s) => s.is_active);
  const recentStatuses = statuses.filter((s) => !s.is_active);

  return (
    <View style={styles.container}>
      {/* Status input */}
      <View style={styles.inputSection}>
        {myActiveStatus ? (
          <View style={styles.activeStatusBar}>
            <View style={styles.activeInfo}>
              <View style={styles.activeDot} />
              <Text style={styles.activeText} numberOfLines={1}>
                {myActiveStatus.content}
              </Text>
            </View>
            <TouchableOpacity style={styles.endButton} onPress={handleEndStatus}>
              <Text style={styles.endButtonText}>終了</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="今日やること..."
              placeholderTextColor={colors.textMuted}
              value={statusText}
              onChangeText={setStatusText}
              maxLength={100}
              returnKeyType="done"
              onSubmitEditing={handleStartStatus}
            />
            <TouchableOpacity
              style={[styles.startButton, posting && styles.buttonDisabled]}
              onPress={handleStartStatus}
              disabled={posting}
            >
              <Text style={styles.startButtonText}>開始</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <FlatList
        data={[...activeStatuses, ...recentStatuses]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <StatusCard
            status={item}
            isOwnStatus={item.user_id === userId}
            onWorkTogether={() => handleWorkTogether(item.id, item.user_id)}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.textMuted}
          />
        }
        ListHeaderComponent={
          activeStatuses.length > 0 ? (
            <Text style={styles.sectionTitle}>作業中</Text>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>まだ誰もいません</Text>
            <Text style={styles.emptyText}>
              作業を始めるか、他のユーザーをフォローしましょう
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
  inputSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: fontSize.md,
    color: colors.text,
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  startButtonText: {
    color: colors.bg,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  activeStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.statusActive + '40',
  },
  activeInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.statusActive,
  },
  activeText: {
    color: colors.text,
    fontSize: fontSize.md,
    flex: 1,
  },
  endButton: {
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  endButtonText: {
    color: colors.error,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  list: {
    padding: spacing.md,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
  },
});
