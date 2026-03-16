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
import { StoryWithProfile } from '../types/database';

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

function timeUntilExpiry(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return '期限切れ';
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `あと${hours}時間${minutes}分`;
  return `あと${minutes}分`;
}

export default function StoriesScreen({ userId }: Props) {
  const [stories, setStories] = useState<StoryWithProfile[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [storyText, setStoryText] = useState('');
  const [posting, setPosting] = useState(false);

  const fetchStories = useCallback(async () => {
    // Get following IDs
    const { data: followData } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    const followingIds = (followData ?? []).map((f) => f.following_id);
    const allIds = [...followingIds, userId];

    const { data } = await supabase
      .from('stories')
      .select('*, profiles(*)')
      .in('user_id', allIds)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    setStories((data ?? []) as StoryWithProfile[]);
  }, [userId]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  useEffect(() => {
    const channel = supabase
      .channel('stories-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'stories' },
        () => fetchStories()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStories]);

  const handlePost = async () => {
    const text = storyText.trim();
    if (!text) return;
    if (text.length > 200) {
      Alert.alert('入力エラー', '200文字以内で入力してください');
      return;
    }

    setPosting(true);
    try {
      const { error } = await supabase.from('stories').insert({
        user_id: userId,
        content: text,
      });
      if (error) throw error;
      setStoryText('');
      await fetchStories();
    } catch (err: any) {
      Alert.alert('エラー', err.message);
    } finally {
      setPosting(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStories();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* Post story input */}
      <View style={styles.inputSection}>
        <TextInput
          style={styles.input}
          placeholder="気づき・閃きを共有..."
          placeholderTextColor={colors.textMuted}
          value={storyText}
          onChangeText={setStoryText}
          maxLength={200}
          multiline
          numberOfLines={2}
        />
        <TouchableOpacity
          style={[styles.postButton, posting && styles.buttonDisabled]}
          onPress={handlePost}
          disabled={posting || !storyText.trim()}
        >
          <Text style={styles.postButtonText}>投稿</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={stories}
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
          const displayName = item.profiles.display_name ?? item.profiles.username;
          return (
            <View style={styles.storyCard}>
              <View style={styles.storyHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.storyMeta}>
                  <Text style={styles.storyName}>{displayName}</Text>
                  <Text style={styles.storyTime}>{timeAgo(item.created_at)}</Text>
                </View>
                <Text style={styles.expiryText}>
                  {timeUntilExpiry(item.expires_at)}
                </Text>
              </View>
              <Text style={styles.storyContent}>{item.content}</Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>ストーリーはまだありません</Text>
            <Text style={styles.emptyText}>
              作業中の気づきや閃きを共有しましょう
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
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  input: {
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: fontSize.md,
    color: colors.text,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  postButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  postButtonText: {
    color: colors.bg,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  list: {
    padding: spacing.md,
  },
  storyCard: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  storyMeta: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  storyName: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  storyTime: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  expiryText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  storyContent: {
    color: colors.text,
    fontSize: fontSize.md,
    lineHeight: 22,
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
