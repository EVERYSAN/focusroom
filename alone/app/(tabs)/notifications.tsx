import React from 'react';
import { useAuth } from '../../src/hooks/useAuth';
import NotificationsScreen from '../../src/screens/NotificationsScreen';
import { Redirect } from 'expo-router';

export default function NotificationsTab() {
  const { user } = useAuth();
  if (!user) return <Redirect href="/" />;
  return <NotificationsScreen userId={user.id} />;
}
