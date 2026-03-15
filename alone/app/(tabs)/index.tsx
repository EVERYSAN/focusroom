import React from 'react';
import { useAuth } from '../../src/hooks/useAuth';
import HomeScreen from '../../src/screens/HomeScreen';
import { Redirect } from 'expo-router';

export default function HomeTab() {
  const { user } = useAuth();
  if (!user) return <Redirect href="/" />;
  return <HomeScreen userId={user.id} />;
}
