import React from 'react';
import { useAuth } from '../../src/hooks/useAuth';
import StoriesScreen from '../../src/screens/StoriesScreen';
import { Redirect } from 'expo-router';

export default function StoriesTab() {
  const { user } = useAuth();
  if (!user) return <Redirect href="/" />;
  return <StoriesScreen userId={user.id} />;
}
