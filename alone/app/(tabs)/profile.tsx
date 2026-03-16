import React from 'react';
import { useAuth } from '../../src/hooks/useAuth';
import { useNotificationSettings } from '../../src/hooks/useNotificationSettings';
import ProfileScreen from '../../src/screens/ProfileScreen';

export default function ProfileTab() {
  const { user, profile, signOut } = useAuth();
  const { workStartEnabled, toggleWorkStartNotifications } = useNotificationSettings();

  return (
    <ProfileScreen
      userId={user?.id ?? ''}
      profile={profile}
      onSignOut={signOut}
      workStartNotificationsEnabled={workStartEnabled}
      onToggleWorkStartNotifications={toggleWorkStartNotifications}
    />
  );
}
