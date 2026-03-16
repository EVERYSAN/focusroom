import React from 'react';
import { useAuth } from '../../src/hooks/useAuth';
import StoriesScreen from '../../src/screens/StoriesScreen';

export default function StoriesTab() {
  const { user } = useAuth();
  return <StoriesScreen userId={user?.id ?? ''} />;
}
