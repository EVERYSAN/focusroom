import React from 'react';
import { useAuth } from '../../src/hooks/useAuth';
import HomeScreen from '../../src/screens/HomeScreen';

export default function HomeTab() {
  const { user } = useAuth();
  // user は _layout.tsx の認証ゲートで保証されている
  return <HomeScreen userId={user?.id ?? ''} />;
}
