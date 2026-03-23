import React from 'react';
import { useAuth } from '../../src/hooks/useAuth';
import NotificationsScreen from '../../src/screens/NotificationsScreen';

export default function NotificationsTab() {
  const { user } = useAuth();
  return <NotificationsScreen userId={user?.id ?? ''} />;
}
