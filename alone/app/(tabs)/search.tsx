import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../src/hooks/useAuth';
import SearchScreen from '../../src/screens/SearchScreen';
import { supabase } from '../../src/lib/supabase';
import { Redirect } from 'expo-router';

export default function SearchTab() {
  const { user } = useAuth();
  const [followingIds, setFollowingIds] = useState<string[]>([]);

  const fetchFollowing = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id);
    setFollowingIds((data ?? []).map((f: any) => f.following_id));
  }, [user]);

  useEffect(() => {
    fetchFollowing();
  }, [fetchFollowing]);

  if (!user) return <Redirect href="/" />;

  return (
    <SearchScreen
      userId={user.id}
      followingIds={followingIds}
      onFollowChanged={fetchFollowing}
    />
  );
}
