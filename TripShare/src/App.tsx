import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { navigationRef } from './navigation/RootNavigation';
import AuthInitializer from './components/AuthInitializer';

export default function App() {
  return (
    <AuthInitializer>
      <NavigationContainer ref={navigationRef}>
        <AppNavigator />
      </NavigationContainer>
    </AuthInitializer>
  );
} 