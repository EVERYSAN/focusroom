import { useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { supabase } from '../lib/supabase';

// Configure how notifications are displayed when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  // For Android, set notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('work-start', {
      name: '作業開始通知',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 100],
      lightColor: '#6c8cff',
    });
  }

  return 'local'; // We use local notifications, not push tokens
}

/**
 * Hook: フォロー中ユーザーの作業開始をSupabase Realtimeで検知し、
 * Expo Notificationsでローカル通知を送る。
 */
export function useWorkStartNotifications(
  userId: string | null,
  enabled: boolean = true
) {
  const followingIdsRef = useRef<Set<string>>(new Set());

  // Fetch following list
  const refreshFollowing = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);
    followingIdsRef.current = new Set((data ?? []).map((f) => f.following_id));
  }, [userId]);

  useEffect(() => {
    if (!userId || !enabled) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setup = async () => {
      await registerForPushNotifications();
      await refreshFollowing();

      // Subscribe to new statuses via Supabase Realtime
      channel = supabase
        .channel('work-start-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'statuses',
          },
          async (payload) => {
            const newStatus = payload.new as {
              id: string;
              user_id: string;
              content: string;
              is_active: boolean;
            };

            // Only notify for followed users' active statuses (not own)
            if (
              !newStatus.is_active ||
              newStatus.user_id === userId ||
              !followingIdsRef.current.has(newStatus.user_id)
            ) {
              return;
            }

            // Get the user's profile for the notification
            const { data: profile } = await supabase
              .from('profiles')
              .select('display_name, username')
              .eq('id', newStatus.user_id)
              .single();

            const name = profile?.display_name ?? profile?.username ?? '誰か';

            await Notifications.scheduleNotificationAsync({
              content: {
                title: 'Alone',
                body: `${name}が${newStatus.content}を始めました 💪`,
                data: {
                  type: 'work_start',
                  statusId: newStatus.id,
                  userId: newStatus.user_id,
                },
                ...(Platform.OS === 'android'
                  ? { channelId: 'work-start' }
                  : {}),
              },
              trigger: null, // Immediate
            });
          }
        )
        .subscribe();
    };

    setup();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId, enabled, refreshFollowing]);

  return { refreshFollowing };
}
