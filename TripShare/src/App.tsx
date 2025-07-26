import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { SimpleAuthProvider } from './contexts/SimpleAuthContext';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { navigationRef } from './navigation/RootNavigation';

export default function App() {
  return (
    <SimpleAuthProvider>
      <ThemeProvider>
        <NavigationContainer ref={navigationRef}>
          <AppNavigator />
        </NavigationContainer>
      </ThemeProvider>
    </SimpleAuthProvider>
  );
} 