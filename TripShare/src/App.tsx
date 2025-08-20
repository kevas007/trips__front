import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { navigationRef } from './navigation/RootNavigation';
import { SimpleAuthProvider } from './contexts/SimpleAuthContext';

export default function App() {
  return (
    <SimpleAuthProvider>
      <NavigationContainer ref={navigationRef}>
        <AppNavigator />
      </NavigationContainer>
    </SimpleAuthProvider>
  );
} 