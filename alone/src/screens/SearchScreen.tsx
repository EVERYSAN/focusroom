import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { colors, spacing, fontSize, borderRadius } from '../lib/theme';
import { Profile } from '../types/database';

type Props = {
  userId: string;
  followingIds: string[];
  onFollowChanged: () => void;
};

export default function SearchScreen({ userId, followingIds, onFollowChanged }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
        .neq('id', userId)
        .limit(20);

      if (error) throw error;
      setResults(data ?? []);
    } catch (err: any) {
      Alert.alert('エラー', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (targetId: string) => {
    try {
      const { error } = await supabase.from('follows').insert({
        follower_id: userId,
        following_id: targetId,
      });
      if (error) throw error;
      onFollowChanged();
    } catch (err: any) {
      Alert.alert('エラー', err.message);
    }
  };

  const handleUnfollow = async (targetId: string) => {
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', userId)
        .eq('following_id', targetId);
      if (error) throw error;
      onFollowChanged();
    } catch (err: any) {
      Alert.alert('エラー', err.message);
    }
  };

  const isFollowing = (id: string) => followingIds.includes(id);

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="ユーザーを検索..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>検索</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.userCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(item.display_name ?? item.username).charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.displayName}>
                  {item.display_name ?? item.username}
                </Text>
                <Text style={styles.username}>@{item.username}</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.followButton,
                  isFollowing(item.id) && styles.followingButton,
                ]}
                onPress={() =>
                  isFollowing(item.id)
                    ? handleUnfollow(item.id)
                    : handleFollow(item.id)
                }
              >
                <Text
                  style={[
                    styles.followButtonText,
                    isFollowing(item.id) && styles.followingButtonText,
                  ]}
                >
                  {isFollowing(item.id) ? 'フォロー中' : 'フォロー'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            query.trim() ? (
              <Text style={styles.emptyText}>ユーザーが見つかりません</Text>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  searchRow: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  searchButton: {
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: colors.text,
    fontSize: fontSize.md,
  },
  loader: {
    marginTop: spacing.xl,
  },
  list: {
    padding: spacing.md,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.textSecondary,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  displayName: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  username: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  followButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  followButtonText: {
    color: colors.bg,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  followingButtonText: {
    color: colors.textSecondary,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
    fontSize: fontSize.md,
  },
});
